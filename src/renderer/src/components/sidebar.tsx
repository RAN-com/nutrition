import Logo from '@renderer/assets/logo.png'
import {
  Fade,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  styled,
  useMediaQuery,
  useTheme
} from '@mui/material'
import { useLocation, useNavigate } from 'react-router-dom'
import CustomIcon from './icons'
import { AllIcons, Icons } from '@renderer/types/icon'
import { setLogoutFlag } from '@renderer/redux/features/user/auth'
import { useAppDispatch } from '@renderer/redux/store/hook'
import CustomTypography from './typography'
import React from 'react'
type SidebarProps = {
  isOpened: boolean
  toggleSidebar(b?: boolean): void
  activeRoute: string | null
}

type Options = {
  label: string
  value: string
  name?: keyof typeof Icons
  icon?: AllIcons
}

const options: (Options & { children: Options[] | null })[] = [
  {
    label: 'Dashboard',
    value: '/home',
    name: 'MATERIAL_DESIGN',
    icon: 'MdSpaceDashboard',
    children: null
  },
  {
    label: 'Customers',
    value: '/customers',
    name: 'FONT_AWESOME',
    icon: 'FaUsers',
    children: null
  },
  {
    label: 'Visitors',
    value: '/visitors',
    name: 'REMIX_ICONS',
    icon: 'RiUserSharedFill',
    children: null
  },
  {
    label: 'Staffs',
    value: '/staffs',
    name: 'GRAPHS_ICONS',
    icon: 'GrUserWorker',
    children: null
  },
  {
    label: 'Products',
    value: '/products',
    name: 'FONT_AWESOME',
    icon: 'FaSitemap',
    children: null
  },
  {
    label: 'Billing',
    value: '/billing',
    name: 'MATERIAL_DESIGN',
    icon: 'MdAttachMoney',
    children: null
  }
]

const logoutOption: Options[] = [
  {
    label: 'Profile',
    value: '/profile',
    name: 'BOX_ICONS',
    icon: 'BiUser'
  },
  {
    label: 'Logout',
    value: 'logout',
    name: 'MATERIAL_DESIGN',
    icon: 'MdLogout'
  }
]

