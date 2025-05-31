import { useAppSelector } from '@renderer/redux/store/hook'
import moment from 'moment'
import { useState } from 'react'
import PaginatedTable from '../customer/table'
import { Chip, styled } from '@mui/material'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import CustomTypography from '@renderer/components/typography'

export default function StaffAttendance() {
  const staffs = useAppSelector((state) => state.staffs.staffs)
  const [date, setDate] = useState(moment())

  const header = ['Name', 'Email', 'Attendance Status', 'Date']

  const genData = () => {
    return staffs.map((staff) => {
      const filter = staff.attendance?.filter((att) => att.date === date.format('YYYY-MM-DD'))[0]
      return [
        staff.data.name,
        staff.data.email ?? '-',
        filter?.status ? (
          <Chip
            label={filter.status}
            color={
              filter.status === 'present'
                ? 'success'
                : filter.status === 'absent'
                  ? 'error'
                  : 'default'
            }
            size="small"
            sx={{ textTransform: 'capitalize' }}
          />
        ) : (
          '-'
        ),
        date.format('YYYY-MM-DD')
      ]
    })
  }

  const getMinDate = () => {
    // Find the earliest attendance date among all staff members
    let minDate = moment()
    staffs.forEach((staff) => {
      if (staff.attendance && staff.attendance.length > 0) {
        staff.attendance.forEach((att) => {
          const attDate = moment(att.date, 'YYYY-MM-DD')
          if (attDate.isValid() && attDate.isBefore(minDate)) {
            minDate = attDate
          }
        })
      }
    })
    return minDate
  }

  const row = genData()

  return (
    <Container>
      <div className="header">
        <CustomTypography variant="h2" flexDirection={'column'} alignItems={'flex-start'}>
          Staff Attendance <br />{' '}
          <CustomTypography variant="body2" textAlign={'start'}>
            {date.format('MMMM Do YYYY')}
          </CustomTypography>
        </CustomTypography>
        <div className="buttons">
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <DatePicker
              label="Select Date"
              format="YYYY-MM-DD"
              value={date}
              onChange={(newValue) => {
                setDate(moment(newValue))
              }}
              minDate={getMinDate()}
              disableFuture={true}
              sx={{
                width: '200px',
                '& .MuiInputBase-root': {
                  width: '100%',
                  height: '40px',
                  borderRadius: '4px',
                  backgroundColor: '#f5f5f5',
                  padding: '0 10px'
                },
                '& .MuiInputBase-input': {
                  fontSize: '16px'
                }
              }}
            />
          </LocalizationProvider>
        </div>
      </div>
      <PaginatedTable
        loading={false}
        page={0}
        rowsPerPage={10}
        showLoadableRow={false}
        onPageChange={() => {}}
        onRowsPerPageChange={() => {}}
        clickable={false}
        sx={{ width: '100%', marginBottom: '20px' }}
        showPagination={false}
        total={staffs.length}
        onClick={() => {}}
        data={{ header, row }}
      />
    </Container>
  )
}

const Container = styled('div')({
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
  boxSizing: 'border-box',
  '.header': {
    width: '100%',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  '.buttons': {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '12px'
  }
})
