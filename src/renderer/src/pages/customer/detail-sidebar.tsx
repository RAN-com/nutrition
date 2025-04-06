import {
  Avatar,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  Fade,
  FormControl,
  FormHelperText,
  FormLabel,
  MenuItem,
  Select,
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
import toast from 'react-hot-toast'
import * as Yup from 'yup'

type Props = {
  data: RootState['customer']['current_customer']
}

const CustomDetailSidebar = ({ data }: Props) => {
  const [date, setDate] = React.useState(moment())
  const dispatch = useAppDispatch()
  const [edit, setEdit] = React.useState<CustomerAttendance>()
  const [admin, user] = useAppSelector((s) => [
    s.auth.user?.uid,
    s.customer.current_customer?.data?.cid
  ])
  const loading = useAppSelector((s) => s.customer.current_customer_loading)

  const attendance = useAppSelector((s) => s?.customer?.current_customer?.attendance)

  const handleGetAttendance = (e: Moment) => {
    const [month, year] = [e.month(), e.year()]
    if (admin && user) {
      if (moment(data?.data?.created_on).isAfter(e)) {
        infoToast('Cannot mark attendance before customer was added')
        return
      } else {
        setDate(e)
        dispatch(asyncGetCurrentCustomerAttendance({ cid: user, uid: admin, month, year }))
      }
    }
  }

  const [showAttendanceForm, setShowAttendanceForm] = React.useState(false)

  const [showDialog, setShowDialog] = React.useState(false)

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
            <Tooltip title={'Will be available soon'} placement="right">
              <span>
                <Button
                  focusRipple={false}
                  variant={'outlined'}
                  sx={{ margin: '8px 0px 4px 0px' }}
                  disableTouchRipple={true}
                  disableElevation={true}
                  disabled={true}
                  onClick={async () => {
                    const convert = await convertCustomerToStaff(admin as string, user as string)
                    if (convert?.status) {
                      toast.success(convert?.message)
                      return
                    } else {
                      toast.error(convert?.message)
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
              console.log(e, 'Onclick')
              setShowAttendanceForm(true)
              setEdit(e.data ?? undefined)
            }}
            values={
              attendance?.filter((e) => e.month === date.month() && e.year === date.year())?.[0]
                ?.data ?? []
            }
            maxPrevDate={moment(data?.data?.created_on).toString()}
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
  totalDays: Yup.string()
    .required('Total days is required')
    .matches(/^\d+$/, 'Total days must be a whole number'),

  price: Yup.string()
    .required('Price is required')
    .matches(/^\d+(\.\d{1,2})?$/, 'Price must be a valid number'),

  amount_paid: Yup.string()
    .required('Amount paid is required')
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
    initialValues: {
      totalDays: '',
      amount_paid: '',
      price: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true)
      try {
        const sub = await setSubscriptionToUser({
          price: Number(values.totalDays) * Number(formik.values.price),
          uid: admin as string,
          cid: customer as string,
          totalDays: Number(values.totalDays) * 26,
          amountPaid: parseInt(values.amount_paid)
        })
        if (sub) {
          addTransaction(admin as string, {
            amount: Number(values.totalDays) * Number(formik.values.price),
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

  const tot = Number(Number(formik.values.totalDays) * Number(formik.values.price))

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
          value: formik.values.price,
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
      <FormControl fullWidth={true}>
        <FormLabel>
          <CustomTypography variant="body2">
            {/* Give title */}
            Select the duration of the subscription
          </CustomTypography>
        </FormLabel>
        <Select
          value={formik.values.totalDays}
          fullWidth={true}
          onChange={formik.handleChange}
          name="totalDays"
        >
          <MenuItem value={1}>1 Month</MenuItem>
          <MenuItem value={3}>3 Months</MenuItem>
          <MenuItem value={6}>6 Months</MenuItem>
          <MenuItem value={9}>9 Months</MenuItem>
          <MenuItem value={10}>10 Months</MenuItem>
          <MenuItem value={12}>12 Months</MenuItem>
        </Select>
        <Fade in={!!tot}>
          <FormHelperText sx={{ position: 'relative' }}>
            {!!tot && (
              <CustomTypography variant="body2">
                Total amount: ₹{tot || ''} - {parseInt(formik.values.totalDays) * 26} days
              </CustomTypography>
            )}
          </FormHelperText>
        </Fade>
      </FormControl>

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
        disabled={parseInt(`${formik.values.amount_paid || 0}`) <= 0}
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
        Per day:{' '}
        {Number(Number(formik.values.price) / (Number(formik.values.totalDays) * 26))
          .toFixed(2)
          .toString()}
      </CustomTypography>
    </Dialog>
  )
}
