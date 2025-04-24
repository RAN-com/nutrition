import { Button, debounce, Modal } from '@mui/material'
import { blue } from '@mui/material/colors'
import CustomIcon from '@renderer/components/icons'
import CustomTextInput from '@renderer/components/text-input'
import CustomTypography from '@renderer/components/typography'
import { SERVER_URL } from '@renderer/constants/value'
import { setSubDomainToStaff } from '@renderer/firebase/appointments'
import { assignOrUpdateDomain, getDomainData } from '@renderer/firebase/domain'
import { createCardPayment } from '@renderer/firebase/pricing'
import { getStaff } from '@renderer/firebase/staffs'
import { setOrderPendingData } from '@renderer/redux/features/pricing/slice'
import {
  asyncGetCurrentStaffDomainData,
  setCurrentStaff
} from '@renderer/redux/features/user/staff'
import { useAppSelector, useAppDispatch } from '@renderer/redux/store/hook'
import { errorToast, successToast } from '@renderer/utils/toast'
import axios from 'axios'
import { useFormik } from 'formik'
import moment from 'moment'
import React from 'react'
import * as yup from 'yup'

const validationSchema = yup.object({
  domain: yup
    .string()
    .matches(/^[a-z0-9_]+$/, 'Only lowercase letters, numbers, and underscores are allowed.')
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
      if (!staff) {
        errorToast('Staff Not found. Try Again')
        return
      }
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
            domain: values.domain.toLowerCase()
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
          value: formik.values.domain.toLowerCase(),
          color: isAvailable ? 'success' : 'error',
          error: (formik.touched.domain && Boolean(formik.errors.domain))?.valueOf(),
          helperText: formik.touched.domain && formik.errors.domain,
          onChange: async (e) => {
            const value = e.target.value.split(' ').join('')
            formik.setFieldValue('domain', value)
            if (value.length >= 4) {
              setLoading(true)
              debounce(async () => {
                const data = await domainExists(value.toLowerCase())
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
  const dispatch = useAppDispatch()

  const [clicked, setClicked] = React.useState(false)
  const staff = useAppSelector((s) => s.staffs.current_staff)
  const dev = useAppSelector((s) => s.ui.toggle_dev_mode)

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

      if (order?.status >= 200 && order?.status <= 300) {
        // Set up Razorpay payment options
        const store = await createCardPayment({
          uid: admin?.uid as string,
          createdOn: moment().toString(),
          order: order?.order,
          sid: staff?.data?.sid as string,
          type: 'VISITING_CARD',
          status: 'pending',
          canApproveWithoutPayment: dev || false
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
