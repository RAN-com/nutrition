import {
  Avatar,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  styled,
  Tooltip
} from '@mui/material'
import { grey } from '@mui/material/colors'
import AttendanceDates from '@renderer/components/date/attendance'
import CustomIcon from '@renderer/components/icons'
import MarkAttendance from '@renderer/components/modal/attendance'
import CustomTextInput from '@renderer/components/text-input'
import CustomTypography from '@renderer/components/typography'
import { addTransaction } from '@renderer/firebase'
import { setSubscriptionToUser } from '@renderer/firebase/customers'
import { convertCustomerToStaff } from '@renderer/firebase/staffs'
import {
  asyncGetCurrentCustomerAttendance,
  asyncSetCurrentUser
} from '@renderer/redux/features/user/customers'
import { RootState } from '@renderer/redux/store'
import { useAppDispatch, useAppSelector } from '@renderer/redux/store/hook'
import { CustomerAttendance } from '@renderer/types/customers'
import { errorToast, infoToast, successToast } from '@renderer/utils/toast'
import { useFormik } from 'formik'
import moment, { Moment } from 'moment'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import * as Yup from 'yup'

type Props = {
  data: RootState['customer']['current_customer']
}

const CustomDetailSidebar = ({ data }: Props) => {
  const [date, setDate] = React.useState(moment())
  const dispatch = useAppDispatch()
  const [edit, setEdit] = React.useState<CustomerAttendance>()
  const [admin, user, limit] = useAppSelector((s) => [
    s.auth.user?.uid,
    s.customer.current_customer?.data?.cid,
    s.auth.user?.subscription?.total_staffs
  ])
  const loading = useAppSelector((s) => s.customer.current_customer_loading)

  const attendance = useAppSelector((s) => s?.customer?.current_customer?.attendance)

  const handleGetAttendance = (e: Moment) => {
    const [month, year] = [e.month(), e.year()]
    if (admin && user) {
      if (moment(data?.data?.created_on).isAfter(e)) {
        // infoToast('Cannot mark attendance before customer was added')
        return
      } else {
        setDate(e)
        dispatch(asyncGetCurrentCustomerAttendance({ cid: user, uid: admin, month, year }))
      }
    }
  }

  const customer = useAppSelector((s) => s.customer.current_customer?.data)

  const [showAttendanceForm, setShowAttendanceForm] = React.useState(false)

  const [showDialog, setShowDialog] = React.useState(false)
  const navigation = useNavigate()
  const sub = useAppSelector((s) => s.customer.current_customer?.subscription)
  const due = (sub?.price || 0) - (sub?.amountPaid || 0)

  return !data && loading ? (
    <CircularProgress variant="indeterminate" />
  ) : (
    data && (
      <>
        <HandlePayment open={showDialog} onClose={() => setShowDialog(false)} />
        <MarkAttendance
          open={showAttendanceForm}
          onClose={() => {
            setShowAttendanceForm(false)
            setEdit(undefined)
          }}
          edit={edit}
        />
        <Content sx={{}}>
          <Profile>
            <Avatar
              src={data?.data?.photo_url}
              alt={data?.data?.name}
              sx={{
                width: '120px',
                height: '120px',
                border: '1px solid'
              }}
            />
            <CustomTypography variant="h5" marginTop={'12px'}>
              {data?.data?.name}
            </CustomTypography>
            <CustomTypography variant="body2" lineHeight={'1'}>
              {data?.data?.email}
            </CustomTypography>

            <CustomTypography variant="body2" marginTop={'8px'} lineHeight={'1'}>
              +91-{data?.data?.phone}
            </CustomTypography>
            <Button
              variant={'contained'}
              color={
                data?.subscription
                  ? data?.subscription?.isActive
                    ? 'success'
                    : 'error'
                  : 'primary'
              }
              focusRipple={false}
              disableTouchRipple={true}
              disableElevation={true}
              sx={{
                marginTop: '12px'
              }}
              onClick={async () => {
                if (!data?.subscription?.isActive || data.subscription.daysLeft === 0) {
                  setShowDialog(true)
                }
              }}
            >
              <CustomTypography variant={'body2'}>
                {data?.subscription
                  ? data?.subscription?.isActive
                    ? `
                      ${data?.subscription?.daysLeft} Days Left
                      `
                    : 'Subscription Over. Purchase Again'
                  : 'Buy Subscription'}
              </CustomTypography>
            </Button>
            <div style={{ display: 'flex', flexDirection: 'column', padding: '12px 0px' }}>
              <Button
                sx={{
                  padding: '0px',
                  marginTop: '0.4rem',
                  cursor: 'default'
                }}
                color={'error'}
                disableElevation
                disableFocusRipple
                disableRipple
                disableTouchRipple
              >
                Amount Pending: {due}
              </Button>
              <Button
                sx={{
                  padding: '0px',
                  marginTop: '0.4rem',
                  cursor: 'default'
                }}
                disableElevation
                color={'success'}
                disableFocusRipple
                disableRipple
                disableTouchRipple
              >
                Total Amount Paid:
                {sub?.amountPaid || 0}
              </Button>
            </div>
            <Tooltip title={''} placement="right">
              <span>
                <Button
                  focusRipple={false}
                  variant={'outlined'}
                  sx={{ margin: '8px 0px 4px 0px' }}
                  disableTouchRipple={true}
                  disableElevation={true}
                  onClick={async () => {
                    if (!confirm('This is a irreversible action. Do you want to continue ?')) return
                    console.log(data.records)
                    const convert = await convertCustomerToStaff(
                      admin as string,
                      user as string,
                      (limit || 0) as number
                    )
                    if (convert?.status) {
                      console.log(convert?.message)
                      navigation('/staffs', { replace: true, flushSync: true })
                      return
                    } else {
                      errorToast(convert?.message)
                    }
                  }}
                >
                  <CustomTypography variant="body2" lineHeight={'1'}>
                    Convert to Staff
                  </CustomTypography>
                </Button>
              </span>
            </Tooltip>
            <CustomTypography
              marginTop={'12px'}
              fontSize={'12px'}
              textAlign={'center'}
              margin={'auto'}
              maxWidth={'90%'}
            >
              By converting Customer to Staff, all the data related to customer will deleted.
            </CustomTypography>
          </Profile>
        </Content>
        <Content>
          <AttendanceDates
            onMonthChange={handleGetAttendance}
            onClick={(e) => {
              if (!e) return
              if (moment(data?.data?.created_on).isAfter(moment(e.data?.date))) {
                infoToast('Cannot mark attendance before customer was added')
                return
              }
              console.log(e, 'Onclick')
              setShowAttendanceForm(true)
              setEdit(e.data ?? undefined)
            }}
            values={
              attendance?.filter((e) => e.month === date.month() && e.year === date.year())?.[0]
                ?.data ?? []
            }
            maxPrevDate={moment(customer?.created_on).toString()}
          />
        </Content>
        {/* <Content>
          <RecordChart data={records} />
        </Content> */}
      </>
    )
  )
}

