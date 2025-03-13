import { Chip, Menu, MenuItem, Modal, styled, Tooltip } from '@mui/material'
import { useAppSelector, useAppDispatch } from '@renderer/redux/store/hook'
import CustomTypography from '../typography'
import { grey } from '@mui/material/colors'
import CustomIcon from '../icons'
import React from 'react'
import { errorToast } from '@renderer/utils/toast'
import { deleteFile, uploadFiles } from '@renderer/lib/upload-img'
import { asyncUpdateUser, setLogoutFlag } from '@renderer/redux/features/user/auth'
import moment from 'moment'

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
  const [loading, setLoading] = React.useState(false)
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true)
    setAnchorEl(null)
    try {
      const files = e.target.files?.[0]
      if (!user?.uid) return errorToast('Login Expired. Try Again')
      if (!files) return errorToast('Select a valid file')
      if (user?.photo_url) {
        await deleteFile(user?.photo_url?.split('.com')[0] ?? '')
      }
      const upload = await uploadFiles(user?.uid, [files], ['profile'])
      if (upload?.[0]) {
        dispatch(asyncUpdateUser({ ...user, photo_url: upload?.[0]?.Location }))
        setLoading(false)
        return null
      }
      setAnchorEl(null)
      setLoading(false)
    } catch (err) {
      console.log(err)
      setLoading(false)

      setAnchorEl(null)
      return null
    }
    setLoading(false)

    setAnchorEl(null)
    return
  }

  const { time, timeFormat, date } = clock()

  return (
    <HeaderContainer className="header">
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
        <Modal open={loading}>
          <div></div>
        </Modal>
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
              padding: '8px 24px',
              boxShadow: 'unset',
              position: 'relative',
              top: 0,
              '&:hover': {
                backgroundColor: 'transparent'
              },
              '& input[type=file]': {
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: 1000,
                width: '100%',
                height: '100%',
                cursor: 'pointer',
                opacity: 0
              }
            }}
            disableGutters={true}
            disableRipple={true}
            disableTouchRipple={true}
          >
            <input title={''} type={'file'} accept={'image/*'} onChange={handleImageChange} />
            <CustomTypography>Update Picture</CustomTypography>
          </MenuItem>
          <MenuItem
            sx={{
              // gap: '12px',
              padding: '2px 24px',
              boxShadow: 'unset',
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
