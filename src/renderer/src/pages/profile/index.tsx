import { Button, Dialog, Divider, MenuItem, styled } from '@mui/material'
import CustomIcon from '@renderer/components/icons'
import { TSidebarOptions } from '@renderer/components/sidebar'
import CustomTypography from '@renderer/components/typography'
import { useAppSelector, useAppDispatch } from '@renderer/redux/store/hook'
import { setShowAvailableModal, toggleDevMode } from '@renderer/redux/features/ui/slice'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { closeSnackbar, enqueueSnackbar, SnackbarProvider } from 'notistack'
import zIndex from '@mui/material/styles/zIndex'
import CustomTextInput from '@renderer/components/text-input'
import { decryptData, encryptData } from '@renderer/utils/crypto'

const menu: TSidebarOptions[] = [
  {
    label: 'Personal',
    value: ''
  },
  {
    label: 'App Updates',
    value: ''
  }
]
const ProfilePage = () => {
  const navigate = useNavigate()
  const path = useLocation()

  const version = useAppSelector((s) => s.auth.app_version)
  const dispatch = useAppDispatch()

  const [clickCount, setClickCount] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [lastClickTime, setLastClickTime] = useState<number | null>(null)
  const isDevMode = useAppSelector((s) => s.ui.toggle_dev_mode)

  const handleVersionClick = () => {
    const now = Date.now()

    if (isDevMode) {
      // If developer mode is already enabled, do not count clicks
      enqueueSnackbar('Do you want to disable developer mode?', {
        variant: 'warning',
        autoHideDuration: 2000,
        preventDuplicate: true,
        action: (key) => (
          <>
            <Button
              variant="text"
              color={'inherit'}
              disableTouchRipple
              disableRipple
              disableElevation
              disableFocusRipple
              sx={{ padding: '0px' }}
              onClick={() => {
                closeSnackbar(key)
                dispatch(toggleDevMode(false))
                enqueueSnackbar('Developer mode disabled!', {
                  variant: 'success',
                  autoHideDuration: 2000,
                  preventDuplicate: true
                })
                setClickCount(0)
                setShowModal(false)
              }}
            >
              Yes
            </Button>
            <Button
              variant="text"
              color={'inherit'}
              disableTouchRipple
              disableRipple
              disableElevation
              disableFocusRipple
              sx={{ padding: '0px' }}
              onClick={() => {
                closeSnackbar(key)
              }}
            >
              No
            </Button>
          </>
        )
      })
      return
    }
    if (lastClickTime && now - lastClickTime > 2000) {
      // Reset click count if more than 2 seconds have passed since the last click
      setClickCount(0)
    }

    setClickCount((prev) => prev + 1)
    setLastClickTime(now)

    if (clickCount + 1 === 10) {
      // Enable developer mode
      setShowModal(true)
      setClickCount(0) // Reset the counter after enabling dev mode
    } else {
      setShowModal(false)
    }
  }

  const [password, setPassword] = useState('')

  return (
    <Container>
      <SnackbarProvider />
      <Sidebar>
        <CustomTypography variant="h4">Personal</CustomTypography>
        <Divider
          sx={{
            margin: '12px 0px'
          }}
        />
        {menu.map((e) => (
          <MenuItem
            selected={(path.pathname.split('/profile/')?.[1] ?? '') === e.value}
            onClick={() => {
              if (e.label === 'App Updates') {
                dispatch(setShowAvailableModal(true))
                return
              }
              navigate(`/profile${e.value === '' ? '' : `/${e.value}`}`)
            }}
            sx={{
              padding: '12px 12px',
              borderRadius: '12px',
              margin: '4px 0px'
            }}
            disableRipple
            disableTouchRipple
          >
            <CustomTypography flexGrow={1}>{e.label}</CustomTypography>
            {/* <ListItemIcon> */}
            <CustomIcon name="LUCIDE_ICONS" icon="LuChevronRight" color={'black'} />
            {/* </ListItemIcon> */}
          </MenuItem>
        ))}
        <CustomTypography
          onClick={handleVersionClick}
          fontSize={'12px'}
          margin={'auto'}
          padding={'12px 0px 4px 0px'}
          sx={{ cursor: 'pointer' }}
        >
          v.{version}
        </CustomTypography>
      </Sidebar>
      <FormContainer>
        <Header>
          <CustomTypography variant="h4" fontWeight={'normal'}>
            {path.pathname.split('/profile/')[1] ?? 'My Profile'}
          </CustomTypography>
        </Header>
        <Outlet />
      </FormContainer>
      <DevMode
        onClose={() => setShowModal(false)}
        showModal={showModal}
        toggle_dev_mode={isDevMode}
        onPasswordChange={(value) => {
          setPassword(value)
        }}
        password={password}
        onSubmit={() => {
          if (
            password?.length >= 8 &&
            encryptData(password) === import.meta.env.VITE_VERCEL_DEVMODE_KEY
          ) {
            enqueueSnackbar('Developer mode enabled!', {
              variant: 'success',
              autoHideDuration: 2000,
              preventDuplicate: true
            })
            setShowModal(false)
            setPassword('')
            dispatch(toggleDevMode(true))
          }
        }}
      />
    </Container>
  )
}

