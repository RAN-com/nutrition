import { Button } from '@mui/material'
import CustomTypography from '@renderer/components/typography'
import { SERVER_URL } from '@renderer/constants/value'
import { addTransaction } from '@renderer/firebase'
import { updateCardValidity } from '@renderer/firebase/card'
import { useAppSelector } from '@renderer/redux/store/hook'
import { errorToast, infoToast, successToast } from '@renderer/utils/toast'
import axios from 'axios'
import moment from 'moment'
import { RazorpayOrderOptions, useRazorpay } from 'react-razorpay'

type Props = {
  handleFunc(): void
}
const PurchaseSubscription = ({ handleFunc }: Props) => {
  const admin = useAppSelector((s) => s.auth.user)
  const { Razorpay } = useRazorpay()
  const current_staff = useAppSelector((s) => s.staffs.current_staff)

  const handlePayment = async () => {
    try {
      const order = (
        await axios.post(
          `${SERVER_URL}/api/payment`,
          JSON.stringify({
            data: 'encrypted-data',
            type: 'APPOINTMENT_CARD'
          }),
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        )
      )?.data

      const key = import.meta.env.DEV
        ? import.meta.env.VITE_VERCEL_RAZORPAY_KEY
        : import.meta.env.VITE_VERCEL_RAZORPAY_LIVE_KEY
      console.log(order, key)
      if (order.status >= 200 && order.status <= 300) {
        const options: RazorpayOrderOptions = {
          amount: order.data?.amount,
          currency: order?.data?.currency,
          key: key as string,
          name: 'RAN',
          order_id: order?.data?.id,
          retry: {
            enabled: true
          },
          modal: {
            ondismiss: () => {
              infoToast('Payment failed. Please try again')
            }
          },
          async handler(response) {
            try {
              const sub = await updateCardValidity(
                current_staff?.data?.assigned_subdomain as string,
                moment().add(12, 'months').format('YYYY-MM-DD')
              )

              if (sub?.status) {
                addTransaction(admin?.uid as string, {
                  amount: order.data?.amount,
                  currency: order?.data?.currency,
                  order_id: order?.data?.id,
                  payment_id: response.razorpay_payment_id,
                  data: sub?.data
                })
                handleFunc()
                successToast('Subscription activated successfully')
              } else {
                errorToast('Failed to activate subscription. Please try again')
              }
            } catch (err) {
              console.log(err)
            }
          }
        }

        const razorpayInstance = new Razorpay(options)
        razorpayInstance.open()
      } else {
        errorToast(order?.data as string)
      }
    } catch (err: any) {
      console.log(err)
      errorToast(err?.message)
    }
  }
  return (
    <Button
      focusRipple={false}
      variant={'contained'}
      sx={{ margin: '8px 0px 4px 0px' }}
      disableTouchRipple={true}
      disableElevation={true}
      onClick={() => {
        handlePayment()
      }}
      size={'large'}
    >
      <CustomTypography variant="body2" lineHeight={'1'}>
        Buy Subscription
      </CustomTypography>
    </Button>
  )
}

export default PurchaseSubscription
