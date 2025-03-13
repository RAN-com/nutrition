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
          transition: 'all .3s'
        }}
        className={`${isOnboarding ? 'layout-onboard' : ''}`}
      >
        <div
          style={{ flex: 1, flexGrow: 100, flexBasis: !expand ? 100 : 280, transition: 'all .3s' }}
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
        </div>
        <MainContainer className="scrollbar">
          <Header
            showToggle={isMobile}
            toggleSidebar={() => {
              setShowSidebar((prev) => {
                return !prev
              })
            }}
          />
          {/* <InnerContainer> */}
          <div className="layout scrollbar">{children ? children : <Outlet />}</div>
          {/* </InnerContainer> */}
        </MainContainer>
      </LayoutContainer>
    </>
  )
}

export default LayoutV2

const LayoutContainer = styled('div')(({ theme }) => ({
  width: 'var(--width)',
  maxWidth: '100vw',
  minWidth: '100%',
  // height: '100%',
  height: `var(--height)`,
  position: 'relative',
  top: 0,
  left: 0,
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'row',
  // display: 'grid',
  // gridTemplateRows: '1fr',
  // overscrollBehavior: 'contain',
  // webkitOverflowScrolling: 'touch',
  [theme.breakpoints.down(800)]: {
    display: 'grid',
    gridTemplateColumns: '1fr'
    // gridTemplateRows: '80px 1fr'
  }
}))

const MainContainer = styled('div')({
  width: '100%',
  height: `100%`,
  overflowY: 'scroll',
  margin: '0 auto',
  position: 'relative',
  top: 0,
  display: 'grid',
  gridTemplateColumns: '1fr',
  gridTemplateRows: '100px calc(100% - 100px)',
  backgroundColor: '#f3f3f3',
  padding: '0px',
  paddingBottom: '24px',
  '& .header ': {
    width: '100%',
    margin: '0 auto',
    // maxWidth: '1280px',
    position: 'sticky',
    top: 0,
    display: 'flex',
    flex: 1,
    padding: '18px 24px'
  },
  '& .layout': {
    width: '100%',
    height: '100%',
    maxWidth: '1280px',
    margin: 'auto',
    padding: '12px 24px'
  }
})
