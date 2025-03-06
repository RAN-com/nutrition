import { Button, debounce, Modal } from '@mui/material'
import { blue } from '@mui/material/colors'
import CustomIcon from '@renderer/components/icons'
import CustomTextInput from '@renderer/components/text-input'
import CustomTypography from '@renderer/components/typography'
import { SERVER_URL } from '@renderer/constants/value'
import { addTransaction } from '@renderer/firebase'
import { setSubDomainToStaff } from '@renderer/firebase/appointments'
import { updateCardValidity } from '@renderer/firebase/card'
import { assignOrUpdateDomain, getDomainData } from '@renderer/firebase/domain'
import { getStaff } from '@renderer/firebase/staffs'
import {
  asyncGetCurrentStaffDomainData,
  setCurrentStaff
} from '@renderer/redux/features/user/staff'
import { useAppSelector, useAppDispatch } from '@renderer/redux/store/hook'
import { errorToast, infoToast, successToast } from '@renderer/utils/toast'
import axios from 'axios'
import { useFormik } from 'formik'
import moment from 'moment'
import React from 'react'
import { RazorpayOrderOptions, useRazorpay } from 'react-razorpay'
import * as yup from 'yup'

const validationSchema = yup.object({
  domain: yup
    .string()
    .matches(/^[a-zA-Z0-9_]+$/, 'Only alphanumeric characters and underscores are allowed.')
    .min(4, 'Domain must be at least 3 characters')
    .max(16, 'Domain cannot exceed 50 characters')
    .required('Domain is required')
})

type Props = {
  handleFunc(): void
}
const PurchaseSubscription = ({}: Props) => {
  const assignedDomain = useAppSelector((s) => s.staffs.current_staff_domain)

  const [, setClicked] = React.useState(false)
  const staff = useAppSelector((s) => s.staffs.current_staff)
  const user = useAppSelector((s) => s.auth.user)
  const dispatch = useAppDispatch()
  const [, setLoading] = React.useState(false)

  const formik = useFormik({
    initialValues: {
      domain: ''
    },
    validationSchema,
    async onSubmit(values) {
      if (!staff) return alert('Staff Not found. Try Again')
      if (confirm('You cannot change this name. Do you want to continue ?')) {
        await assignOrUpdateDomain(values.domain, {
          created_by: user?.uid as string,
          created_on: moment().format('YYYY-MM-DD'),
          is_active: true,
          staff_id: staff?.data?.sid
        })

        await setSubDomainToStaff(staff?.data, values.domain)
        const d = await getStaff(user?.uid as string, staff?.data?.sid as string)
        if (d.data) {
          await dispatch(setCurrentStaff(d?.data))
        }
        await dispatch(
          asyncGetCurrentStaffDomainData({
            domain: values.domain
          })
        )
      }
    }
  })
  const domainExists = async (e: string) => {
    if (!user) return false
    const res = await Promise.resolve(getDomainData(e))
    if (!!res) {
      formik.setFieldError('domain', 'Domain Already Exists')
      return true
    } else {
      formik.setErrors({})
      return false
    }
  }
  const [isAvailable, setIsAvailable] = React.useState(false)

  return !assignedDomain ? (
    <div style={{ display: 'flex', flexDirection: 'row', gap: 4, padding: '12px 0px' }}>
      <CustomIcon
        name="LUCIDE_ICONS"
        icon="LuArrowLeft"
        onClick={() => {
          formik.resetForm()
          setLoading(false)
          setIsAvailable(false)
          setClicked(false)
        }}
        color={'grey'}
        sx={{ marginRight: '8px' }}
      />
      <CustomTextInput
        formProps={{
          sx: {
            maxWidth: '340px',
            '.MuiOutlinedInput-root': {
              paddingRight: '4px'
            }
          }
        }}
        input={{
          size: 'small',
          placeholder: 'Enter Domain Name',
          name: 'domain',
          value: formik.values.domain,
          color: isAvailable ? 'success' : 'error',
          error: (formik.touched.domain && Boolean(formik.errors.domain))?.valueOf(),
          helperText: formik.touched.domain && formik.errors.domain,
          onChange: async (e) => {
            const value = e.target.value.split(' ').join('')
            formik.setFieldValue('domain', value)
            if (value.length >= 4) {
              setLoading(true)
              debounce(async () => {
                const data = await domainExists(value)
                setIsAvailable(!data)
                console.log(data, 'Checking:::', value)
                setLoading(false)
              }, 600)()
            }
          },
          slotProps: {
            input: {
              endAdornment: (
                <div
                  style={{
                    display: 'flex'
                  }}
                >
                  {
                    <CustomIcon
                      name={'FONT_AWESOME_6'}
                      icon={'FaCheck'}
                      color={'white'}
                      disabled={!isAvailable}
                      onClick={async () => {
                        formik.submitForm()
                      }}
                      sx={{
                        backgroundColor: blue['700'],
                        width: '32px',
                        height: '32px',
                        marginLeft: '12px',
                        borderRadius: '4px'
                      }}
                    />
                  }
                  {/* </Button> */}
                </div>
              )
            }
          }
        }}
      />
    </div>
  ) : (
    <Payment />
  )
}

