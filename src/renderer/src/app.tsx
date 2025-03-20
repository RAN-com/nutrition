import Navigation from './navigation'
import React from 'react'
import { errorToast, successToast } from './utils/toast'
import RestartModal from './components/modal/restart'
import { useAppSelector, useAppDispatch } from './redux/store/hook'
import { Button, Dialog, Modal, Typography, debounce, styled } from '@mui/material'
import PaymentSecure from '@renderer/assets/payment-waiting.png'
import PaymentWaiting from '@renderer/assets/payment-pending.png'
import PaymentSuccess from '@renderer/assets/payment-success.png'
import PaymentFailure from '@renderer/assets/payment-failure.png'

import { SERVER_URL } from './constants/value'
import { getPendingOrders, setOrderPendingData } from './redux/features/pricing/slice'
import moment, { Moment } from 'moment'
import { CreateAdminPayment } from './types/payment'
import CustomTypography from './components/typography'
import { deleteOrder } from './firebase/pricing'
import { updateCardValidity } from './firebase/card'
import { addTransaction, setAdminSubscription } from './firebase'
import { asyncGetCurrentStaffDomainData } from './redux/features/user/staff'
import zIndex from '@mui/material/styles/zIndex'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const App = () => {
  const [updateDownloaded, setUpdateDownloaded] = React.useState(false)
  const dispatch = useAppDispatch()
  const user = useAppSelector((s) => s.auth.user)
  const staff = useAppSelector((s) => s.staffs.current_staff)

  React.useEffect(() => {
    window.electron?.ipcRenderer?.on('sizeChanged', (_e, props) => {
      if (!props) return
      const parsed = JSON.parse(props) as { width: number; height: number }
      if (!parsed) return
      document.documentElement.style.setProperty('--width', `${parsed.width}px`)
      document.documentElement.style.setProperty('--height', `${parsed.height}px`)
      const root = document.getElementById('root')
      if (!root) return
      root.style.width = `${parsed.width}px`
      root.style.height = `${parsed.height}px`
    })
    window.electron?.ipcRenderer.on('updateAvailable', () => {
      const confirmDownload = window.confirm('New update available. Download now?')
      if (confirmDownload) {
        window.electron.updateResponse('startDownload')
      } else {
        alert('Updated will be downloaded for smooth experience')
        window.electron.updateResponse('startDownload')
      }
    })
    window.electron?.ipcRenderer.on('updateDownloaded', () => {
      setUpdateDownloaded(true)
    })
  }, [])
  React.useEffect(() => {
    if (user) {
      dispatch(
        getPendingOrders({
          uid: user?.uid as string,
          sid: staff?.data?.sid ?? undefined
        })
      )
    }
  }, [user, staff])

  const pendingOrder = useAppSelector((s) => s.pricing.pending_order)

  return (
    <>
      <PaymentModel open={!!pendingOrder} />
      <RestartModal
        open={updateDownloaded}
        onClose={() => {
          setUpdateDownloaded(false)
          window.electron?.updateResponse('install_later')
        }}
        onRestart={() => {
          window.electron?.updateResponse('install_now')
        }}
      />

      <Navigation />
    </>
  )
}

export default App

const images = {
  secure: PaymentSecure,
  pending: PaymentWaiting,
  paid: PaymentSuccess,
  failure: PaymentFailure
}

function timeLeft(targetTime: Moment) {
  // Get the current time
  const currentTime = moment()

  // Parse the target time (for example, "2025-03-10T14:00:00")
  const targetDate = moment(targetTime)

  // Calculate the difference
  const duration = moment.duration(targetDate.diff(currentTime))

  // Check if the target time is in the past
  if (duration.asMilliseconds() <= 0) {
    return null
  }

  const minutes = duration.minutes()
  const seconds = duration.seconds()

  return `${minutes}m ${seconds}s`
}

