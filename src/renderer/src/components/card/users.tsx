import { Avatar, Checkbox, Chip, styled } from '@mui/material'
import { grey } from '@mui/material/colors'
import CustomTypography from '../typography'
import React from 'react'
import CustomIcon from '../icons'

type Props = {
  name: string
  email: string
  phone: string
  photo_url?: string
  children?: React.ReactNode
  onClick(): void
  onMoreClick?(e: React.MouseEvent<HTMLDivElement>): void
  onDelete?(): void
  attendance?: 'present' | 'absent'
  markAttendance?: boolean
  onMarkAttendanceChange?(e: 'present' | 'absent'): void
  attendanceStatus?: 'present' | 'absent' | 'unknown'
}

const UserCard = ({
  name,
  email,
  phone,
  photo_url,
  children,
  onClick,
  onMoreClick,
  markAttendance = true,
  attendance,
  attendanceStatus = 'unknown',
  onMarkAttendanceChange
}: Props) => {
  return (
    <Card
      onClick={() => {
        if (markAttendance) {
          onMarkAttendanceChange?.(attendance === 'present' ? 'absent' : 'present')
          return
        }
        onClick?.()
      }}
    >
      <div
        className="ig"
        style={{
          borderBottom: children ? `2px solid ${grey[300]}` : '',
          paddingBottom: children ? '12px' : ''
        }}
      >
        <Avatar
          src={photo_url}
          alt={name}
          sx={{
            width: '54px',
            height: '54px',
            aspectRatio: '1/1'
          }}
        />
        <div className="content">
          <CustomTypography variant={'h6'} fontWeight={'bold'}>
            {name}
          </CustomTypography>
          <CustomTypography fontSize={'0.8rem'}>{email}</CustomTypography>
          <CustomTypography fontSize={'0.8rem'}>{phone}</CustomTypography>
        </div>
      </div>
      <div style={{ gap: '12px', display: 'flex', flexDirection: 'column' }}>
        {markAttendance ? (
          <Checkbox
            onClick={(e) => {
              e.stopPropagation()
            }}
            color="primary"
            icon={
              <CustomIcon
                name="MATERIAL_DESIGN"
                icon="MdCheckBoxOutlineBlank"
                color={grey['600']}
              />
            }
            value={attendance === 'present'}
            checked={attendance === 'present'}
            checkedIcon={
              <CustomIcon name="MATERIAL_DESIGN" icon="MdCheckBox" color={grey['600']} />
            }
            sx={{
              padding: 0,
              margin: 0,
              width: 'max-content',
              height: 'max-content',
              '&.Mui-checked': {
                color: grey['600']
              }
            }}
            onChange={(e) => {
              e.stopPropagation()
              if (!onMarkAttendanceChange) return
              if (attendance === 'present') {
                onMarkAttendanceChange('absent')
                return
              }

              if (attendance === 'absent') {
                onMarkAttendanceChange('present')
                return
              }

              // Toggle attendance state
              onMarkAttendanceChange?.(e.target.checked ? 'present' : 'absent')
              // Handle attendance marking logic here
            }}
          />
        ) : (
          <>
            <CustomIcon
              onClick={onMoreClick}
              name="MATERIAL_DESIGN"
              icon="MdMoreVert"
              color={grey['600']}
            />
            {attendanceStatus !== 'unknown' && (
              <Chip
                label={attendanceStatus}
                size="small"
                color={
                  attendanceStatus === 'present'
                    ? 'success'
                    : attendanceStatus === 'absent'
                      ? 'error'
                      : 'default'
                }
                sx={{
                  width: 'max-content',
                  height: 'max-content',
                  fontSize: '0.8rem',
                  textTransform: 'capitalize'
                }}
              />
            )}
          </>
        )}
      </div>
      {children}
    </Card>
  )
}

export default UserCard

const Card = styled('div')({
  width: 'calc(100% - 24px)',
  maxWidth: '360px',
  minHeight: 'max-content',
  maxHeight: 'max-content',
  padding: '12px 24px',
  paddingRight: 12,
  borderRadius: '12px',
  display: 'grid',
  alignItems: 'start',
  gridTemplateColumns: '1fr  auto',
  gridTemplateRows: 'auto 1fr',
  cursor: 'pointer',
  backgroundColor: '#ffffff',
  boxShadow: '0px 0px 4px 0px #d1d1d1',
  '&:hover': {
    boxShadow: '0px 0px 4px 1px #d1d1d1'
  },
  transition: 'all .3s',
  '.ig': {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: '12px',
    '& .content': {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      height: 'max-content',
      justifyContent: 'center'
    }
  }
})
