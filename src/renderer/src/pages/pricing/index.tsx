import { Button, Divider, Paper, styled } from '@mui/material'
import BGImg from '@renderer/assets/login-bg.png'
import CustomTypography from '@renderer/components/typography'
import { useAppSelector } from '@renderer/redux/store/hook'
import { CenterUserPricing } from '@renderer/types/user'
import { capitalizeSentence } from '@renderer/utils/functions'
import { errorToast, infoToast, successToast } from '@renderer/utils/toast'
import { useRazorpay, RazorpayOrderOptions } from 'react-razorpay'
import axios from 'axios'
import { encryptData } from '@renderer/utils/crypto'
import moment from 'moment'
import { useNavigate } from 'react-router-dom'
import { addTransaction, setAdminSubscription } from '@renderer/firebase'
import { SERVER_URL } from '@renderer/constants/value'

const Pricing = () => {
  const { Razorpay } = useRazorpay()
  const pricing = useAppSelector((s) => s.pricing.center_user)
  const user = useAppSelector((s) => s.auth.user)
  const navigate = useNavigate()
  const admin = useAppSelector((s) => s.auth.user)

  const handlePayment = async (price: CenterUserPricing) => {
    try {
      const string = String(JSON.stringify(price))
      const enc = encryptData(string)

      const order = await axios.post(`${SERVER_URL}/api/payment`, JSON.stringify({ data: enc }))

      const key =
        import.meta.env.NODE_ENV === 'development'
          ? import.meta.env.VITE_VERCEL_RAZORPAY_KEY
          : import.meta.env.VITE_VERCEL_RAZORPAY_LIVE_KEY

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
              const sub = await setAdminSubscription({
                price: price.price,
                validity: moment()
                  .add(
                    price.validity === '3_month'
                      ? 3 - 1
                      : price.validity === '6_months'
                        ? 6 - 1
                        : 12 - 1,
                    'months'
                  )
                  .format('YYYY-MM-DD'),
                type: 'subscription',
                uid: admin?.uid as string
              })
              if (sub) {
                addTransaction(admin?.uid as string, {
                  amount: order.data?.amount,
                  currency: order?.data?.currency,
                  order_id: order?.data?.id,
                  payment_id: response.razorpay_payment_id,
                  data: sub?.data
                })
                successToast('Subscription activated successfully')
                navigate('/home')
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
        errorToast(order.data as string)
      }
    } catch (err: any) {
      console.log(err)
      errorToast(err?.message)
    }
  }

  const isSubscriptionActive = user?.subscription
    ? moment(user?.subscription?.valid_till).isAfter(moment())
    : false

  return user?.subscription && !isSubscriptionActive ? (
    <Container>
      <Paper style={{ maxWidth: '320px' }}>
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
          onClick={() => navigate('/home')}
        >
          Go To Home
        </Button>
      </Paper>
    </Container>
  ) : (
    <Container>
      <Paper>
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
      </Paper>
    </Container>
  )
}

export default Pricing

const Container = styled('div')(({ theme }) => ({
  width: '100%',
  height: 'calc(var(--vh, 1vh) * 100)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundPosition: 'start',
  backgroundSize: 'contain',
  position: 'relative',
  backgroundImage: `url(${BGImg})`,
  top: 0,
  '&::after': {
    content: '""',
    width: '100%',
    height: '100%',
    backgroundColor: '#00bd48c6',
    position: 'absolute',
    top: 0,
    left: 0
  },
  '& .MuiPaper-root': {
    width: 'calc(100% - 24px)',
    zIndex: 100,
    padding: '24px 32px',
    maxWidth: '1110px',
    height: 'max-content',
    maxHeight: 'calc(100% - 24px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#b9ffd2fc',
    '& form': {
      width: '100%',
      padding: '24px 0px 8px 0px'
    },
    [theme.breakpoints.down('sm')]: {
      padding: '16px 24px'
    }
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
