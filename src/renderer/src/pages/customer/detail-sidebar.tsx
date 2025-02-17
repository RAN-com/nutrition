import {
  Avatar,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  FormControl,
  FormHelperText,
  FormLabel,
  MenuItem,
  Select,
  styled
} from '@mui/material'
import { grey } from '@mui/material/colors'
import RecordChart from '@renderer/components/chart'
import AttendanceDates from '@renderer/components/date/attendance'
import CustomIcon from '@renderer/components/icons'
import MarkAttendance from '@renderer/components/modal/attendance'
import CustomTypography from '@renderer/components/typography'
import { addTransaction } from '@renderer/firebase'
import { setSubscriptionToUser } from '@renderer/firebase/customers'
import {
  asyncGetCurrentCustomerAttendance,
  asyncSetCurrentUser,
  resetCurrentUser
} from '@renderer/redux/features/user/customers'
import { RootState } from '@renderer/redux/store'
import { useAppDispatch, useAppSelector } from '@renderer/redux/store/hook'
import { CustomerAttendance } from '@renderer/types/customers'
import { errorToast, infoToast, successToast } from '@renderer/utils/toast'
import { useFormik } from 'formik'
import moment, { Moment } from 'moment'
import React from 'react'

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
  const records = data?.records?.data ?? []

  const [showDialog, setShowDialog] = React.useState(false)

  console.log(
    data?.attendance?.filter((e) => e.month === date.month() && e.year === date.year())?.[0]?.data,
    date.month(),
    date.year(),
    data?.attendance
  )

  return !data && loading ? (
    <CircularProgress variant="indeterminate" />
  ) : (
    data && (
      <Container className="scrollbar">
        <HandlePayment open={showDialog} onClose={() => setShowDialog(false)} />
        <MarkAttendance
          open={showAttendanceForm}
          onClose={() => {
            setShowAttendanceForm(false)
            setEdit(undefined)
          }}
          edit={edit}
        />
        <Header>
          <div>&nbsp;</div>
          <CustomIcon
            name="LUCIDE_ICONS"
            icon={'LuX'}
            color={grey['600']}
            onClick={() => dispatch(resetCurrentUser())}
          />
        </Header>
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
            <Button
              focusRipple={false}
              variant={'outlined'}
              sx={{ margin: '8px 0px 4px 0px' }}
              disableTouchRipple={true}
              disableElevation={true}
              onClick={() => {}}
            >
              <CustomTypography variant="body2" lineHeight={'1'}>
                Convert to Staff
              </CustomTypography>
            </Button>
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
        <Content>
          <RecordChart data={records} />
        </Content>
      </Container>
    )
  )
}

export default CustomDetailSidebar

const Header = styled('div')({
  width: '100%',
  height: '60px',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 18px'
})

const Container = styled('div')({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  // padding: '0px 18px',
  borderRadius: '12px 0px 0px 12px',
  marginBottom: '12px'
})

const Content = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  width: 'calc(100% - 32px)',
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

const HandlePayment = ({ onClose, open }: { open: boolean; onClose(): void }) => {
  const admin = useAppSelector((s) => s.auth.user?.uid)
  const customer = useAppSelector((s) => s.customer.current_customer?.data?.cid)
  const dispatch = useAppDispatch()
  const [loading, setLoading] = React.useState(false)

  const formik = useFormik({
    initialValues: {
      totalDays: 1
    },
    onSubmit: async (values) => {
      setLoading(true)
      try {
        const sub = await setSubscriptionToUser({
          price: values.totalDays * 2700,
          uid: admin as string,
          cid: customer as string,
          totalDays: values.totalDays * 26
        })
        if (sub) {
          addTransaction(admin as string, {
            amount: values.totalDays * 2700,
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
          flexDirection: 'column'
        }
      }}
    >
      <DialogTitle
        sx={{
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
        <FormHelperText>
          <CustomTypography variant="body2">
            {/* Give title */}
            Total amount: ₹{formik.values.totalDays * 2700} - {formik.values.totalDays * 26} days
          </CustomTypography>
        </FormHelperText>
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
        onClick={() => formik.submitForm()}
        sx={{
          width: '100%',
          maxWidth: '200px',
          margin: 'auto',
          marginTop: '12px'
        }}
      >
        <CustomTypography variant="body2">Pay {formik.values.totalDays * 2700}</CustomTypography>
      </Button>
    </Dialog>
  )
}
