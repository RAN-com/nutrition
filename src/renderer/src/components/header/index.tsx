import { Badge, Chip, Menu, MenuItem, styled, Tooltip, Typography } from '@mui/material'
import { useAppSelector, useAppDispatch } from '@renderer/redux/store/hook'
import CustomTypography from '../typography'
import { grey } from '@mui/material/colors'
import CustomIcon from '../icons'
import React from 'react'
import { setLogoutFlag } from '@renderer/redux/features/user/auth'
import moment from 'moment'
import { useNavigate } from 'react-router-dom'
import { Notification } from '@renderer/types/notification'

const greetings = () => {
  const time = new Date().getHours()
  if (time < 12) return 'Good morning'
  if (time < 18) return 'Good afternoon'
  return 'Good evening'
}

type Props = {
  toggleSidebar: () => void
  showToggle: boolean
}

const clock = () => {
  const [time, setTime] = React.useState(moment().format('hh:mm:ss AA'))
  React.useEffect(() => {
    const interval = setInterval(() => {
      setTime(moment().format('hh:mm:ss'))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return {
    time,
    date: moment().format('DD MMM YYYY'),
    time24: moment().format('HH:mm:ss'),
    timeFormat: moment().format('A')
  }
}

const Header = ({ toggleSidebar, showToggle }: Props) => {
  const user = useAppSelector((s) => s.auth.user)
  const dispatch = useAppDispatch()
  const [anchorEl, setAnchorEl] = React.useState<Element | null>(null)

  const navigate = useNavigate()

  const { time, timeFormat, date } = clock()
  const isProfile = window.location.pathname.includes('profile')
  const isNotification = window.location.pathname.includes('notifications')
  const isDev = useAppSelector((s) => s.ui.toggle_dev_mode)

  const [showNotification, setShowNotification] = React.useState<Element | null>(null)
  const notifications = useAppSelector((s) => s.auth.notifications?.filter((e) => !e.read))
  const isMoreNotification = notifications?.length > 7
  return (
    <HeaderContainer className="header" sx={{ backgroundColor: isDev ? '#96c9fa' : '#fff' }}>
      <div className="greet">
        <CustomTypography variant="h4" lineHeight={1}>
          {greetings()}
        </CustomTypography>
        {user && (
          <CustomTypography variant="h6" fontWeight={'500'} color={grey['700']} marginTop={'4px'}>
            {user.name}
          </CustomTypography>
        )}
      </div>
      <div className="icons">
        {showToggle && (
          <CustomIcon
            stopPropagation={false}
            onClick={() => toggleSidebar()}
            name="MATERIAL_DESIGN"
            icon={'MdMenu'}
            color={grey['600']}
          />
        )}
        <Tooltip title={date} arrow>
          <span>
            <CustomTypography variant="body2" color={grey['600']} textTransform={'uppercase'}>
              {time + ' ' + timeFormat.split('').join('.')}
            </CustomTypography>
          </span>
        </Tooltip>
        <Tooltip
          title={
            user?.subscription
              ? `Valid till ${moment(user?.subscription?.valid_till).format('DD MMM YYYY')}`
              : 'No Subscription'
          }
          arrow
        >
          <Chip
            sx={{
              backgroundColor: user?.subscription ? '#4caf4f55' : '#f44336',
              color: 'white',
              '& .MuiChip-label': {
                fontSize: '0.75rem'
              }
            }}
            avatar={
              <div
                style={{
                  width: '15px',
                  height: '15px',
                  borderRadius: '50%',
                  backgroundColor: user?.subscription ? '#4caf4f' : '#f44336'
                }}
              ></div>
            }
            label={
              <CustomTypography variant="body2" color={user?.subscription ? '#4caf4f' : 'black'}>
                {user?.subscription
                  ? `
                  ${user?.subscription?.type}
                `
                  : 'No Subscription'}
              </CustomTypography>
            }
          />
        </Tooltip>
        {!isNotification && (
          <Badge
            badgeContent={notifications?.length > 7 ? '7+' : notifications.length}
            color={'primary'}
            sx={{
              margin: '0px 12px'
            }}
            onClick={(e) => setShowNotification(e.currentTarget)}
          >
            <CustomIcon name="FONT_AWESOME" icon="FaRegBell" stopPropagation={false} />
          </Badge>
        )}
        {!isProfile && (
          <>
            {user?.photo_url ? (
              <img
                src={user?.photo_url}
                alt={user?.name}
                onClick={(e) => {
                  setAnchorEl(e.currentTarget)
                }}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '100px',
                  cursor: 'pointer'
                }}
              />
            ) : (
              <CustomIcon
                name="BOX_ICONS"
                icon={'BiUser'}
                color={grey['600']}
                onClick={(e) => {
                  setAnchorEl(e.currentTarget)
                }}
              />
            )}
          </>
        )}
        <Menu
          anchorEl={showNotification}
          open={!!showNotification}
          onClose={() => setShowNotification(null)}
        >
          {notifications.length === 0 ? (
            <MenuItem
              disableRipple
              disableTouchRipple
              sx={{
                cursor: 'default',
                '&:hover': {
                  backgroundColor: 'transparent'
                }
              }}
            >
              <CustomTypography>No Unread Notifications</CustomTypography>
            </MenuItem>
          ) : (
            notifications.slice(0, isMoreNotification ? 7 : 10).map((e) => (
              <NotificationMsg
                {...e}
                onClick={() => {
                  setShowNotification(null)
                  navigate(`/notifications?nId=${e.id}`, { preventScrollReset: true })
                }}
              />
            ))
          )}
          {
            <MenuItem
              onClick={() => {
                setShowNotification(null)
                navigate(`/notifications`, { preventScrollReset: true })
              }}
            >
              <Typography color={'primary'} variant="body2">
                Go to Notifications
              </Typography>
            </MenuItem>
          }
        </Menu>
        <Menu
          open={!!anchorEl}
          anchorEl={anchorEl}
          onClose={() => setAnchorEl(null)}
          sx={{
            '.MuiPaper-root': {
              backgroundColor: '#f5f5f5'
            }
          }}
        >
          <MenuItem
            sx={{
              // gap: '12px',
              padding: '2px 24px',
              boxShadow: 'unset',
              '&:hover': {
                backgroundColor: 'transparent'
              }
            }}
            // disableGutters={true}
            disableRipple={true}
            disableTouchRipple={true}
            onClick={() => {
              setAnchorEl(null)
              navigate('/profile')
            }}
          >
            {/* <CustomIcon name={'BOX_ICONS'} icon={'BiUser'} color={'black'} size={18} /> */}
            <CustomTypography>Profile</CustomTypography>
          </MenuItem>
          <MenuItem
            sx={{
              // gap: '12px',
              padding: '2px 24px',
              boxShadow: 'unset',
              gap: 32,
              '&:hover': {
                backgroundColor: 'transparent'
              }
            }}
            disableGutters={true}
            disableRipple={true}
            disableTouchRipple={true}
            onClick={() => {
              setAnchorEl(null)
              dispatch(setLogoutFlag(true))
            }}
          >
            <CustomIcon name={'MATERIAL_DESIGN'} icon={'MdLogout'} color={'red'} size={18} />
            <CustomTypography color={'red'}>Logout</CustomTypography>
          </MenuItem>
        </Menu>
      </div>
    </HeaderContainer>
  )
}

export default Header

const NotificationMsg = (data: Notification & { onClick(): void }) => {
  return (
    <MenuItem
      disableRipple
      disableTouchRipple
      onClick={data.onClick}
      style={{
        width: '100%',
        minWidth: '320px',
        maxWidth: '320px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start'
      }}
    >
      {/* <div style={{ width: '100%' }}> */}
      <CustomTypography fontWeight={'600'}>{data.title}</CustomTypography>
      <CustomTypography
        fontWeight={'400'}
        fontSize={'12px'}
        width={'100%'}
        maxWidth={'100%'}
        overflow={'hidden'}
        flexWrap={'wrap'}
        textOverflow={'ellipsis'}
      >
        {data.message.slice(0, 50).concat('...')}
      </CustomTypography>
      {/* </div> */}
    </MenuItem>
  )
}

const HeaderContainer = styled('header')({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexGrow: 1,
  zIndex: 1000,
  boxShadow: '0px 0px 3px 0px #9c9c9c',
  backgroundColor: '#FEFEFE',
  '.greet': {
    display: 'flex',
    flexDirection: 'column',
    '& span': {
      fontSize: '1.2rem'
    }
  },
  '.icons': {
    display: 'flex',
    gap: '12px',
    alignItems: 'center'
  }
})
