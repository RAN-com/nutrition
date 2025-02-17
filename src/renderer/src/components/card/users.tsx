import { Avatar, styled } from '@mui/material'
import { grey } from '@mui/material/colors'
import CustomTypography from '../typography'
import React from 'react'

type Props = {
  name: string
  email: string
  phone: string
  photo_url?: string
  children?: React.ReactNode
  onClick(): void
}

const UserCard = ({ name, email, phone, photo_url, children, onClick }: Props) => {
  return (
    <Card onClick={onClick}>
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
  borderRadius: '12px',
  display: 'grid',
  gridTemplateColumns: '1fr',
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
