import {
  Button,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Modal,
  styled,
  Tooltip
} from '@mui/material'
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
import { deleteStaff, markStaffAttendance, updateStaffAttendance } from '@renderer/firebase/staffs'
import moment from 'moment'
import { closeSnackbar, enqueueSnackbar, SnackbarProvider } from 'notistack'
import StaffAttendance from './atendance'

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

  const [alreadyMarkedToday, setAlreadyMarkedToday] = React.useState(false)

  React.useEffect(() => {
    // Check if attendance has already been marked today
    const today = moment().format('YYYY-MM-DD')
    const attendanceRecords = staffs
      .find((a) => a?.data?.createdBy === user?.uid)
      ?.attendance?.filter((a) => moment(a?.date).format('YYYY-MM-DD') === today)
    if (attendanceRecords && attendanceRecords.length > 0) {
      setAlreadyMarkedToday(true)
    } else {
      setAlreadyMarkedToday(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staffs])

  const canMarkAttendance = (() => {
    if (!user) return false
    const today = moment().format('YYYY-MM-DD')
    const attendanceRecords = staffs
      .find((a) => a?.data?.createdBy === user?.uid)
      ?.attendance?.filter((a) => moment(a?.date).format('YYYY-MM-DD') === today)

    if (attendanceRecords && attendanceRecords.length > 0) {
      return false
    }
    return true
  })()

  const lastAttendanceMarkTime = staffs
    .find((a) => a?.data?.createdBy === user?.uid)
    ?.attendance?.filter(
      (a) => moment(a?.date).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD')
    )?.[0]?.date

  const [markAttendance, setMarkAttendance] = React.useState(false)
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
  const [loading, setLoading] = React.useState(false)
  const [more, setMore] = React.useState<Element | null>(null)

  const [attendance, setAttendance] = React.useState<
    {
      sid: string
      date: string
      status: 'present' | 'absent'
    }[]
  >([])

  const handleMark = async () => {
    // Mark all unselected staffs as absent
    const todayDate = moment().toISOString()
    const allStaffIds = staffs.map((staff) => staff.data.sid)
    const recordedStaffIds = attendance.map((record) => record.sid)

    // Find staffs that don't have attendance records yet
    const unrecordedStaffs = allStaffIds.filter((id) => !recordedStaffIds.includes(id))

    // Add absent records for unrecorded staffs
    const updatedAttendance = [
      ...attendance,
      ...unrecordedStaffs.map((sid) => ({
        sid,
        date: todayDate,
        status: 'absent' as const
      }))
    ]

    const update = canMarkAttendance
      ? await markStaffAttendance(user?.uid as string, updatedAttendance)
      : await updateStaffAttendance(user?.uid as string, updatedAttendance)

    if (!update.status) {
      enqueueSnackbar(update.message, {
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center'
        },
        autoHideDuration: 800
      })
      return
    }

    enqueueSnackbar('Attendance submitted successfully', {
      variant: 'success',
      anchorOrigin: {
        vertical: 'top',
        horizontal: 'center'
      },
      autoHideDuration: 800
    })

    dispatch(asyncSetTotalStaff({ uid: user?.uid as string }))
    dispatch(
      asyncGetStaffs({
        uid: user?.uid as string
      })
    )
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      if (!user?.uid) {
        throw new Error('User not authenticated')
      }
      // Check if there's any attendance data to process
      if (attendance.length === 0) {
        console.log('No attendance data to submit')
        return
      }

      enqueueSnackbar('Unmarked attendance will be counted as absent...', {
        variant: 'info',
        action: (key) => (
          <>
            <Button
              onClick={() => {
                closeSnackbar(key)
                setLoading(false)
              }}
              color="inherit"
              size="small"
            >
              Dismiss
            </Button>
            <Button
              onClick={async () => {
                enqueueSnackbar('Continuing with submission...', {
                  variant: 'info',
                  autoHideDuration: 800,
                  anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'center'
                  }
                })
                closeSnackbar(key)
                await handleMark()
                setAttendance([])
                setMarkAttendance(false)
                setSearch('')
                setAlreadyMarkedToday(true) // Update the state to reflect that attendance has been marked today
              }}
              color="inherit"
              size="small"
            >
              Continue
            </Button>
          </>
        ),
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center'
        }
      })

      // You can add code here to save the attendance data to your database
    } catch (error) {
      console.error('Error submitting attendance:', error)
      enqueueSnackbar('Failed to submit attendance. Please try again.', {
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center'
        },
        autoHideDuration: 800
      })
      setAttendance([])
      setMarkAttendance(false)
      setSearch('')
      setAlreadyMarkedToday(true) // Update the state to reflect that attendance has been marked today
    } finally {
      setLoading(false)
    }
  }

  const getAttendance = (sid: string) => {
    const today = moment().format('YYYY-MM-DD')
    const record = attendance.find((a) => a.sid === sid && a.date === today)
    if (!record) {
      return
    }

    return record.status
  }

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
        <SnackbarProvider />
        <Modal open={loading}>
          <></>
        </Modal>
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
                <CustomTypography
                  variant={'h6'}
                  // onClick={() => deleteStaffAttendance(user?.uid as string)}
                >
                  Staffs Management
                </CustomTypography>
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
                {markAttendance ? (
                  <>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setMarkAttendance(false)
                        setAttendance([])
                        setSearch('')
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleSubmit}
                      disabled={loading || attendance.length === 0}
                      endIcon={
                        loading ? (
                          <CircularProgress
                            variant="indeterminate"
                            size={18}
                            sx={{ color: 'white' }}
                          />
                        ) : null
                      }
                    >
                      Submit Attendance
                    </Button>
                  </>
                ) : (
                  <>
                    <Tooltip
                      title={
                        !canMarkAttendance
                          ? 'Attendance already marked for today. You can still update it.'
                          : alreadyMarkedToday
                            ? 'Attendance already marked for today. You can still update it.'
                            : lastAttendanceMarkTime &&
                                moment(lastAttendanceMarkTime).isSame(moment(), 'day')
                              ? 'Attendance already marked for today. You can still update it.'
                              : 'Mark Attendance'
                      }
                      arrow
                    >
                      <IconButton
                        sx={{
                          backgroundColor: !canMarkAttendance
                            ? 'grey.900'
                            : alreadyMarkedToday
                              ? 'grey.900'
                              : lastAttendanceMarkTime &&
                                  moment(lastAttendanceMarkTime).isSame(moment(), 'day')
                                ? 'grey.900'
                                : 'primary.main',
                          '&:hover': {
                            backgroundColor: !canMarkAttendance
                              ? 'grey.900'
                              : alreadyMarkedToday
                                ? 'grey.900'
                                : lastAttendanceMarkTime &&
                                    moment(lastAttendanceMarkTime).isSame(moment(), 'day')
                                  ? 'grey.900'
                                  : 'primary.dark'
                          }
                        }}
                        onClick={() => {
                          setMarkAttendance(true)
                          const getTodaysAttendance = staffs.map((e) => {
                            const filter = e.attendance.filter((a) => {
                              return (
                                moment(a.date).format('YYYY-MM-DD') ===
                                moment().format('YYYY-MM-DD')
                              )
                            })[0]
                            if (filter) {
                              return {
                                ...filter,
                                sid: e.data.sid
                              } as typeof filter
                            }
                            return {
                              sid: e.data.sid,
                              date: moment().format('YYYY-MM-DD'),
                              status: 'absent'
                            } as typeof filter
                          })
                          setAttendance(getTodaysAttendance)
                          console.log(getTodaysAttendance)
                        }}
                      >
                        <CustomIcon
                          color={
                            !canMarkAttendance
                              ? 'grey'
                              : alreadyMarkedToday
                                ? 'grey'
                                : lastAttendanceMarkTime &&
                                    moment(lastAttendanceMarkTime).isSame(moment(), 'day')
                                  ? 'grey'
                                  : 'white'
                          }
                          stopPropagation={false}
                          name={'MATERIAL_DESIGN'}
                          icon="MdChecklistRtl"
                        />
                      </IconButton>
                    </Tooltip>
                    <Tooltip
                      title={canAddCustomer ? 'You have reached the limit of staffs' : ''}
                      arrow
                    >
                      <Button
                        startIcon={
                          <CustomIcon name={'LUCIDE_ICONS'} icon="LuPlus" color={'white'} />
                        }
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
                  </>
                )}
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
                      Your staff data will show here
                    </CustomTypography>
                  </>
                )}
              </div>
            ) : (
              filtered.map((e) => (
                <UserCard
                  // attendanceStatus={getAttendanceStatus(e.data.sid)}
                  onMarkAttendanceChange={(mark) => {
                    if (loading) {
                      return
                    }
                    setAttendance((prev) => {
                      const existing = prev.find((a) => a.sid === e.data.sid)
                      if (existing) {
                        return prev.map((a) => (a.sid === e.data.sid ? { ...a, status: mark } : a))
                      } else {
                        return [
                          ...prev,
                          {
                            sid: e.data.sid,
                            date: moment().format('YYYY-MM-DD'),
                            status: mark
                          }
                        ]
                      }
                    })
                  }}
                  attendance={getAttendance(e.data.sid)}
                  markAttendance={markAttendance}
                  onClick={() => {
                    dispatch(setCurrentStaff(e.data.sid))
                    navigate(`/staffs/${e.data.sid}`)
                  }}
                  onDelete={async () => {
                    await deleteStaff(e.data?.createdBy, e.data.sid)
                    dispatch(asyncSetTotalStaff({ uid: user?.uid as string }))
                    dispatch(
                      asyncGetStaffs({
                        uid: user?.uid as string
                      })
                    )
                  }}
                  name={e.data?.name}
                  onMoreClick={(evt) => {
                    setMore(evt.currentTarget)
                    setEditData(e.data)
                  }}
                  email={e.data?.email}
                  phone={e.data?.phone}
                  photo_url={e.data?.photo_url ?? ''}
                />
              ))
            )}
          </div>
          {staffs.length !== 0 && (
            <>
              <StaffAttendance />
            </>
          )}
        </div>
      </Container>
      <Menu
        open={!!more}
        anchorEl={more}
        onClose={() => {
          setMore(null)
          setEditData(undefined)
        }}
      >
        <MenuItem
          onClick={() => {
            setMore(null)
            setStaffModal(true)
          }}
        >
          Edit
        </MenuItem>
        <MenuItem
          onClick={async () => {
            await deleteStaff(edit_data?.createdBy as string, edit_data?.sid as string)
            dispatch(asyncSetTotalStaff({ uid: user?.uid as string }))
            dispatch(
              asyncGetStaffs({
                uid: user?.uid as string
              })
            )
          }}
        >
          Delete
        </MenuItem>
      </Menu>
    </>
  )
}

//  ;<CustomIcon
//    onClick={onDelete}
//    name="MATERIAL_DESIGN"
//    icon="MdDelete"
//    color={red['600']}
//    style={{
//      gridColumn: 2,
//      gridRow: 2
//    }}
//  />

export default StaffPage

const Container = styled('div')({
  width: '100%',
  transition: 'all .3s'
})
