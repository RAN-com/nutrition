import { styled } from '@mui/material'
import { useAppSelector, useAppDispatch } from '@renderer/redux/store/hook'
import PaginatedTable from '../customer/table'
import {
  asyncGetOrders,
  setOrderPage,
  setOrderPageLimit
} from '@renderer/redux/features/user/order'
import React from 'react'
import moment from 'moment'
import CustomTypography from '@renderer/components/typography'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import PageHeader from '@renderer/components/header/pageHeader'

const BillingPage = (): JSX.Element => {
  const user = useAppSelector((s) => s.auth.user)
  const orders = useAppSelector((s) => s.orders.orders)
  const page = useAppSelector((s) => s.orders.page)
  const limit = useAppSelector((s) => s.orders.limit)
  const dispatch = useAppDispatch()
  const router = useNavigate()

  React.useEffect(() => {
    if (!user) return
    dispatch(
      asyncGetOrders({
        uid: user?.uid
      })
    )
  }, [page, limit])

  return (
    <Container>
      <PageHeader
        start={
          <div>
            <CustomTypography variant={'h6'}>Billing</CustomTypography>
          </div>
        }
      />
      <PaginatedTable
        data={{
          header: ['S.No', 'Order Id', 'Date', 'Price', 'Total Products'],
          row:
            orders?.map((cst, idx) => [
              <>{idx + 1}</>,
              <Link to={`/billing/${cst?.orderId}`}>{cst?.orderId}</Link>,
              <>{moment(cst?.order_on).format('DD/MM/YYYY')}</>,
              <>{'₹ ' + cst?.total_price}</>,
              <>{cst?.total_products}</>
            ]) ?? []
        }}
        clickable={true}
        onClick={(idx) => {
          router(`/billing/${orders[idx]?.orderId}`)
        }}
        onPageChange={(_, n) => {
          dispatch(setOrderPage(n))
        }}
        onRowsPerPageChange={({ target }) =>
          dispatch(setOrderPageLimit(parseInt(target?.value ?? '0')))
        }
        page={page - 1}
        rowsPerPage={limit}
        loading={false}
      />
      <Outlet />
    </Container>
  )
}

export default BillingPage

const Container = styled('div')({
  width: '100%',
  height: 'calc(100%)',
  maxHeight: 'calc(100%)',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    'th, td': {
      padding: '12px',
      borderBottom: '1px solid #ccc'
    }
  }
})
