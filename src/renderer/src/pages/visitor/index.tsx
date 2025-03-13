import { Button, debounce, Menu, MenuItem, styled, Tooltip } from '@mui/material'
import PageHeader from '@renderer/components/header/pageHeader'
import CustomTypography from '@renderer/components/typography'
import { useAppSelector, useAppDispatch } from '@renderer/redux/store/hook'
import { VisitorData } from '@renderer/types/visitor'
import PaginatedTable from '../customer/table'
import CustomIcon from '@renderer/components/icons'
import { grey, red } from '@mui/material/colors'
// import { asyncSetCurrentUser } from '@renderer/redux/features/user/customers'
import {
  asyncGetVisitors,
  asyncSetCurrentVisitor,
  setCurrentVisitor
} from '@renderer/redux/features/user/visitors'
import { deleteVisitor } from '@renderer/firebase/visitor'
import VisitorDetails from './visitor-details'
import AddVisitorModal from '@renderer/components/modal/create-visitor'
import React from 'react'
import moment from 'moment'
import { asyncGetStaffs } from '@renderer/redux/features/user/staff'

const Actions = ({
  user,
  handleEdit
}: {
  user: VisitorData['data']
  handleEdit(): void
}): React.ReactNode => {
  // const id = useAppSelector((s) => s.auth.user?.uid as string)
  const [anchorEl, setAnchorEl] = React.useState<Element | null>(null)
  const dispatch = useAppDispatch()
  // const navigate = useNavigate()
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
            dispatch(
              asyncSetCurrentVisitor({
                uid: user?.created_by as string,
                vid: user?.vid as string
              })
            )
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
            dispatch(setCurrentVisitor(''))
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
            await deleteVisitor(user?.created_by as string, user?.vid)
            dispatch(
              asyncGetVisitors({
                uid: user?.created_by as string,
                limit: 5,
                page: 1
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
const VisitorPage = () => {
  const dispatch = useAppDispatch()
  const user = useAppSelector((s) => s.auth.user)
  const visitors = useAppSelector((s) => s.visitor.visitors)
  const [customer_modal, setCustomerModal] = React.useState(false)
  const [edit_data, setEditData] = React.useState<Omit<VisitorData, 'records'>>()
  const currentUser = useAppSelector((s) => s.visitor.current_visitor)
  const subscription = useAppSelector((s) => s.auth.user?.subscription)
  const canAddCustomer = (subscription?.total_customers ?? 0) <= visitors.length
  const currentVisitor = useAppSelector((s) => s.visitor.current_visitor)

  const [page, setPages] = React.useState(1)
  const [limit, setLimit] = React.useState(50)

  React.useEffect(() => {
    if (!user) return
    dispatch(
      asyncGetVisitors({
        uid: user?.uid
      })
    )
  }, [])

  return (
    <>
      <Container
        sx={{
          height: 'calc(100%)',
          maxHeight: 'calc(100%)',
          overflow: 'auto',
          position: 'relative',
          top: 0,
          width: '100%',
          display: 'grid',
          gridTemplateColumns: currentUser ? '1fr minmax(420px, 460px)' : '1fr',
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
          <AddVisitorModal
            open={customer_modal}
            onClose={() => setCustomerModal(false)}
            edit={edit_data}
          />
          <PageHeader
            start={
              <div>
                <CustomTypography variant={'h6'}>Visitors Management</CustomTypography>
              </div>
            }
            end={
              <Tooltip title={canAddCustomer ? 'You have reached the limit of visitors' : ''} arrow>
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
                      dispatch(asyncGetStaffs({ uid: user?.uid }))
                      setCustomerModal(true)
                    }
                  }}
                >
                  Add Visitor
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
              header: ['S.No', 'Name', 'Visited On', 'Email', 'Gender', 'Phone', 'Actions'],
              row: visitors.map((cst, idx) => [
                <>{idx + 1}</>,
                <>{cst.data.name}</>,
                <>{moment(cst.data.created_on).format('DD-MM-YYYY')}</>,
                <>{cst.data.email}</>,
                <>{cst.data.gender}</>,
                <>{cst.data.phone}</>,
                <Actions
                  user={cst['data']}
                  key={idx + cst.data.email}
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
          <VisitorDetails visitor={currentVisitor} />
        </div>
      </Container>
    </>
  )
}

export default VisitorPage

const Container = styled('div')({
  width: '100%',
  transition: 'all .3s'
})
