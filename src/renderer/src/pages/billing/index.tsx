import { styled, Tab, Tabs } from '@mui/material'
import { useAppSelector, useAppDispatch } from '@renderer/redux/store/hook'
import PaginatedTable from '../customer/table'
import { asyncGetOrders } from '@renderer/redux/features/user/order'
import React from 'react'
import moment from 'moment'
import CustomTypography from '@renderer/components/typography'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import PageHeader from '@renderer/components/header/pageHeader'
import { capitalizeSentence } from '@renderer/utils/functions'

const TAB_HEADER: string[] = ['out_purchase', 'center_usage']

const BillingPage = (): JSX.Element => {
  const user = useAppSelector((s) => s.auth.user)
  const { orders, limit, total_orders, loading, currentPage } = useAppSelector((s) => s.orders)
  const dispatch = useAppDispatch()
  const router = useNavigate()

  const [tabs, setTabs] = React.useState('out_purchase')

  React.useEffect(() => {
    if (user?.uid) {
      dispatch(asyncGetOrders({ uid: user.uid }))
    }
  }, [])

  const filtered = React.useMemo(
    () =>
      orders.filter((e) => e.products.some((d) => d.detail?.type?.toLowerCase()?.includes(tabs))),
    [tabs]
  )

  console.log(filtered)

  return (
    <Container
      sx={{
        height: 'calc(100%)',
        maxHeight: 'calc(100%)',
        overflow: 'hidden',
        position: 'relative',
        top: 0,
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '1fr',
        gridTemplateRows: '1fr',
        gap: '12px'
      }}
    >
      <div
        className="scrollbar"
        style={{
          all: 'inherit',
          gridTemplateRows: 'max-content 1fr',
          gridTemplateColumns: '1fr'
        }}
      >
        <PageHeader
          start={
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <CustomTypography variant={'h6'}>Billing</CustomTypography>
              <Tabs value={tabs}>
                {TAB_HEADER.map((t) => (
                  <Tab label={capitalizeSentence(t)} value={t} onClick={() => setTabs(t)} />
                ))}
              </Tabs>
            </div>
          }
        />
        <PaginatedTable
          sx={{ height: '100%', maxHeight: '100%', overflowY: 'scroll' }}
          data={{
            header: ['S.No', 'Order Id', 'Date', 'Price', 'Total Products'],
            row:
              filtered?.map((cst, idx) => [
                <>{idx + 1 + (currentPage - 1) * limit}</>,
                <Link to={`/billing/${cst?.orderId}`}>{cst?.orderId}</Link>,
                <>{moment(cst?.order_on).format('DD/MM/YYYY')}</>,
                <>{'₹ ' + cst?.total_price}</>,
                <>{cst?.total_products}</>
              ]) ?? []
          }}
          clickable={true}
          onClick={(idx) => router(`/billing/${filtered[idx]?.orderId}`)}
          total={total_orders}
          page={currentPage - 1}
          rowsPerPage={limit}
          loading={loading}
          showPagination={false}
        />
        <Outlet />
      </div>
    </Container>
  )
}

export default BillingPage

const Container = styled('div')({
  width: '100%',
  transition: 'all .3s'
})