export default PurchaseSubscription

const Payment = () => {
  const admin = useAppSelector((s) => s.auth.user)
  const { Razorpay } = useRazorpay()
  const current_staff = useAppSelector((s) => s.staffs.current_staff)

  const [clicked, setClicked] = React.useState(false)
  const staff = useAppSelector((s) => s.staffs.current_staff)
  const dispatch = useAppDispatch()

  async function handlePayment() {
    try {
      const url = `${SERVER_URL}/api/payment`
      // Fetch order details from the backend API
      const order = (
        await axios.post(
          url,
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

      // Get the Razorpay API key
      const key = import.meta.env.DEV
        ? import.meta.env.VITE_VERCEL_RAZORPAY_KEY
        : import.meta.env.VITE_VERCEL_RAZORPAY_LIVE_KEY
      console.log(order, key)

      if (!key) {
        errorToast('Not available at the moment. Contact developer')
        return
      } else {
        successToast('Details Retrieved')
      }

      if (order?.status >= 200 && order?.status <= 300) {
        // Set up Razorpay payment options
        const options: RazorpayOrderOptions = {
          amount: order?.order?.amount, // Amount in paise (100 paisa = 1 INR)
          currency: order?.order?.currency, // Currency (INR)
          key: key as string, // Razorpay API key
          name: 'RAN', // Your company or app name
          order_id: order?.order?.id, // Razorpay order ID
          retry: {
            enabled: true
          },
          modal: {
            ondismiss: () => {
              infoToast('Payment failed. Please try again')
            }
          },
          handler: async (response) => {
            try {
              // Handle payment success, update subscription status
              const sub = await updateCardValidity(
                current_staff?.data?.assigned_subdomain as string,
                current_staff?.data?.sid as string,
                moment().add(1, 'year').format('YYYY-MM-DD')
              )

              if (sub?.status) {
                // Log the transaction
                addTransaction(admin?.uid as string, {
                  amount: order?.order?.amount,
                  currency: order?.order?.currency,
                  order_id: order?.order?.id,
                  payment_id: response.razorpay_payment_id,
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
            } catch (err) {
              console.log(err)
            }
          }
        }

        // Ensure Razorpay instance is initialized and open the payment modal
        if (typeof Razorpay !== 'undefined') {
          const razorpayInstance = new Razorpay(options)
          if (!razorpayInstance) {
            console.log('Razorpay Not Found')
            return
          }
          razorpayInstance.open()
        } else {
          errorToast('Razorpay script not loaded. Please contact support.')
        }
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
      onClick={async () => {
        setClicked(true)
        await handlePayment()
        setClicked(false)
      }}
      size={'large'}
    >
      <Modal open={clicked}>
        <div></div>
      </Modal>
      <CustomTypography variant="body2" lineHeight={'1'}>
        Buy Subscription
      </CustomTypography>
    </Button>
  )
}
