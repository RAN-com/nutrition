import { CircularProgress, debounce, styled } from '@mui/material'
import CustomTypography from '@renderer/components/typography'
import { getTotalRevenue } from '@renderer/firebase'
import { getTotalCustomer } from '@renderer/firebase/customers'
import { getAllProductsSize } from '@renderer/firebase/order'
import { getTotalStaffs } from '@renderer/firebase/staffs'
import { useAppSelector } from '@renderer/redux/store/hook'
import { priceToLetters } from '@renderer/utils/functions'
import React from 'react'
import { useNavigate } from 'react-router-dom'

const Home = () => {
  const user = useAppSelector((s) => s.auth.user)

  const [totalProducts, setTotalProducts] = React.useState(0)
  const [totalUsers, setTotalUsers] = React.useState(0)
  const [totalRevenue, setTotalRevenue] = React.useState(0)
  const [totalStaffs, setTotalStaffs] = React.useState(0)

  const [loading, setLoading] = React.useState(false)

  const navigate = useNavigate()

  React.useEffect(() => {
    if (user) {
      setLoading(true)
      debounce(() => {
        Promise.all([
          getTotalCustomer(user?.uid),
          getAllProductsSize(user?.uid),
          getTotalRevenue(user?.uid),
          getTotalStaffs(user?.uid)
        ])
          .then(([users, products, revenue, staffs]) => {
            setLoading(false)
            setTotalUsers(users)
            setTotalProducts(products)
            setTotalRevenue(revenue.total)
            setTotalStaffs(staffs)
          })
          .catch((e) => {
            setLoading(false)
            console.error(e)
          })
      }, 600)()
    }
  }, [])

  const values = [
    { title: 'Total Customers', data: totalUsers },
    { title: 'Total Products', data: totalProducts },
    { title: 'Total Staffs', data: totalStaffs },
    {
      title: 'Total Revenue',
      data: priceToLetters(Number(totalRevenue) || 0)
    }
  ]

  const handleClick = (id: string) => {
    if (id === 'Total Customers') {
      navigate('/customers')
    } else if (id === 'Total Products') {
      navigate('/products')
    } else if (id === 'Total Revenue') {
      navigate('/billing')
    } else if (id === 'Total Staffs') {
      navigate('/staffs')
    }
  }

  const colors = [
    'rgba(255, 99, 132, 0.3)',
    'rgba(54, 162, 235, 0.3)',
    'rgba(255, 206, 86, 0.3)',
    'rgba(75, 192, 192, 0.3)',
    'rgba(153, 102, 255, 0.3)',
    'rgba(255, 159, 64, 0.3)'
  ]

  return (
    <Container>
      <CardContainer>
        {values.map((v, idx) => (
          <Card
            sx={{
              // generate random background
              backgroundColor: colors[idx % colors.length]
            }}
            onClick={() => handleClick(v.title)}
          >
            <CustomTypography
              variant={'body1'}
              fontWeight={'bold'}
              fontFamily={'Syne'}
              color={colors[idx % colors.length].replace('0.3', '1')}
            >
              {v.title}
            </CustomTypography>

            <CustomTypography variant={'h2'} fontWeight={'normal'}>
              {loading ? (
                <CircularProgress sx={{ marginTop: '24px' }} variant={'indeterminate'} size={24} />
              ) : (
                v.data
              )}
            </CustomTypography>
          </Card>
        ))}
      </CardContainer>
    </Container>
  )
}

export default Home

const Container = styled('div')(({}) => ({
  width: '100%',
  height: `calc(${window.screen.availHeight}px - 164px)`,
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '24px'
}))

const CardContainer = styled('div')({
  width: '100%',
  height: 'max-content',
  gap: '32px',
  padding: '12px 4px',
  display: 'flex',
  flexDirection: 'row'
})

const Card = styled('div')({
  // minWidth: '240px',
  flexGrow: 1,
  maxWidth: '100%',
  height: 'max-content',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '12px',
  padding: '14px 16px',
  cursor: 'pointer',
  position: 'relative',
  top: 0
})
