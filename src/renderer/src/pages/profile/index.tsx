import { Divider, MenuItem, styled } from '@mui/material'
import CustomIcon from '@renderer/components/icons'
import { TSidebarOptions } from '@renderer/components/sidebar'
import CustomTypography from '@renderer/components/typography'
import { useAppSelector } from '@renderer/redux/store/hook'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

const menu: TSidebarOptions[] = [
  {
    label: 'Personal',
    value: ''
  }
]
const ProfilePage = () => {
  const navigate = useNavigate()
  const path = useLocation()

  const version = useAppSelector((s) => s.auth.app_version)

  return (
    <Container>
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
        <CustomTypography fontSize={'12px'} margin={'auto'} padding={'12px 0px 4px 0px'}>
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
