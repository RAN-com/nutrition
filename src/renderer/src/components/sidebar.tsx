import Logo from '@renderer/assets/logo.png'
import {
  Fade,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  styled,
  Tooltip,
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
  hideExpand: boolean
  isOpened: boolean
  toggleSidebar(b?: boolean): void
  activeRoute: string | null
  handleExpand(b: boolean): void
  expand: boolean
}

export type TSidebarOptions = {
  label: string
  value: string
  name?: keyof typeof Icons
  icon?: AllIcons
}

const options: (TSidebarOptions & { children: TSidebarOptions[] | null })[] = [
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
    label: 'Marathon',
    value: '/marathon',
    name: 'GAME_ICONS',
    icon: 'GiHealthCapsule',
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

const logoutOption: TSidebarOptions[] = [
  {
    label: 'Pricing',
    value: '/pricing',
    name: 'MATERIAL_DESIGN',
    icon: 'MdPriceChange'
  },
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

const Sidebar = ({
  isOpened,
  toggleSidebar,
  handleExpand,
  expand,
  hideExpand
}: SidebarProps): JSX.Element => {
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
        sx={() => ({
          // all: "inherit",
          display: 'grid',
          width: '100%',
          height: '100%',
          '.sidebar__header': {
            display: 'none'
          },
          '& *': {
            transition: 'all .3s'
          }
        })}
      >
        <LogoContainer>
          <img src={Logo} alt={'LOGO'} />
        </LogoContainer>
        <OptionContainer className="hide-scrollbar">
          {options.map((option) => (
            <>
              <Tooltip title={option.label} placement="right" arrow={true} followCursor={true}>
                <span>
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
                      <ListItemIcon
                        sx={{
                          justifyContent: !expand ? 'center' : 'initial'
                        }}
                      >
                        <CustomIcon
                          stopPropagation={false}
                          name={option.name}
                          icon={option.icon}
                          color={option.value.includes(currentPath) ? '#262627' : '#9D9FA1'}
                        />
                      </ListItemIcon>
                    )}
                    {expand && (
                      <ListItemText>
                        <CustomTypography
                          variant={'body2'}
                          fontWeight={'500'}
                          color={option.value.includes(currentPath) ? '#262627' : '#9D9FA1'}
                        >
                          {option.label}
                        </CustomTypography>
                      </ListItemText>
                    )}
                  </CustomListButton>
                </span>
              </Tooltip>
            </>
          ))}
        </OptionContainer>
        <div
          style={{
            padding: '42px 12px 0px 12px',
            position: 'relative',
            top: 0,
            height: 'auto'
          }}
        >
          <div
            onClick={() => handleExpand(!expand)}
            style={{
              opacity: hideExpand ? 0 : 1,
              pointerEvents: hideExpand ? 'none' : 'all',
              position: 'absolute',
              top: '-20px',
              right: '12px',
              zIndex: 100,
              padding: '8px',
              boxShadow: '#00000012 -2px 2px 3px 5px',
              borderRadius: '100px',
              cursor: 'pointer'
            }}
          >
            <Tooltip
              title={'Toggle Sidebar'}
              placement={expand ? 'left' : 'right'}
              arrow={true}
              followCursor={true}
            >
              <span>
                <CustomIcon
                  name="LUCIDE_ICONS"
                  icon={'LuChevronLeft'}
                  color={'grey'}
                  sx={{
                    transform: `rotate(${expand ? '0deg' : '-180deg'})`,
                    transition: 'all .3s'
                  }}
                  stopPropagation={false}
                />
              </span>
            </Tooltip>
          </div>
          {logoutOption.map((option, idx) => (
            <Tooltip title={option.label} placement="right" arrow={true} followCursor={true}>
              <span>
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
                    <ListItemIcon
                      sx={{
                        justifyContent: !expand ? 'center' : 'initial'
                      }}
                    >
                      <CustomIcon
                        stopPropagation={false}
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
                  {expand && (
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
                  )}
                </CustomListButton>
              </span>
            </Tooltip>
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
  padding: '0px 12px 0px 12px'
})

const CustomListButton = styled(ListItemButton)({})

const LogoContainer = styled('div')({
  width: 'calc(100% - 24px)',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  margin: 'auto',
  '& img': {
    width: '100%',
    maxHeight: '72px',
    maxWidth: '128px',
    objectFit: 'contain'
  }
})
