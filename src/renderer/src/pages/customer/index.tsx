import { Button, debounce, Menu, MenuItem, styled, Tooltip } from '@mui/material'
import CustomTypography from '@renderer/components/typography'
import React from 'react'
import { useAppDispatch, useAppSelector } from '@renderer/redux/store/hook'
import {
  asyncGetCustomers,
  asyncSetCurrentUser,
  resetCurrentUser
} from '@renderer/redux/features/user/customers'
import PaginatedTable from './table'
import CustomIcon from '@renderer/components/icons'
import { grey, red } from '@mui/material/colors'
import { CustomerResponse } from '@renderer/types/customers'
import CreateCustomerModal from '@renderer/components/modal/create-customer'
import { deleteCustomer } from '@renderer/firebase/customers'
import CustomDetailSidebar from './detail-sidebar'
import PageHeader from '@renderer/components/header/pageHeader'
import moment from 'moment'
import { asyncGetStaffs } from '@renderer/redux/features/user/staff'

const Actions = ({
  user,
  handleEdit
}: {
  user: CustomerResponse
  handleEdit(): void
}): React.ReactNode => {
  const id = useAppSelector((s) => s.auth.user?.uid as string)
  const [anchorEl, setAnchorEl] = React.useState<Element | null>(null)
  const dispatch = useAppDispatch()
  // const navigate = useNavigate()
  const currentCustomer = useAppSelector((s) => s.customer.current_customer)
  return (
    <>
      <CustomIcon
        name="MATERIAL_DESIGN"
        icon={'MdMoreVert'}
        color={grey['800']}
        onClick={(e) => setAnchorEl(e.currentTarget)}
      />
      <Menu
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        sx={{
          '.MuiPaper-root': {
            backgroundColor: '#f5f5f5'
          }
        }}
      >
        <MenuItem
          sx={{
            padding: '2px 24px',
            boxShadow: 'unset',
            gap: '8px'
          }}
          disableGutters={true}
          disableRipple={true}
          disableTouchRipple={true}
          onClick={() => {
            setAnchorEl(null)
            if (currentCustomer?.data?.cid !== user?.cid || !currentCustomer) {
              dispatch(asyncSetCurrentUser({ uid: id, cid: user?.cid }))
            }
          }}
        >
          <CustomIcon
            stopPropagation={false}
            name={'LUCIDE_ICONS'}
            icon={'LuExternalLink'}
            color={grey['900']}
            size={18}
          />
          <CustomTypography color={grey['900']}>View</CustomTypography>
        </MenuItem>
        <MenuItem
          sx={{
            padding: '2px 24px',
            boxShadow: 'unset',
            gap: '8px'
          }}
          disableGutters={true}
          disableRipple={true}
          disableTouchRipple={true}
          onClick={() => {
            handleEdit()
            dispatch(resetCurrentUser())
            setAnchorEl(null)
          }}
        >
          <CustomIcon
            stopPropagation={false}
            name={'MATERIAL_DESIGN'}
            icon={'MdEdit'}
            color={grey['900']}
            size={18}
          />
          <CustomTypography color={grey['900']}>Edit</CustomTypography>
        </MenuItem>
        <MenuItem
          sx={{
            padding: '2px 24px',
            boxShadow: 'unset',
            gap: '8px'
          }}
          disableGutters={true}
          disableRipple={true}
          disableTouchRipple={true}
          onClick={async () => {
            await deleteCustomer(user?.created_by?.uid, user?.cid)
            await dispatch(
              asyncGetCustomers({
                uid: user?.created_by?.uid,
                limit: 100,
                page: 1
              })
            )
            dispatch(
              asyncSetCurrentUser({
                uid: '',
                cid: ''
              })
            )
            setAnchorEl(null)
          }}
        >
          <CustomIcon
            name={'MATERIAL_DESIGN'}
            stopPropagation={false}
            icon={'MdDelete'}
            color={red['900']}
            size={18}
          />
          <CustomTypography color={red['900']}>Delete</CustomTypography>
        </MenuItem>
      </Menu>
    </>
  )
}

