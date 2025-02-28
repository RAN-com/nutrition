import {
  Avatar,
  Button,
  CircularProgress,
  debounce,
  Divider,
  keyframes,
  styled
} from '@mui/material'
import AboutHeader from './header'
import { grey } from '@mui/material/colors'
import { useAppSelector, useAppDispatch } from '@renderer/redux/store/hook'
import StaffContent from './content'
import CustomTypography from '@renderer/components/typography'
import { CustomerResponse } from '@renderer/types/customers'
import { AppointmentData } from '@renderer/types/staff'
import { VisitorData } from '@renderer/types/visitor'
import React from 'react'
import { getAllAppointments } from '@renderer/firebase/appointments'
import { staffAssignedCustomers } from '@renderer/firebase/customers'
import { staffAssignedVisitors } from '@renderer/firebase/visitor'
import CustomIcon from '@renderer/components/icons'
import { AllIcons, Icons } from '@renderer/types/icon'
import AppointmentsCard from './appointment-card'
import { asyncGetCurrentStaffDomainData } from '@renderer/redux/features/user/staff'
import AvailableSoon from '@renderer/components/modal/available-soon'
import PurchaseSubscription from './purchase-subscription'

// Define the keyframe for the rotating animation
const rotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`

const AboutStaff = () => {
  const [appointments, setAppointments] = React.useState([] as AppointmentData[])
  const [customers, setCustomers] = React.useState([] as CustomerResponse[])
  const [visitors, setVisitors] = React.useState([] as VisitorData[])
  const data = useAppSelector((s) => s.staffs.current_staff)
  const user = useAppSelector((s) => s.auth.user)
  // const current_staff_domain = useAppSelector((s) => s.staffs.current_staff_domain)
  const staff = useAppSelector((s) => s.staffs.current_staff)
  const domain_loading = useAppSelector((s) => s.staffs.staffs_loading)

  const dispatch = useAppDispatch()
  const [loading, setLoading] = React.useState(false)
  const [refresh, setRefresh] = React.useState(false)

  const pullData = () => {
    if (user && staff) {
      dispatch(
        asyncGetCurrentStaffDomainData({ domain: staff?.data?.assigned_subdomain as string })
      )
      setLoading(true)
      debounce(() => {
        Promise.all([
          getAllAppointments(user?.uid, (staff?.data.assigned_subdomain as string) ?? ''),
          staffAssignedCustomers(user?.uid, staff.data?.sid),
          staffAssignedVisitors(user?.uid, staff.data?.sid)
        ])
          .then(([ap, cp, vp]) => {
            setAppointments(ap.data ?? [])
            setCustomers(cp ?? [])
            setVisitors(vp)
            setLoading(false)
            setRefresh(false)
          })
          .catch(() => {
            setLoading(false)
            setRefresh(false)
          })
      }, 1000)()
    }
  }

  React.useEffect(() => {
    if (refresh) {
      pullData()
    }
  }, [refresh])
  React.useEffect(() => {
    pullData()
  }, [])

  const render_data = [
    {
      label: 'Customers',
      name: 'FONT_AWESOME',
      icon: 'FaUsers',
      value: customers.length
    },
    {
      label: 'Visitors',
      name: 'REMIX_ICONS',
      icon: 'RiUserSharedFill',
      value: visitors.length
    },
    {
      label: 'Appointments',
      name: 'MATERIAL_DESIGN',
      icon: 'MdDateRange',
      value: appointments.length
    }
  ]

  const [open, setOpen] = React.useState(false)
  const [showAvailable, setShowAvailable] = React.useState(false)
  const current_staff_domain = useAppSelector((s) => s.staffs.current_staff_domain)

  return (
    <>
      <AppointmentsCard open={open} onClose={() => setOpen(false)} />
      <Container>
        <AboutHeader />
        <InnerContainer>
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
            <AvailableSoon open={showAvailable} onClose={() => setShowAvailable(false)} />
            {domain_loading ? (
              <CircularProgress variant="indeterminate" size={24} />
            ) : (
              <>
                {!current_staff_domain?.subscription ? (
                  <PurchaseSubscription handleFunc={() => setRefresh(true)} />
                ) : (
                  <Button
                    focusRipple={false}
                    variant={'contained'}
                    sx={{ margin: '8px 0px 4px 0px' }}
                    disableTouchRipple={true}
                    disableElevation={true}
                    onClick={() => {
                      setOpen(true)
                    }}
                    size={'large'}
                    // disabled={!staff?.data?.assigned_subdomain}
                    startIcon={
                      <CustomIcon
                        name={'LUCIDE_ICONS'}
                        icon="LuExternalLink"
                        color="white"
                        size={18}
                      />
                    }
                  >
                    <CustomTypography variant="body2" lineHeight={'1'}>
                      {!current_staff_domain?.subscription ? 'Buy Subscription' : 'Customize Card'}
                    </CustomTypography>
                  </Button>
                )}
                {!current_staff_domain?.subscription && (
                  <>
                    <CustomTypography
                      fontSize={'0.7rem'}
                      marginBottom={'12px'}
                      textAlign={'center'}
                      maxWidth={'250px'}
                      color={grey['400']}
                    >
                      Buy subscription to create visiting card for {staff?.data?.name}
                    </CustomTypography>
                  </>
                )}
              </>
            )}
            <Divider sx={{ color: 'black', width: '100%', paddingTop: '12px' }} />
            <div
              style={{
                width: '100%',
                padding: '24px 0px',
                // borderTop: '1px solid #dbdbdb',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {render_data.map((e) => (
                <Count>
                  <CustomIcon
                    name={e.name as keyof typeof Icons}
                    icon={e.icon as AllIcons}
                    color={'white'}
                    changeCursor={false}
                    sx={{
                      padding: '12px',
                      backgroundColor: '#2c3bbd',
                      borderRadius: '100px'
                    }}
                  />
                  <div>
                    <CustomTypography fontSize={'12px'} color={grey['500']}>
                      Total {e.label}
                    </CustomTypography>
                    <CustomTypography variant={'h5'}>
                      {Number(e.value).toLocaleString('en-IN')}
                    </CustomTypography>
                  </div>
                  <CustomIcon
                    name={'LUCIDE_ICONS'}
                    icon={'LuRefreshCcw'}
                    onClick={() => setRefresh(true)}
                    sx={{
                      padding: '12px',
                      borderRadius: '100px',
                      animation: loading ? `${rotate}  2s  linear infinite` : 'none' // Applying the rotation animation
                    }}
                  />
                </Count>
              ))}
            </div>
          </Profile>
          <div className="main-container">
            <StaffContent appointments={appointments} customers={customers} visitors={visitors} />
          </div>
        </InnerContainer>
      </Container>
    </>
  )
}

export default AboutStaff

const InnerContainer = styled('div')({
  width: '100%',
  height: '100%',
  display: 'grid',
  gridTemplateColumns: '380px 1fr',
  gap: '24px',
  '.main-container': {
    width: '100%',
    height: 'max-content',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    borderRadius: '12px'
  }
})

const Container = styled('div')({
  width: '100%',
  transition: 'all .3s',
  height: 'calc(var(--vh, 1vh) * 100 - 124px)',
  maxHeight: 'calc(var(--vh, 1vh) * 100 - 124px)',
  overflow: 'hidden',
  position: 'relative',
  top: 0,
  display: 'grid',
  gridTemplateColumns: '1fr',
  gridTemplateRows: 'auto 1fr',
  gap: '12px',
  backgroundColor: grey['100'],
  borderRadius: '12px'
})

const Profile = styled('div')({
  width: '100%',
  height: 'max-content',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'white',
  borderRadius: '12px',
  padding: '12px 24px'
})

const Count = styled('div')({
  width: '100%',
  height: 'max-content',
  padding: '4px',
  display: 'grid',
  gridTemplateColumns: 'auto 1fr auto',
  alignItems: 'center',
  gap: '12px',
  margin: '4px 0px',
  borderRadius: '100px',
  border: '1px solid #dadada'
})