const Sidebar = ({ isOpened, toggleSidebar }: SidebarProps): JSX.Element => {
  const dispatch = useAppDispatch()
  const path = useLocation().pathname
  const splitPath = path.split('/')?.[1]
  const currentPath = splitPath === '/' ? 'home' : splitPath
  const navigate = useNavigate()
  const th = useTheme()
  const isMobile = useMediaQuery(th.breakpoints.down(680))

  const handleToggle = (id?: string | undefined): void => {
    if (id) {
      navigate(`${id}`)
    }
    toggleSidebar()
  }

  React.useEffect(() => {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (isOpened) {
          toggleSidebar()
        }
      }
    })
  }, [])

  return (
    <Fade in={!isMobile ? true : isOpened}>
      <Container
        className="cs-bar"
        sx={({ breakpoints }) => ({
          // all: "inherit",
          display: 'grid',
          height: '100%',
          '.sidebar__header': {
            display: 'none'
          },
          [breakpoints.down(830)]: {
            '.sidebar__header': {
              display: 'flex'
            },
            backgroundColor: 'white',
            position: 'absolute',
            top: 0,
            left: 0,
            minWidth: '320px',
            maxWidth: '100%',
            width: '100%',
            zIndex: 9999,
            transition: 'all .3s'
          },
          [breakpoints.down(480)]: {
            width: '100%',
            maxWidth: '100%',
            border: 'none'
          }
        })}
      >
        <LogoContainer>
          <img src={Logo} alt={'LOGO'} />
        </LogoContainer>
        <OptionContainer className="hide-scrollbar">
          {options.map((option) => (
            <>
              <CustomListButton
                disableRipple={true}
                focusRipple={false}
                disableTouchRipple={true}
                onClick={() => {
                  if (option.value === 'logout') {
                    // return handleToggle();
                    dispatch(setLogoutFlag(true))
                    return handleToggle()
                  }
                  handleToggle(option.value)
                }}
                sx={{
                  padding: '6px 24px',
                  width: 'calc(100% - 12px)',
                  margin: 'auto',
                  marginTop: '8px',
                  borderRadius: '12px',
                  ...(option.value === 'logout'
                    ? {
                        '& *': {
                          color: 'red'
                        }
                      }
                    : {
                        color: 'inherit'
                      }),
                  ...(option.value.includes(currentPath)
                    ? {
                        backgroundColor: '#FFFEFE',
                        boxShadow: '0px 0px 3px 0px #9c9c9c',

                        '&:hover': {
                          backgroundColor: '#FFFEFE'
                        }
                      }
                    : {
                        backgroundColor: 'transparent',
                        '&:hover': {
                          backgroundColor: 'transparent'
                        }
                      })
                }}
              >
                {option?.name && option?.icon && (
                  <ListItemIcon>
                    <CustomIcon
                      name={option.name}
                      icon={option.icon}
                      color={option.value.includes(currentPath) ? '#262627' : '#9D9FA1'}
                    />
                  </ListItemIcon>
                )}
                <ListItemText>
                  <CustomTypography
                    variant={'body2'}
                    fontWeight={'500'}
                    color={option.value.includes(currentPath) ? '#262627' : '#9D9FA1'}
                  >
                    {option.label}
                  </CustomTypography>
                </ListItemText>
              </CustomListButton>
            </>
          ))}
        </OptionContainer>
        <div
          style={{
            padding: '42px 12px 0px 12px'
          }}
        >
          {logoutOption.map((option, idx) => (
            <CustomListButton
              key={idx}
              disableRipple={true}
              focusRipple={false}
              disableTouchRipple={true}
              onClick={() => {
                if (option.value === 'logout') {
                  // return handleToggle();
                  dispatch(setLogoutFlag(true))
                  return handleToggle()
                }
                handleToggle(option.value)
              }}
              sx={{
                padding: '6px 24px',
                width: 'calc(100% - 12px)',
                margin: 'auto',
                borderRadius: '12px',
                ...(option.value === 'logout'
                  ? {
                      '& *': {
                        color: 'red'
                      }
                    }
                  : {
                      color: 'inherit'
                    }),
                ...(option.value.includes(currentPath)
                  ? {
                      backgroundColor: '#FFFEFE',
                      boxShadow: '0px 0px 3px 0px #9c9c9c',

                      '&:hover': {
                        backgroundColor: '#FFFEFE'
                      }
                    }
                  : {
                      backgroundColor: 'transparent',
                      '&:hover': {
                        backgroundColor: 'transparent'
                      }
                    })
              }}
            >
              {option?.name && option?.icon && (
                <ListItemIcon>
                  <CustomIcon
                    name={option.name}
                    icon={option.icon}
                    color={
                      option.value.includes('logout')
                        ? 'red'
                        : option.value.includes(currentPath)
                          ? '#262627'
                          : '#9D9FA1'
                    }
                  />
                </ListItemIcon>
              )}
              <ListItemText>
                <CustomTypography
                  variant={'body2'}
                  fontWeight={'500'}
                  color={
                    option.value.includes('logout')
                      ? 'red'
                      : option.value.includes(currentPath)
                        ? '#262627'
                        : '#9D9FA1'
                  }
                >
                  {option.label}
                </CustomTypography>
              </ListItemText>
            </CustomListButton>
          ))}
        </div>
      </Container>
    </Fade>
  )
}

export default Sidebar

const Container = styled('div')(({ theme }) => ({
  height: '100%',
  paddingBottom: '12px',
  overflowY: 'auto',
  gridTemplateColumns: '1fr',
  gridAutoFlow: 'row',
  gridTemplateRows: '80px 1fr auto',
  backgroundColor: '#f9f9f93e',
  '.user_profile_section': {
    display: 'none'
  },
  [theme.breakpoints.down(680)]: {
    '.user_profile_section': {
      display: 'grid'
    }
  },
  boxShadow: '0px 0px 3px 0px #9c9c9c'
}))

const OptionContainer = styled(List)({
  width: '100%',
  height: '100%',
  overflowY: 'auto',
  padding: '42px 12px 0px 12px'
})

const CustomListButton = styled(ListItemButton)({})

const LogoContainer = styled('div')({
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  '& img': {
    width: '100%',
    maxHeight: '72px',
    maxWidth: '128px',
    objectFit: 'contain'
  }
})

// const Header = styled('div')(({ theme }) => ({
//   width: '100%',
//   height: 'max-content',
//   padding: '12px',
//   display: 'flex',
//   flexDirection: 'row',
//   alignItems: 'center',
//   justifyContent: 'space-between',
//   [theme.breakpoints.up(830)]: {
//     display: 'none'
//   }
// }))