const CustomerPage = (): React.ReactNode => {
  const dispatch = useAppDispatch()
  const user = useAppSelector((s) => s.auth.user)
  const customers = useAppSelector((s) => s.customer.customers)
  const [page, setPages] = React.useState(1)
  const [limit, setLimit] = React.useState(50)
  const [customer_modal, setCustomerModal] = React.useState(false)
  const [edit_data, setEditData] = React.useState<CustomerResponse>()
  const currentUser = useAppSelector((s) => s.customer.current_customer)
  const canAddCustomer =
    useAppSelector((s) => s.auth.user?.subscription?.total_customers ?? 0) <= customers.length

  React.useEffect(() => {
    if (!user) return
    dispatch(
      asyncGetCustomers({
        uid: user?.uid,
        limit,
        page
      })
    )
  }, [page, limit])

  return (
    <>
      <Container
        sx={{
          height: '100%',
          maxHeight: 'calc(var(--vh, 1vh) * 100 - 164px)',
          overflow: 'hidden',
          position: 'relative',
          top: 0,
          width: '100%',
          display: 'grid',
          gridTemplateColumns: currentUser ? '1fr minmax(420px, 460px)' : '1fr',
          gridTemplateRows: '1fr',
          gap: '12px'
        }}
      >
        <CreateCustomerModal
          open={customer_modal}
          edit={edit_data ? { data: edit_data } : undefined}
          onClose={() => {
            setCustomerModal(false)
          }}
        />
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
              <div>
                <CustomTypography variant={'h6'}>Customer Management</CustomTypography>
              </div>
            }
            end={
              <Tooltip
                title={canAddCustomer ? 'You have reached the limit of customers' : ''}
                arrow
              >
                <Button
                  startIcon={<CustomIcon name={'LUCIDE_ICONS'} icon="LuPlus" color={'white'} />}
                  variant={'contained'}
                  color="primary"
                  // disabled={canAddCustomer}
                  disableElevation={true}
                  focusRipple={false}
                  disableRipple={true}
                  disableFocusRipple={true}
                  disableTouchRipple={true}
                  onClick={() => {
                    if (!canAddCustomer && user) {
                      setCustomerModal(true)
                      dispatch(asyncGetStaffs({ uid: user?.uid as string }))
                    }
                  }}
                >
                  Add Customer
                </Button>
              </Tooltip>
            }
          />
          <PaginatedTable
            sx={{
              height: '100%',
              maxHeight: '100%',
              overflowY: 'scroll'
            }}
            showPagination={false}
            data={{
              header: ['S.No', 'Name', 'Created On', 'Email', 'Gender', 'Phone', 'Actions'],
              row: customers.map((cst, idx) => [
                <>{idx + 1}</>,
                <>{cst.name}</>,
                <>{moment(cst.created_on).format('DD-MM-YYYY')}</>,
                <>{cst.email}</>,
                <>{cst.gender}</>,
                <>{cst.phone}</>,
                <Actions
                  user={cst}
                  key={idx + cst.email}
                  handleEdit={() => {
                    setEditData(cst)
                    debounce(() => {
                      setCustomerModal(true)
                    }, 600)()
                  }}
                />
              ])
            }}
            onPageChange={(_, n) => {
              setPages(n)
            }}
            onRowsPerPageChange={({ target }) => setLimit(parseInt(target?.value ?? '0'))}
            page={page - 1}
            rowsPerPage={limit}
            loading={false}
          />
        </div>
        <div
          className="scrollbar"
          style={{
            all: 'inherit',
            maxHeight: '100%',
            gridTemplateColumns: '1fr',
            gridTemplateRows: 'max-content',
            overflowY: 'auto',
            backgroundColor: grey[100],
            width: currentUser ? '100%' : '0px',
            gridColumn: '2',
            opacity: currentUser ? 1 : 0,
            transition: 'all .3s'
          }}
        >
          <CustomDetailSidebar data={currentUser} />
        </div>
      </Container>
    </>
  )
}

export default CustomerPage

const Container = styled('div')({
  width: '100%',
  transition: 'all .3s'
})
