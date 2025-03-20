import { Button, styled, Tooltip } from '@mui/material'
import PageHeader from '@renderer/components/header/pageHeader'
import CustomTypography from '@renderer/components/typography'
import { useAppSelector, useAppDispatch } from '@renderer/redux/store/hook'

import CustomIcon from '@renderer/components/icons'
import {
  asyncGetStaffs,
  asyncSetTotalStaff,
  setCurrentStaff
} from '@renderer/redux/features/user/staff'
// import VisitorDetails from './'
import React from 'react'
import { StaffData } from '@renderer/types/staff'
import CreateStaffModal from '@renderer/components/modal/create-staff'
import { useNavigate } from 'react-router-dom'
import UserCard from '@renderer/components/card/users'
import CustomTextInput from '@renderer/components/text-input'

const StaffPage = () => {
  const dispatch = useAppDispatch()
  const user = useAppSelector((s) => s.auth.user)
  const staffs = useAppSelector((s) => s.staffs.staffs)
  const [staffModal, setStaffModal] = React.useState(false)
  const [edit_data, setEditData] = React.useState<StaffData['data']>()
  // const currentStaff = useAppSelector((s) => s.visitor.current_visitor)
  const subscription = useAppSelector((s) => s.auth.user?.subscription)
  const canAddCustomer = (subscription?.total_customers ?? 0) <= staffs.length
  const [search, setSearch] = React.useState('')

  const filtered = staffs
    .filter((e) => {
      if (e.data.name.toUpperCase().includes(search.toUpperCase().trim())) {
        return e
      } else if (e.data.email.toUpperCase().includes(search.toUpperCase().trim())) {
        return e
      } else if (e.data.phone.toUpperCase().includes(search.toUpperCase().trim())) {
        return e
      } else if (e.data.gender.toUpperCase().includes(search.toUpperCase().trim())) {
        return e
      }
      if (search.length >= 1) {
        return null
      }
      return e
    })
    .filter((e) => e !== null)

  React.useEffect(() => {
    if (!user) return
    dispatch(asyncSetTotalStaff({ uid: user?.uid }))
    dispatch(
      asyncGetStaffs({
        uid: user?.uid
      })
    )
  }, [])

  const navigate = useNavigate()

  return (
    <>
      <Container
        sx={{
          height: `100%`,
          maxHeight: 'calc(100%)',
          // overflow: 'hidden',
          position: 'relative',
          top: 0,
          width: '100%',
          display: 'grid',
          gridTemplateColumns: '1fr',
        gridTemplateRows: '1fr',
          gap: '12px'
        }}
      >
        <CreateStaffModal
          open={staffModal}
          edit={
            edit_data
              ? {
                  data: edit_data
                }
              : undefined
          }
          onClose={() => {
            setEditData(undefined)
            setStaffModal(false)
          }}
        />
        <div
          className={'scrollbar'}
          style={{
            all: 'inherit',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <PageHeader
            start={
              <>
                <CustomTypography variant={'h6'}>Staffs Management</CustomTypography>
              </>
            }
            end={
              <div
                style={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'row-reverse',
                  gap: '12px',
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'flex-start'
                }}
              >
                <Tooltip title={canAddCustomer ? 'You have reached the limit of staffs' : ''} arrow>
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
                    onClick={() => !canAddCustomer && setStaffModal(true)}
                    sx={{
                      width: 'fit-content'
                    }}
                  >
                    <CustomTypography variant={'body2'} whiteSpace={'nowrap'}>
                      Add Staff
                    </CustomTypography>
                  </Button>
                </Tooltip>
                <CustomTextInput
                  formProps={{
                    sx: {
                      maxWidth: '320px'
                    }
                  }}
                  input={{
                    value: search,
                    onChange: (e) => setSearch(e.target.value),
                    size: 'small',
                    placeholder: 'Search'
                  }}
                />
              </div>
            }
          />
          <div
            className="scrollbar"
            style={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: '1rem',
              padding: '12px 12px'
            }}
          >
            {filtered.length === 0 ? (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '400px'
                }}
              >
                {search.length >= 1 ? (
                  <CustomTypography
                    textAlign={'center'}
                    variant={'h6'}
                    fontWeight={'normal'}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      span: {
                        fontWeight: 'bold'
                      }
                    }}
                  >
                    No Results available for
                    <span>
                      <q>{search}</q>
                    </span>
                  </CustomTypography>
                ) : (
                  <>
                    <CustomTypography maxWidth={'340px'} textAlign={'center'}>
                      Check your internet connection. If everything alright, refresh!!!!
                    </CustomTypography>
                  </>
                )}
              </div>
            ) : (
              filtered.map((e) => (
                <UserCard
                  onClick={() => {
                    dispatch(setCurrentStaff(e.data.sid))
                    navigate(`/staffs/${e.data.sid}`)
                  }}
                  name={e.data?.name}
                  email={e.data?.email}
                  phone={e.data?.phone}
                  photo_url={e.data?.photo_url ?? ''}
                />
              ))
            )}
          </div>
        </div>
      </Container>
    </>
  )
}

export default StaffPage

const Container = styled('div')({
  width: '100%',
  transition: 'all .3s'
})
