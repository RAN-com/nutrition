import { useAppSelector } from '@renderer/redux/store/hook'
import { Button, debounce, styled } from '@mui/material'
import CustomTypography from '@renderer/components/typography'
import React from 'react'
import {
  deleteNotification,
  markAllAsRead,
  readNotification
} from '@renderer/firebase/notifications'
import { grey } from '@mui/material/colors'
import { useSearchParams } from 'react-router-dom'
import PageHeader from '@renderer/components/header/pageHeader'
import { AppointmentData } from '@renderer/types/staff'
import moment from 'moment'
import { enqueueSnackbar, SnackbarProvider } from 'notistack'

const Notifications = () => {
  const { notifications, user } = useAppSelector((s) => s.auth)
  const [query] = useSearchParams()
  const id = query.get('nId')
  const [highlight, setHighlight] = React.useState<string | undefined>()
  const [showFull, setShowFull] = React.useState<string | undefined>()

  const isNotificationAvailable = notifications?.length >= 1
  const allRead = notifications.every((e) => e.read)

  const staffs = useAppSelector((s) => s.staffs.staffs)

  const sendMessage = (appointment: AppointmentData) => {
    // Implement your send message logic here
    const message = messageTemplate(appointment)

    // whatsapp embed url
    const url = new URL('https://wa.me/')
    url.searchParams.set('phone', appointment.phone || '')
    url.searchParams.set('text', message.trim())
    enqueueSnackbar('Opening WhatsApp to send message...', {
      preventDuplicate: true,
      variant: 'info',
      autoHideDuration: 1200
    })
    window.open(url, '_blank')
  }

  const messageTemplate = (appointment: AppointmentData) => {
    const staff = staffs.find((s) => s.data?.sid === appointment.assigned_to?.sid)
    if (!staff) {
      return 'Staff not found for the appointment.'
    }
    if (!appointment.name || !appointment.createdOn || !appointment.createdOn) {
      return 'Appointment details are incomplete.'
    }
    if (!appointment.assigned_to?.sid) {
      return 'Assigned staff ID is missing for the appointment.'
    }
    return `
  To: ${appointment.name}\n
  Date: ${moment(appointment.createdOn).format('YYYY-MM-DD')}\n
\n
\n
  Dear ${appointment.name},\n
\n
  This is to confirm your appointment scheduled for ${moment(appointment.createdOn).format('YYYY-MM-DD')}. Please ensure you arrive on time and bring any necessary documents or prior medical records for a smoother consultation.\n
  \n
  If you have any questions or need to reschedule, feel free to contact us in advance.\n
\n
  Best regards,\n
  ${staff.data?.name || user?.name || ''}\n
  ${appointment.mapLocation ? `Map Location: ${appointment.mapLocation || '-'}` : ''}\n`
  }

  React.useEffect(() => {
    if (id) {
      const qr = `#notification-${id}`.toString()
      setHighlight(id)
      const doc = document.querySelector(qr)
      if (!doc) return
      setHighlight(id)
      readNotification(user?.uid as string, id)
      doc.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      debounce(() => {
        setHighlight(undefined)
        query.delete('nId')
      }, 1000)()
    }
  }, [id])

  return (
    <>
      <SnackbarProvider />
      <Container
        sx={{
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          gap: '12px'
        }}
      >
        <PageHeader
          sx={{ position: 'sticky', top: 0 }}
          start={<CustomTypography variant="h6">Notifications</CustomTypography>}
          end={
            isNotificationAvailable && (
              <div>
                <Button
                  onClick={() => markAllAsRead(user?.uid as string)}
                  size="small"
                  disableElevation
                  disableFocusRipple
                  disableRipple
                  disableTouchRipple
                  disabled={allRead}
                >
                  <CustomTypography variant="body2">Mark all as read</CustomTypography>
                </Button>
              </div>
            )
          }
        />
        {/* <NotificationList> */}
        <NotificationList>
          {isNotificationAvailable ? (
            notifications.map((notification, index) => (
              <NotificationItem
                id={`notification-${notification.id}`}
                key={index}
                sx={{
                  backgroundColor:
                    notification.id === highlight
                      ? grey['300']
                      : !notification.read
                        ? 'white'
                        : grey['100']
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexGrow: 1,
                    flexDirection: 'column',
                    alignItems: 'flex-start'
                  }}
                >
                  <CustomTypography
                    variant="body1"
                    fontWeight={'700'}
                    color={notification.read ? 'textDisabled' : 'textPrimary'}
                  >
                    {notification.title}
                  </CustomTypography>
                  <CustomTypography
                    variant="body2"
                    color={notification.read ? 'textDisabled' : 'textPrimary'}
                    sx={{
                      display: 'inline-block'
                    }}
                  >
                    {notification.message.slice(
                      0,
                      showFull?.includes(notification.id) ? 100000 : 100
                    )}
                    {!showFull?.includes(notification.id) && '...'}
                    {'  '}
                    <CustomTypography
                      onClick={() => {
                        setShowFull((prev) =>
                          prev === notification.id ? undefined : notification.id
                        )
                      }}
                      textTransform={'none'}
                      fontSize={'14px'}
                      sx={{
                        display: 'inline-block',
                        cursor: 'pointer',
                        color: 'primary',
                        whiteSpace: 'nowrap'
                      }}
                      color={'primary'}
                    >
                      {showFull?.includes(notification.id) ? 'Show less' : 'Show more'}
                    </CustomTypography>
                  </CustomTypography>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <Button
                    onClick={() => {
                      if (notification?.metadata?.appointment) {
                        sendMessage(notification?.metadata?.appointment)
                      }
                      if (notification?.read) return
                      readNotification(user?.uid as string, notification.id, !notification.read)
                    }}
                    disableRipple
                    disableFocusRipple
                    disableTouchRipple
                  >
                    <CustomTypography
                      textTransform={'none'}
                      fontSize={'14px'}
                      sx={{
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {notification.read ? 'Resend message' : 'Send Message'}
                    </CustomTypography>
                  </Button>
                  <Button
                    disableRipple
                    disableFocusRipple
                    disableTouchRipple
                    onClick={() => deleteNotification(user?.uid as string, notification.id)}
                  >
                    <CustomTypography
                      textTransform={'none'}
                      fontSize={'14px'}
                      sx={{
                        whiteSpace: 'nowrap'
                      }}
                      color={'error'}
                    >
                      {'Delete'}
                    </CustomTypography>
                  </Button>
                </div>
              </NotificationItem>
            ))
          ) : (
            <div>No Notifications</div>
          )}
        </NotificationList>
      </Container>
    </>
  )
}

export default Notifications

const Container = styled('div')({
  width: '100%',
  transition: 'all .3s'
})

const NotificationList = styled('ul')({
  width: '100%',
  height: 'auto',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: 'white',
  padding: '12px',
  borderRadius: '8px'
})

const NotificationItem = styled('li')`
  padding: 12px;
  margin-bottom: 8px;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  color: #555;
  font-size: 16px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;

  &:last-child {
    margin-bottom: 0;
  }
`
