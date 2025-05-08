import { Button, CircularProgress, debounce, styled } from '@mui/material'
import CustomTypography from '@renderer/components/typography'
import { getTotalRevenue } from '@renderer/firebase'
import { getTotalCustomer } from '@renderer/firebase/customers'
import { getAllProductsSize } from '@renderer/firebase/order'
import { getTotalStaffs } from '@renderer/firebase/staffs'
import { asyncGetCustomers } from '@renderer/redux/features/user/customers'
import { asyncGetStaffs } from '@renderer/redux/features/user/staff'
import { asyncGetVisitors } from '@renderer/redux/features/user/visitors'
import { useAppSelector, useAppDispatch } from '@renderer/redux/store/hook'
import { priceToLetters } from '@renderer/utils/functions'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import PaginatedTable from '../customer/table'
import moment from 'moment'

const Home = () => {
  const user = useAppSelector((s) => s.auth.user)
  const dispatch = useAppDispatch()

  const { customers, customers_loading } = useAppSelector((s) => s.customer)
  const { staffs, staffs_loading } = useAppSelector((s) => s.staffs)
  const { visitors, visitors_loading } = useAppSelector((s) => s.visitor)
  const [totalProducts, setTotalProducts] = React.useState(0)
  const [totalUsers, setTotalUsers] = React.useState(0)
  const [totalRevenue, setTotalRevenue] = React.useState(0)
  const [totalStaffs, setTotalStaffs] = React.useState(0)

  const [loading, setLoading] = React.useState(false)

  const navigate = useNavigate()

  React.useEffect(() => {
    if (user?.uid) {
      setLoading(true)
      debounce(() => {
        dispatch(
          asyncGetCustomers({
            uid: user?.uid,
            limit: 10,
            page: 1
          })
        )
        dispatch(
          asyncGetVisitors({
            uid: user?.uid,
            limit: 5,
            page: 1
          })
        )
        dispatch(
          asyncGetStaffs({
            uid: user?.uid
          })
        )
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
    if (id.toLowerCase().includes('customers')) {
      navigate('/customers')
    } else if (id.toLowerCase().includes('products')) {
      navigate('/products')
    } else if (id.toLowerCase().includes('revenue')) {
      navigate('/billing')
    } else if (id.toLowerCase().includes('staffs')) {
      navigate('/staffs')
    } else if (id.toLowerCase().includes('visitors')) {
      navigate('/visitors')
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
              width: '100%',
              // generate random background
              // maxWidth: '240px',
              flex: 1,
              flexGrow: 1,
              backgroundColor: colors[idx % colors.length]
            }}
            onClick={() => handleClick(v.title)}
          >
            <CustomTypography
              variant={'body1'}
              fontWeight={'bold'}
              fontFamily={'Syne'}
              whiteSpace={'pre-line'}
              textAlign={'start'}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'flex-start'
              }}
              flexDirection={'column'}
              alignItems={'flex-start'}
              justifyContent={'flex-start'}
              color={colors[idx % colors.length].replace('0.3', '1')}
            >
              {v.title.split(' ').map((e) => (
                <span style={{ all: 'inherit' }}>{e}</span>
              ))}
            </CustomTypography>

            <CustomTypography variant={'h4'} fontWeight={'normal'}>
              {loading ? (
                <CircularProgress sx={{ marginTop: '24px' }} variant={'indeterminate'} size={24} />
              ) : (
                v.data
              )}
            </CustomTypography>
          </Card>
        ))}
      </CardContainer>
      <TablesGridContainer>
        <div className="grid_container">
          <div className="header">
            <CustomTypography variant="h4">Recent Customers</CustomTypography>
            <Button variant="text" onClick={() => handleClick('customers')}>
              See More
            </Button>
          </div>
          <PaginatedTable
            sx={{
              height: '100%',
              maxHeight: '100%',
              overflowY: 'scroll'
            }}
            showPagination={false}
            data={{
              header: ['S.No', 'Name', 'Created On', 'Email', 'Gender', 'Phone'],
              row: customers.map((cst, idx) => [
                <>{idx + 1}</>,
                <>{cst.name}</>,
                <>{moment(cst.created_on).format('DD-MM-YYYY')}</>,
                <>{cst.email}</>,
                <>{cst.gender}</>,
                <>{cst.phone}</>
              ])
            }}
            page={0}
            rowsPerPage={5}
            loading={customers_loading}
          />
        </div>

        <div className="grid_container">
          <div className="header">
            <CustomTypography variant="h4">Recent Staffs</CustomTypography>
            <Button variant="text" onClick={() => handleClick('staffs')}>
              See More
            </Button>
          </div>
          <PaginatedTable
            page={0}
            rowsPerPage={5}
            clickable={false}
            total={staffs.length}
            sx={{
              height: '100%',
              maxHeight: '100%',
              overflowY: 'scroll'
            }}
            showPagination={false}
            data={{
              header: ['S.No', 'Name', 'Created on', 'Email', 'Gender', 'Phone'],
              row: staffs.map((cst, idx) => [
                <>{idx + 1}</>,
                <>{cst.data.name}</>,
                <>{moment(cst.data.createdOn).format('DD-MM-YYYY')}</>,
                <>{cst.data.email}</>,
                <>{cst.data.gender}</>,
                <>{cst.data.phone}</>
              ])
            }}
            loading={staffs_loading}
          />
        </div>
      </TablesGridContainer>
      <TablesGridContainer>
        <div className="grid_container">
          <div className="header">
            <CustomTypography variant="h4">Recent Visitors</CustomTypography>
            <Button variant="text" onClick={() => handleClick('visitors')}>
              See More
            </Button>
          </div>
          <PaginatedTable
            page={0}
            rowsPerPage={5}
            clickable={false}
            total={visitors.length}
            sx={{
              height: '100%',
              maxHeight: '100%',
              overflowY: 'scroll'
            }}
            showPagination={false}
            data={{
              header: ['S.No', 'Name', 'Visited On', 'Email', 'Gender', 'Phone'],
              row: visitors.map((cst, idx) => [
                <>{idx + 1}</>,
                <>{cst.data.name}</>,
                <>{moment(cst.data.created_on).format('DD-MM-YYYY')}</>,
                <>{cst.data.email}</>,
                <>{cst.data.gender}</>,
                <>{cst.data.phone}</>
              ])
            }}
            loading={visitors_loading}
          />
        </div>
      </TablesGridContainer>
    </Container>
  )
}