interface CountdownTimerProps {
  validTill: string // Expiry time in ISO format
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ validTill }) => {
  const [timeLeft, setTimeLeft] = React.useState<string>('')

  React.useEffect(() => {
    const updateTimer = () => {
      const now = moment()
      const expiry = moment(validTill)
      const diff = moment.duration(expiry.diff(now))

      if (diff.asSeconds() <= 0) {
        setTimeLeft('Expired')
        return
      }

      const minutes = diff.minutes().toString().padStart(2, '0')
      const seconds = diff.seconds().toString().padStart(2, '0')
      setTimeLeft(`${minutes}:${seconds}`)
    }

    updateTimer() // Initial call
    const interval = setInterval(updateTimer, 1000) // Update every second

    return () => clearInterval(interval) // Cleanup
  }, [validTill])

  return (
    <CustomTypography
      style={{
        fontSize: '12px',
        color: timeLeft === 'Expired' ? 'red' : 'black'
      }}
    >
      {timeLeft === 'Expired' ? 'Order Expired!' : `Time Left: ${timeLeft}`}
    </CustomTypography>
  )
}

function extractNumber(input: string): number {
  const match = input.match(/\d+/) // Find first number in the string
  return match ? parseInt(match[0], 10) : 1000
}

export const PaymentModel = ({ open }: { open: boolean }) => {
  const [loading, setLoading] = React.useState(false)
  const pendingOrder = useAppSelector((s) => s.pricing.pending_order)
  const status: CreateAdminPayment['status'] | 'secure' = pendingOrder?.status || 'secure'
  const timing = timeLeft(moment(pendingOrder?.valid_till))
  const dispatch = useAppDispatch()
  const [showTimeExceed, setShowTimeExceed] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)
  const user = useAppSelector((s) => s.auth.user)
  const staff = useAppSelector((s) => s.staffs.current_staff)
  const features = useAppSelector((s) => s.pricing.center_user)

  React.useEffect(() => {
    if (!!pendingOrder && !timing && !showTimeExceed) {
      setShowTimeExceed(true)
    }
  }, [timing])

  const handleSetSubscription = async () => {
    const sub = await updateCardValidity(
      staff?.data?.assigned_subdomain as string,
      staff?.data?.sid as string,
      moment().add(1, 'year').format('YYYY-MM-DD')
    )

    if (sub?.status) {
      // Log the transaction
      addTransaction(user?.uid as string, {
        amount: pendingOrder?.order?.amount,
        currency: pendingOrder?.order?.currency,
        order_id: pendingOrder?.order?.id,
        payment_id: pendingOrder?.payment_details?.razorpay_payment_id,
        data: sub?.data
      })
      dispatch(
        asyncGetCurrentStaffDomainData({
          domain: staff?.data?.assigned_subdomain as string
        })
      )
      successToast('Subscription activated successfully')
    } else {
      errorToast('Failed to activate subscription. Please try again')
    }
  }

  const handleAdminPayment = async () => {
    const f = features.filter((e) => e.title === pendingOrder?.pricingType)[0]
    if (!f) {
      alert('Pricing Not found. Contact admin to initialize refund process')
      // refund process here
      return
    }
    const [c, s, v] = f.features
    const customers = extractNumber(c)
    const staffs = extractNumber(s)
    const visitors = extractNumber(v)

    const sub = await setAdminSubscription({
      price: pendingOrder?.order?.amonut,
      validity: moment().add(1, 'year').format('YYYY-MM-DD'),
      type: 'SUBSCRIPTION',
      uid: user?.uid as string,
      limit: {
        customers,
        products: 100,
        staffs,
        visitors
      }
    })

    if (sub) {
      addTransaction(user?.uid as string, {
        amount: pendingOrder?.order?.amount,
        currency: pendingOrder?.order?.currency,
        order_id: pendingOrder?.order?.id,
        payment_id: pendingOrder?.payment_details?.razorpay_payment_id,
        data: sub?.data
      })
      successToast('Subscription activated successfully')
    } else {
      errorToast('Failed to activate subscription. Please try again')
    }
  }

  const onClose = async () => {
    setDeleting(true)
    await deleteOrder(`${pendingOrder?.uid}${pendingOrder?.sid ? `-${pendingOrder?.sid}` : ''}`)
    dispatch(setOrderPendingData(null))
    debounce(() => {
      setDeleting(false)
    }, 600)()
  }
  return (
    <Dialog
      open={open || showTimeExceed}
      onClose={async () => {
        if (confirm('Do you want to end this payment ??')) {
          await onClose()
        } else {
          console.log('continue')
        }
      }}
      sx={{
        '.MuiPaper-root': {
          width: '100%',
          maxWidth: '540px',
          padding: '16px 24px',
          paddingBottom: '32px',
          position: 'relative',
          top: 0
        },
        zIndex: zIndex.modal * zIndex.modal
      }}
    >
      <Modal open={deleting}>
        <></>
      </Modal>
      {showTimeExceed ? (
        <Container>
          <img src={images['failure']} alt={'payment_failure'} />
          <CustomTypography textAlign={'center'}>
            Transaction Failed due to exceeding of time limit
          </CustomTypography>
          <Button
            variant="contained"
            sx={{
              marginTop: '12px'
            }}
            onClick={async () => {
              await onClose()
            }}
          >
            GO BACK
          </Button>
        </Container>
      ) : (
        !!pendingOrder && (
          <>
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,

                zIndex: 10,
                padding: '8px 16px',
                backgroundColor: '#cececeaa',
                backdropFilter: 'blur(10px)',
                borderRadius: '0px 4px 12px 0px'
              }}
            >
              <CountdownTimer validTill={moment(pendingOrder?.valid_till).toISOString()} />
            </div>
            <Container>
              <img src={images[status]} alt={'waiting for payment'} />
              {status === 'secure' && (
                <Typography color={'grey'} variant="body2" textAlign={'center'}>
                  You're data is 100% secured and encrypted
                </Typography>
              )}
              {status === 'secure' ? (
                <Typography
                  variant="body1"
                  textAlign={'center'}
                  lineHeight={'1rem'}
                  padding={'12px 0px'}
                >
                  You will be redirected to the payment page shortly. <br />
                  If not, click below to proceed.
                </Typography>
              ) : (
                <Typography textAlign={'center'} maxWidth={'85%'}>
                  {status === 'failed'
                    ? 'Unfortunately, your payment could not be processed. This could be due to various reasons, such as insufficient funds or a temporary issue with your payment provider'
                    : status === 'pending'
                      ? 'Your payment is currently being processed. Please wait a moment.'
                      : status === 'paid' &&
                        'Thank you for your purchase! Your payment has been successfully completed.'}
                </Typography>
              )}
              {(status === 'secure' || status === 'pending') && (
                <Button
                  variant="contained"
                  sx={{ marginTop: '1.2rem' }}
                  disableElevation
                  disableFocusRipple
                  disableRipple
                  disableTouchRipple
                  onClick={() =>
                    window.open(
                      `${SERVER_URL}/payment/${pendingOrder?.oid}/${pendingOrder?.uid}${pendingOrder?.sid ? `/${pendingOrder?.sid}` : ''}`,
                      '_blank'
                    )
                  }
                >
                  <Typography textTransform={'none'}>Redirect to Payment Page</Typography>
                </Button>
              )}
              {(status === 'pending' || status !== 'paid') && (
                <Button
                  variant="text"
                  loading={loading}
                  onClick={async () => {
                    await dispatch(
                      getPendingOrders({
                        uid: user?.uid as string,
                        sid: staff?.data?.sid
                      })
                    )
                    setLoading(true)
                    debounce(() => {
                      setLoading(false)
                    }, 1000)()
                  }}
                >
                  <Typography textTransform={'none'} color={loading ? 'transparent' : 'black'}>
                    Refresh Payment Status
                  </Typography>
                </Button>
              )}
              {status === 'paid' && (
                <Button
                  sx={{
                    marginTop: '16px'
                  }}
                  variant="contained"
                  loading={loading}
                  onClick={() => {
                    setLoading(true)
                    if (pendingOrder?.type === 'VISITING_CARD') {
                      handleSetSubscription()
                    } else if (pendingOrder?.type === 'SUBSCRIPTION') {
                      handleAdminPayment()
                    }
                    debounce(() => {
                      onClose()
                    }, 1000)()
                  }}
                >
                  <Typography textTransform={'none'}>Continue</Typography>
                </Button>
              )}
            </Container>
          </>
        )
      )}
    </Dialog>
  )
}

const Container = styled('div')({
  width: '100%',
  height: 'max-content',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  img: {
    maxWidth: '320px'
  }
})
