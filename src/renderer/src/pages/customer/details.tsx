import { styled, Tab, Tabs } from '@mui/material'
import CustomDetailSidebar from './detail-sidebar'
import { useAppSelector, useAppDispatch } from '@renderer/redux/store/hook'
import React from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import CustomIcon from '@renderer/components/icons'
import CustomTypography from '@renderer/components/typography'
import { resetCurrentUser } from '@renderer/redux/features/user/customers'
import { grey } from '@mui/material/colors'

const CustomerDetails = () => {
  const dispatch = useAppDispatch()
  const location = useLocation()

  const { current_customer, current_customer_loading } = useAppSelector((s) => s.customer)
  const navigate = useNavigate()
  React.useEffect(() => {
    console.log(current_customer)
    if (!current_customer?.data?.cid && !current_customer_loading) {
      navigate('/customers', { replace: true })
    }
  }, [current_customer])

  const [tab, setTab] = React.useState('')

  const isRecords = location.pathname.includes('records')
  const outletAvailable = location.pathname.split(`/customers/${current_customer?.data?.cid}/`)[1]

  console.log('Location', location.pathname)

  return (
    <>
      <Container
        className="scrollbar"
        style={{
          gridTemplateColumns: isRecords ? '1fr' : 'minmax(280px, 420px) 1fr'
        }}
      >
        {!isRecords && (
          <div style={{ width: '100%', height: 'max-content', position: 'sticky', top: 110 }}>
            <Header
              sx={{
                height: '44px'
              }}
            >
              <CustomTypography
                sx={{ gap: 8, cursor: 'pointer' }}
                color={grey['600']}
                onClick={() => dispatch(resetCurrentUser())}
              >
                <CustomIcon
                  name="LUCIDE_ICONS"
                  icon={'LuArrowLeft'}
                  color={grey['600']}
                  stopPropagation={false}
                />
                Back to Customers
              </CustomTypography>
            </Header>
            <CustomDetailSidebar data={current_customer} />
          </div>
        )}
        <DetailsBar>
          <Header sx={{ height: '44px' }}>
            <Tabs
              value={tab}
              onChange={(_, value) => {
                setTab(value)
              }}
            >
              {isRecords && (
                <Tab
                  disableFocusRipple
                  disableRipple
                  disableTouchRipple
                  label={'Back'}
                  onClick={() => {
                    const path = `/customers/${current_customer?.data?.cid}`
                    navigate(path)
                  }}
                  value={'home'}
                />
              )}
              <Tab
                disableFocusRipple
                disableRipple
                disableTouchRipple
                label={'Records'}
                onClick={() => {
                  const path = `/customers/${current_customer?.data?.cid}/records`
                  navigate(path)
                }}
                value={'records'}
              />
              <Tab
                disableFocusRipple
                disableRipple
                disableTouchRipple
                label={'Photo gallery'}
                value={'photo gallery'}
                onClick={() => {
                  const path = `/customers/${current_customer?.data?.cid}/photo_gallery`
                  navigate(path)
                }}
              />
            </Tabs>
          </Header>
          {outletAvailable && (
            <DetailsContainer>
              <Outlet />
            </DetailsContainer>
          )}
        </DetailsBar>
      </Container>
    </>
  )
}

export default CustomerDetails

const Header = styled('div')({
  width: '100%',
  height: '100%',
  marginBottom: '12px',
  borderRadius: '12px',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 18px',
  // position: 'absolute',
  // top: 0,
  // left: 0,
  // zIndex: 10,
  backgroundColor: 'white'
})

const Container = styled('div')({
  width: '100%',
  display: 'grid',
  gap: '16px'
})

const DetailsBar = styled('div')({
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
  overflow: 'auto',
  '& .sticky': {
    position: 'sticky',
    top: 0,
    left: 0
  }
})

const DetailsContainer = styled('div')({
  width: '100%',
  height: 'auto',
  backgroundColor: 'white',
  borderRadius: 12,
  padding: '12px 24px'
})
