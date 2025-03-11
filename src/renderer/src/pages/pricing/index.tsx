import { Button, Dialog, Divider, styled } from '@mui/material'
import BGImg from '@renderer/assets/login-bg.png'
import CustomTypography from '@renderer/components/typography'
import { useAppSelector, useAppDispatch } from '@renderer/redux/store/hook'
import { CenterUserPricing } from '@renderer/types/user'
import { capitalizeSentence } from '@renderer/utils/functions'
import { errorToast, successToast } from '@renderer/utils/toast'
import axios from 'axios'
import { encryptData } from '@renderer/utils/crypto'
import moment from 'moment'
import { useNavigate } from 'react-router-dom'
import { SERVER_URL } from '@renderer/constants/value'
import { createAdminPayment } from '@renderer/firebase/pricing'
import { setOrderPendingData } from '@renderer/redux/features/pricing/slice'
import React from 'react'
import { PaymentModel } from '@renderer/app'

const Pricing = () => {
  const dispatch = useAppDispatch()
  const pricing = useAppSelector((s) => s.pricing.center_user)
  const user = useAppSelector((s) => s.auth.user)
  const navigate = useNavigate()
  const admin = useAppSelector((s) => s.auth.user)
  const pendingOrder = useAppSelector((s) => s.pricing.pending_order)

  const handlePayment = async (price: CenterUserPricing) => {
    try {
      const string = String(JSON.stringify(price))
      const enc = encryptData(string)
      const url = `${SERVER_URL}/api/payment`
      const order = (
        await axios.post(url, JSON.stringify({ data: enc, type: 'SUBSCRIPTION' }), {
          headers: {
            'Content-Type': 'application/json'
          }
        })
      )?.data

      console.log(order)
      if (order.status >= 200 && order.status <= 300) {
        const store = await createAdminPayment({
          uid: admin?.uid as string,
          createdOn: moment().toString(),
          order: order?.order,
          type: 'SUBSCRIPTION',
          sid: undefined,
          status: 'pending',
          pricingType: price?.title
        })

        if (store.status) {
          successToast("You'll be redirected to payments page...")
          dispatch(setOrderPendingData(store.data))
        } else if (store?.data && !store.status) {
          errorToast('Clear pending payments to continue. Contact support if this error exists')
          dispatch(setOrderPendingData(store.data))
        } else {
          errorToast('Payment Portal is not available for now. Please try again later')
        }
        return
      } else {
        errorToast(order?.data as string)
      }
    } catch (err: any) {
      console.log(err)
      errorToast(err?.message)
    }
  }

  const [showPricing, setShowPricing] = React.useState(false)

  const isSubscriptionActive = user?.subscription
    ? moment(user?.subscription?.valid_till).isBefore(moment())
    : false

  return !showPricing && user?.subscription && !isSubscriptionActive ? (
    <Container>
      <Dialog
        open={true}
        style={{ flexDirection: 'column', flexWrap: 'wrap' }}
        slotProps={{
          paper: {
            className: 'scrollbar'
          }
        }}
        sx={(theme) => ({
          '.MuiPaper-root': {
            width: '100%',
            zIndex: 100,
            padding: '24px 32px',
            maxWidth: 'max-content',
            height: 'max-content',
            maxHeight: 'calc(100% - 24px)',
            display: 'flex',
            flexWrap: 'wrap',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ffffffdc',
            '& form': {
              width: '100%',
              padding: '24px 0px 8px 0px'
            },
            [theme.breakpoints.down('sm')]: {
              padding: '16px 24px'
            }
          }
        })}
      >
        <CustomTypography variant="h5" fontFamily={'Syne'} fontWeight={'700'} textAlign={'center'}>
          Subscription Status
        </CustomTypography>
        <CustomTypography variant="body1" textAlign={'center'}>
          You have an active subscription till{' '}
          {moment(user?.subscription?.valid_till).format('DD MMM YYYY')}
        </CustomTypography>

        <Button
          disableElevation={true}
          sx={{
            padding: '12px 24px',
            marginTop: '12px'
          }}
          variant={'contained'}
          fullWidth={true}
          onClick={() => navigate('/')}
        >
          Go To Home
        </Button>
        {user?.subscription?.type === 'FREE_TRAIL' && (
          <Button
            disableElevation
            disableFocusRipple
            disableRipple
            disableTouchRipple
            variant={'text'}
            sx={{
              zIndex: 100,
              textTransform: 'none'
            }}
            // fullWidth={true}
            onClick={() => setShowPricing(true)}
          >
            Buy Subscription
          </Button>
        )}
      </Dialog>
    </Container>
  ) : (
    <Container>
      <PaymentModel open={!!pendingOrder} />
      <Dialog
        open={true}
        style={{ flexDirection: 'column', flexWrap: 'wrap' }}
        slotProps={{
          paper: {
            className: 'scrollbar'
          }
        }}
        sx={(theme) => ({
          '.MuiPaper-root': {
            width: '100%',
            zIndex: 100,
            padding: '24px 32px',
            maxWidth: 'max-content',
            height: 'max-content',
            maxHeight: 'calc(100% - 24px)',
            display: 'flex',
            flexWrap: 'wrap',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#bebebe9d',
            '& form': {
              width: '100%',
              padding: '24px 0px 8px 0px'
            },
            [theme.breakpoints.down('sm')]: {
              padding: '16px 24px'
            }
          }
        })}
      >
        <CustomTypography variant="h3" fontFamily={'Syne'} fontWeight={'700'}>
          Choose a Plan
        </CustomTypography>
        <CustomTypography
          variant="body1"
          maxWidth={'420px'}
          textAlign={'center'}
          lineHeight={'1'}
          marginBottom={'12px'}
          marginTop={'4px'}
          color="#0000007d"
        >
          Enjoy flexibility, transparency, and unmatched value with our subscription packages.
        </CustomTypography>
        <InnerContainer>
          {pricing.map((price) => (
            <PricingContainer key={price.priceId}>
              <Wrapper>
                <div className="price">
                  <CustomTypography variant={'h4'} fontWeight={'800'}>
                    {price.price}&nbsp;
                  </CustomTypography>
                  {price?.validity && (
                    <CustomTypography variant={'body1'}>
                      / {capitalizeSentence(price?.validity)}
                    </CustomTypography>
                  )}
                </div>
                <Divider sx={{ margin: '12px 0px' }} />
                <CustomTypography variant="h5" marginBottom={'8px'}>
                  Features
                </CustomTypography>
                {price.features.map((e) => (
                  <CustomTypography variant={'body2'}>✅ {e}</CustomTypography>
                ))}
              </Wrapper>
              <Button
                disableElevation={true}
                sx={{
                  padding: '12px 24px'
                }}
                variant={'contained'}
                fullWidth={true}
                onClick={() => handlePayment(price)}
              >
                Select & Pay {price.price}
              </Button>
            </PricingContainer>
          ))}
        </InnerContainer>
        {isSubscriptionActive ||
          (user?.subscription?.type === 'FREE_TRAIL' && (
            <Button
              sx={{
                zIndex: 100,
                padding: '12px 24px',
                marginTop: '12px'
              }}
              variant={'contained'}
              // fullWidth={true}
              onClick={() => {
                navigate('/home')
                setShowPricing(false)
              }}
            >
              Back to Home
            </Button>
          ))}
      </Dialog>
    </Container>
  )
}

export default Pricing

const Container = styled('div')(({}) => ({
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundPosition: 'start',
  backgroundSize: 'cover',
  position: 'relative',
  backgroundRepeat: 'no-repeat',
  backgroundImage: `url(${BGImg})`,
  top: 0,
  '&::after': {
    content: '""',
    width: '100%',
    height: '100%',
    backgroundColor: '#24242450',
    position: 'absolute',
    top: 0,
    left: 0
  }
}))

const InnerContainer = styled('div')({
  width: '100%',
  height: 'max-content',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  overflowX: 'auto',
  gap: '12px',
  paddingBottom: '12px',
  paddingTop: '12px'
})

const PricingContainer = styled('div')({
  width: 'calc(100%)',
  minWidth: '320px',
  maxWidth: '320px',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  padding: '12px',
  height: '100%',
  '.price': {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end'
  }
})

const Wrapper = styled('div')({
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  paddingBottom: '24px'
})