export default CustomDetailSidebar

const Content = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  width: 'calc(100%)',
  margin: '0 auto',
  padding: '32px 24px',
  borderRadius: '12px',
  backgroundColor: 'white',
  marginBottom: '12px'
})

const Profile = styled('div')({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center'
})

const validationSchema = Yup.object({
  totalDays: Yup.number()
    .required('Total days is required')
    .min(7, 'Total days must be at least 7'),

  price: Yup.string()
    .required('Price is required')
    .matches(/^\d+(\.\d{1,2})?$/, 'Enter a valid subscription amount'),

  amount_paid: Yup.string()
    .optional()
    .nullable()
    .matches(/^\d+(\.\d{1,2})?$/, 'Amount paid must be a valid number')
    .test('is-less-than-price', 'Amount paid must not exceed price', function (value) {
      const { price } = this.parent
      const amountPaid = parseFloat(value || '0')
      const priceValue = parseFloat(price || '0')
      return amountPaid <= priceValue
    })
})

const HandlePayment = ({ onClose, open }: { open: boolean; onClose(): void }) => {
  const admin = useAppSelector((s) => s.auth.user?.uid)
  const customer = useAppSelector((s) => s.customer.current_customer?.data?.cid)
  const dispatch = useAppDispatch()
  const [loading, setLoading] = React.useState(false)
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      totalDays: 7,
      amount_paid: '',
      price: 2000
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true)
      try {
        const sub = await setSubscriptionToUser({
          price: Number(formik.values.price),
          uid: admin as string,
          cid: customer as string,
          totalDays: Number(values.totalDays),
          amountPaid: parseInt(values.amount_paid)
        })
        if (sub) {
          addTransaction(admin as string, {
            amount: Number(formik.values.price),
            currency: 'inr',
            data: sub
          })
          successToast('Subscription activated successfully')
          dispatch(
            asyncSetCurrentUser({
              uid: admin as string,
              cid: customer as string
            })
          )
          setLoading(false)
          onClose()
        } else {
          errorToast('Failed to activate subscription. Please try again')
          setLoading(false)
          onClose()
        }
      } catch (err) {
        setLoading(false)
        console.log(err)
        onClose()
      }
    }
  })

  const perDay = (
    Number(formik.values.price) > 0 && Number(formik.values.totalDays) > 0
      ? Number(formik.values.price) / Number(formik.values.totalDays)
      : 0
  ).toFixed(2)

  return (
    <Dialog
      open={open}
      onClose={onClose}
      sx={{
        '.MuiPaper-root': {
          maxWidth: '400px',
          width: '100%',
          padding: '24px',
          paddingTop: '12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }
      }}
    >
      <DialogTitle
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0px',
          marginBottom: '12px'
        }}
      >
        <CustomTypography variant="h6">Subscription</CustomTypography>
        <CustomIcon name="LUCIDE_ICONS" icon="LuX" onClick={onClose} color={grey['600']} />
      </DialogTitle>
      <CustomTextInput
        input={{
          value: `${formik.values.price}`,
          placeholder: 'Enter subscription amount',
          inputMode: 'numeric',
          defaultValue: undefined,
          type: 'number',
          onChange: (e) => formik.setFieldValue('price', parseInt(e.target.value)),
          label: 'Subscription Amount',
          error: (formik.touched.price && Boolean(formik.errors.price))?.valueOf() ?? false,
          helperText: formik.touched.price && formik.errors.price,
          sx: {
            marginBottom: '12px'
          }
        }}
      />
      <CustomTextInput
        input={{
          value: formik.values.amount_paid,
          placeholder: 'Enter amount paid',
          inputMode: 'numeric',
          defaultValue: undefined,
          type: 'number',
          error: formik.touched.amount_paid && Boolean(formik.errors.amount_paid),
          helperText: formik.touched.amount_paid && formik.errors.amount_paid,
          onChange: (e) => formik.setFieldValue('amount_paid', e.target.value),
          label: 'Amount Paid',
          sx: {
            marginBottom: '12px'
          }
        }}
      />
      <CustomTextInput
        input={{
          value: `${formik.values.totalDays}`,
          placeholder: 'Enter total days',
          inputMode: 'numeric',
          defaultValue: undefined,
          type: 'number',
          error: formik.touched.totalDays && Boolean(formik.errors.totalDays),
          helperText: formik.touched.totalDays && formik.errors.totalDays,
          onChange: (e) => formik.setFieldValue('totalDays', e.target.value),
          label: 'Total days of subscription',
          sx: {
            marginBottom: '12px'
          }
        }}
      />

      <Button
        variant="contained"
        startIcon={
          loading && (
            <CircularProgress
              variant={'indeterminate'}
              sx={{
                '& *': {
                  color: 'white'
                }
              }}
              size={20}
            />
          )
        }
        disabled={loading || formik.values.totalDays <= 0}
        onClick={() => formik.submitForm()}
        sx={{
          width: '100%',
          maxWidth: '200px',
          margin: 'auto',
          marginTop: '12px'
        }}
      >
        <CustomTypography variant="body2">Pay {formik.values.amount_paid}</CustomTypography>
      </Button>
      <CustomTypography
        variant="body2"
        sx={{
          paddingTop: '4px',
          textAlign: 'center',
          // width: '100%',
          margin: 'auto'
        }}
      >
        Per day: {perDay}
      </CustomTypography>
    </Dialog>
  )
}
