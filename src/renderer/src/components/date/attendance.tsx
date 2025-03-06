import { Badge, Typography } from '@mui/material'
import { grey } from '@mui/material/colors'
import {
  DateCalendar,
  LocalizationProvider,
  PickersDayProps,
  PickersDay
} from '@mui/x-date-pickers'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import { setCurrentAttendanceDate } from '@renderer/redux/features/user/customers'
import { useAppDispatch } from '@renderer/redux/store/hook'
import { CustomerAttendance } from '@renderer/types/customers'
import moment, { Moment } from 'moment'
import React from 'react'
import CustomTypography from '../typography'

type Props = {
  maxPrevDate: string
  values: CustomerAttendance[] // List of dates for which attendance is marked
  onClick(
    e:
      | { type: 'marked' | 'past_unmarked'; data: CustomerAttendance }
      | { data: null; type: 'add_new' }
  ): void
  onMonthChange(e: Moment): void
}

const format = 'YYYY-MM-DD'

// Handle the marking of attendance

// Custom PickersDay component to highlight specific dates and show attendance status
function ServerDay(
  props: PickersDayProps<Moment> & {
    highlightedDays?: string[]
    attendanceStatus?: { [key: string]: 'present' | 'absent' }
  }
) {
  const {
    highlightedDays = [],
    day,
    outsideCurrentMonth,
    attendanceStatus,
    onClick,
    ...other
  } = props
  // Format the current day for comparison
  const formattedDate = day.format(format)
  const isCurrentDate = formattedDate === moment().format(format)
  // Get the attendance status for the current day
  const status = attendanceStatus ? attendanceStatus[formattedDate] : 'unmarked'

  return (
    <Badge
      key={formattedDate}
      overlap="circular"
      onClick={() => {}}
      badgeContent={
        status === 'unmarked' ? (
          isCurrentDate ? (
            '➕'
          ) : (
            ''
          )
        ) : status === 'present' ? (
          <Typography variant="caption" color="success.main">
            ✅
          </Typography>
        ) : status === 'absent' ? (
          <Typography variant="caption" color="error.main">
            ❌
          </Typography>
        ) : null
      }
    >
      <PickersDay {...other} outsideCurrentMonth={outsideCurrentMonth} day={day} />
    </Badge>
  )
}

// Utility function to check if the day is selected
const isSelected = (day: Moment, values: string[]): string[] => {
  const formatted_date = moment(`${day.year()}-${day.month() + 1}-${day.date()}`).format(format)
  return values.includes(formatted_date)
    ? values.filter((e) => e !== formatted_date)
    : [...values, formatted_date]
}

const AttendanceDates = ({ values, maxPrevDate, onClick, onMonthChange }: Props) => {
  const [highlightDates, setHighlightedDays] = React.useState<string[]>([])
  const dispatch = useAppDispatch()

  React.useEffect(() => {
    if (values.length === 0) {
      setHighlightedDays([])
    }
  }, [values])

  // Handle the change when a date is clicked
  const handleChange = React.useCallback(
    (v: Moment, a: CustomerAttendance) => {
      if (a) {
        dispatch(
          setCurrentAttendanceDate({
            date: v.format(format),
            type: typeof a?.mark_status === 'boolean' ? 'marked' : 'past_unmarked'
          })
        )
        onClick({
          data: a,
          type: a.mark_status ? 'marked' : 'past_unmarked'
        })
        return
      } else if (v.format(format) === moment().format(format)) {
        const updatedValues = isSelected(v, values.map((e) => e.date) as string[])
        setHighlightedDays(updatedValues)
        onClick?.({
          data: null,
          type: 'add_new'
        })
      }
    },
    [values]
  )

  const genData = () => {
    const dates: { [k: string]: string } = {}
    values.forEach((e) => {
      dates[e.date] = e.mark_status ? 'present' : 'absent'
    })
    return dates
  }

  const allowedDates = values.map((e) => moment(e.date).day()).concat(moment().day())

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <CustomTypography variant={'h6'}>Attendance</CustomTypography>
      <CustomTypography
        fontSize={'12px'}
        color={grey['500']}
        marginBottom={'12px'}
        lineHeight={'1'}
      >
        Click on a date to mark or view attendance
      </CustomTypography>
      <DateCalendar
        key={values.length}
        openTo={'day'}
        showDaysOutsideCurrentMonth={false}
        onMonthChange={onMonthChange}
        disableFuture={true}
        slots={{
          day: ServerDay
        }}
        shouldDisableDate={(d) => !allowedDates.includes(d.day())}
        minDate={moment(maxPrevDate)}
        slotProps={{
          day: (e) => ({
            ...e,
            highlightedDays: highlightDates,
            attendanceStatus: genData()
          })
        }}
        onChange={(v: Moment) => {
          console.log(values)
          handleChange(v, values.filter((e) => moment(e.date).isSame(v))[0])
        }}
        sx={{
          border: '1px solid',
          width: '100%',
          '&.MuiDateCalendar-root': {
            borderRadius: '12px',
            '* .Mui-disabled': {
              color: grey['400'],
              '.MuiSvgIcon-root': {
                color: grey['400']
              }
            },
            '.MuiSvgIcon-root': {
              color: grey['900']
            }
          }
        }}
      />
    </LocalizationProvider>
  )
}

export default AttendanceDates