export default ProfilePage

const Container = styled('div')({
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'row',
  gap: 24
})

const Sidebar = styled('div')(({ theme }) => ({
  width: '100%',
  height: 'max-content',
  backgroundColor: 'white',
  maxWidth: '320px',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 16,
  padding: '12px 16px',
  [theme.breakpoints.down(1280)]: {
    maxWidth: '260px'
  },
  transition: 'all .3s'
}))

const FormContainer = styled('div')({
  width: '100%',
  height: 'max-content',
  padding: '12px 24px',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 16,
  backgroundColor: 'white',
  gap: 16
})

const Header = styled('div')({
  width: '100%',
  // maxHeight: '44px',
  padding: '12px 0px',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  borderBottom: '1px solid'
})

type Props = {
  onClose(): void
  showModal: boolean
  toggle_dev_mode?: boolean
  onPasswordChange?(value: string): void
  password?: string
  onSubmit?(): void
}
const DevMode = ({
  onClose,
  showModal,
  toggle_dev_mode,
  onPasswordChange,
  password,
  onSubmit
}: Props) => {
  const dec = decryptData(import.meta.env.VITE_VERCEL_DEVMODE_KEY!)
  const isValidPassword = password && dec === password

  return (
    <Dialog
      open={showModal}
      onClose={onClose}
      sx={{
        '.MuiPaper-root': {
          width: '100%',
          maxWidth: '320px',
          padding: '16px 24px',
          paddingBottom: '32px',
          position: 'relative',
          top: 0,
          gap: '12px'
        },
        zIndex: zIndex.modal * zIndex.modal
      }}
    >
      {toggle_dev_mode ? (
        <div
          style={{
            display: 'flex',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '8px',
            padding: '0px'
          }}
        >
          <CustomTypography textAlign={'center'}>
            You already have access to dev mode
          </CustomTypography>
          <Button fullWidth variant="contained" onClick={onClose}>
            Close
          </Button>
        </div>
      ) : (
        <>
          <CustomTypography variant="h6">Enable Access</CustomTypography>
          <CustomTextInput
            input={{
              onKeyDown: (e) => {
                if (e.key === 'Enter' && isValidPassword) {
                  onClose?.()
                  onSubmit?.()
                  onPasswordChange?.('')
                }
              },
              value: password,
              autoFocus: true,
              size: 'small',
              onChange: (e) => onPasswordChange?.(e.target.value),
              type: 'password',
              label: 'Enter your developer password'
            }}
          />
          <Button
            disabled={password?.length === 0 || !isValidPassword}
            variant="contained"
            onClick={() => {
              onClose?.()
              onSubmit?.()
              onPasswordChange?.('')
            }}
          >
            Submit
          </Button>
        </>
      )}
    </Dialog>
  )
}
