import { styled, useMediaQuery, useTheme } from '@mui/material'
import React from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Sidebar from './sidebar'
import LogoutWarning from './modal/logout'
import Header from './header'
import { useAppSelector, useAppDispatch } from '@renderer/redux/store/hook'
import { auth, refreshData } from '@renderer/firebase'
import { resetUser, setUser } from '@renderer/redux/features/user/auth'
import { errorToast } from '@renderer/utils/toast'

type Props = {
  children?: React.ReactNode
}

const LayoutV2: React.FC<Props> = ({ children }: Props) => {
  const th = useTheme()
  const user = useAppSelector((s) => s.auth.user)
  const isMobile = useMediaQuery(th.breakpoints.down(680))
  const [showSidebar, setShowSidebar] = React.useState(true)
  const isOnboarding = useLocation().pathname.includes('onboarding')
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  React.useEffect(() => {
    if (user) {
      refreshData(user).then((data) => {
        if (data.error && !data.data) {
          errorToast('Failed to fetch data. Please check your internet connection and try again')
          dispatch(resetUser())
          auth.signOut()
        } else {
          dispatch(setUser(data.data))
        }
      })
    } else {
      navigate('/auth/login')
    }
  }, [])

  React.useEffect(() => {
    if (isMobile) {
      setShowSidebar(true)
      return
    }
  }, [window.location.pathname])

  const [expand, setExpand] = React.useState(window.screen.availWidth < 1000)
  const handleExpand = (b: boolean) => {
    if (window.screen.availWidth < 1000) {
      setExpand(true)
    } else {
      setExpand(b)
    }
  }

  return (
    <>
      <LogoutWarning />
      <Toaster
        containerStyle={{ zIndex: 999999999 + 100000 }}
        toastOptions={{
          style: {
            // position: "fixed",
            zIndex: 999999999 + 100000
          }
        }}
      />
      <LayoutContainer
        style={{
          gridTemplateColumns: `${expand ? '240px' : 'auto'} 1fr`,
          transition: 'all .3s'
        }}
        className={`${isOnboarding ? 'layout-onboard' : ''}`}
      >
        <Sidebar
          hideExpand={window.screen.width < 1000}
          expand={expand}
          handleExpand={handleExpand}
          activeRoute={window.location.href}
          isOpened={showSidebar && isMobile ? showSidebar : isMobile ? true : false}
          toggleSidebar={(e) => {
            if (typeof e === 'boolean') {
              setShowSidebar(e)
              return
            } else {
              setShowSidebar((prev) => {
                return !prev
              })
            }
          }}
        />
        <MainContainer>
          <Header
            showToggle={isMobile}
            toggleSidebar={() => {
              setShowSidebar((prev) => {
                return !prev
              })
            }}
          />
          <InnerContainer className="scrollbar">
            <div className="layout scrollbar">{children ? children : <Outlet />}</div>
          </InnerContainer>
        </MainContainer>
      </LayoutContainer>
    </>
  )
}

export default LayoutV2

const LayoutContainer = styled('div')(({ theme }) => ({
  width: '100%',
  maxWidth: '100vw',
  height: '100%',
  position: 'relative',
  top: 0,
  left: 0,
  display: 'grid',
  // gridTemplateColumns: '280px 1fr',
  gridTemplateRows: '1fr',
  overscrollBehavior: 'contain',
  webkitOverflowScrolling: 'touch',
  [theme.breakpoints.down(830)]: {
    display: 'grid',
    gridTemplateColumns: '1fr'
    // gridTemplateRows: '80px 1fr'
  }
}))

const MainContainer = styled('div')({
  width: '100%',
  height: '100%',
  overflowY: 'auto',
  margin: '0 auto',
  position: 'relative',
  top: 0,
  display: 'grid',
  gridTemplateColumns: '1fr',
  gridTemplateRows: '100px 1fr',
  backgroundColor: '#f3f3f3',
  padding: '0px',
  '& .header ': {
    width: '100%',
    margin: '0 auto',
    maxWidth: '1920px',
    padding: '18px 24px'
  }
})

const InnerContainer = styled('div')({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  position: 'relative',
  top: 0,
  overflowY: 'auto',
  padding: '0px',
  maxWidth: '1280px',
  justifySelf: 'center',
  '.layout': {
    width: '100%',
    margin: '0 auto',
    padding: '12px 24px'
  }
})
