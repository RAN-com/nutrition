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

const Notifications = () => {
  const { notifications, user } = useAppSelector((s) => s.auth)
  const [query] = useSearchParams()
  const id = query.get('nId')
  const [highlight, setHighlight] = React.useState<string | undefined>()
  const [showFull, setShowFull] = React.useState<string | undefined>()

  const isNotificationAvailable = notifications?.length >= 1
  const allRead = notifications.every((e) => e.read)

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
                  onClick={() =>
                    readNotification(user?.uid as string, notification.id, !notification?.read)
                  }
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
                    {notification.read ? 'Mark as Unread' : 'Mark as Read'}
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