export default Home

const Container = styled('div')(({}) => ({
  width: '100%',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
  paddingBottom: '24px'
}))

const CardContainer = styled('div')({
  width: '100%',
  height: 'max-content',
  gap: '32px',
  padding: '12px 4px',
  display: 'flex',
  flexWrap: 'wrap',
  flexDirection: 'row'
})

const Card = styled('div')({
  // minWidth: '240px',
  flexGrow: 1,
  flex: 1,
  width: '100%',
  height: '100%',
  maxWidth: '240px',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '12px',
  padding: '14px 16px',
  cursor: 'pointer',
  position: 'relative',
  top: 0
})

const TablesGridContainer = styled('div')(({ theme }) => ({
  width: '100%',
  height: 'max-content',
  display: 'grid',
  gridTemplateColumns: 'minmax(calc(50% - 24px), 1fr)  minmax(calc(50% - 24px), 1fr)',
  flex: 1,
  gap: '24px',
  '& div.grid_container': {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    width: '100%',
    gap: '12px',
    '.header': {
      width: '100%',
      padding: 0,
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      '& *': {
        textTransform: 'none'
      }
    }
  },
  '& .flex-row': {
    display: 'flex',
    flexDirection: 'row',
    gap: '24px', // Adds space between columns
    width: '100%', // Ensures it takes up full width
    '& .column': {
      flex: 1, // Makes both columns take up equal space
      display: 'flex',
      flexDirection: 'column',
      gap: '12px' // Adds space between child elements inside each column
    }
  },
  [theme.breakpoints.down(1440)]: {
    display: 'flex',
    flexDirection: 'column'
  }
}))
