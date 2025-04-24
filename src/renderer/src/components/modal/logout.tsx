import LogoutPNG from '@renderer/assets/logout-popup.png'

import { Button, Dialog, DialogContent, DialogTitle, styled } from '@mui/material'
import { resetUser, setLogoutFlag } from '@renderer/redux/features/user/auth'
import { useAppDispatch, useAppSelector } from '@renderer/redux/store/hook'
import CustomIcon from '../icons'
import { grey } from '@mui/material/colors'
import CustomTypography from '../typography'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { resetApp } from '@renderer/redux/store'

const LogoutWarning = (): React.ReactNode => {
  const dispatch = useAppDispatch()
  const open = useAppSelector((s) => s.auth.logout_flag)
  const navigate = useNavigate()

  return (
    <Dialog
      open={open}
      onClose={() => dispatch(setLogoutFlag(false))}
      slotProps={{
        paper: {
          square: false,
          sx: {
            '& *': {
              userSelect: 'none',
              msUserSelect: 'none',
              MozUserSelect: 'none'
            },
            width: 'calc(100% - 12px)',
            maxWidth: '420px',
            borderRadius: '12px',
            '.MuiTypography-root': {
              textAlign: 'center'
            }
          }
        }
      }}
    >
      <DialogTitle alignItems={'flex-end'} display={'flex'} flexDirection={'column'} gap={'4px'}>
        <CustomIcon
          name="LUCIDE_ICONS"
          icon="LuX"
          color={grey['400']}
          onClick={() => dispatch(setLogoutFlag(false))}
        />
      </DialogTitle>
      <DialogContent
        sx={{
          alignItems: 'center',
          justifyContent: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          flexWrap: 'wrap',
          padding: '12px'
        }}
      >
        <ImageContainer>
          <img loading="lazy" src={LogoutPNG} alt="logout" />
        </ImageContainer>

        <CustomTypography>You&apos;ll be logged out immediately</CustomTypography>
        <Button
          onClick={() => {
            dispatch(resetUser())
            dispatch(resetApp())
            navigate('/auth/login')
          }}
          variant="contained"
        >
          <CustomTypography variant={'body2'}>Continue</CustomTypography>
        </Button>
        <Button
          onClick={() => dispatch(setLogoutFlag(false))}
          variant="text"
          sx={{ padding: '0px', paddingBottom: '12px', color: grey['main'] }}
          startIcon={
            <CustomIcon name={'LUCIDE_ICONS'} icon={'LuArrowLeft'} color={grey['700']} size={18} />
          }
        >
          <CustomTypography variant={'body2'} fontWeight={'medium'} color={grey['700']}>
            Back
          </CustomTypography>
        </Button>
      </DialogContent>
    </Dialog>
  )
}

export default LogoutWarning

const ImageContainer = styled('div')({
  width: '100%',
  height: 'max-content',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  userSelect: 'none',
  msUserSelect: 'none',
  MozUserSelect: 'none',
  WebkitUserSelect: 'none',
  '& img': {
    width: '100%',
    maxWidth: '320px',
    height: '100%',
    maxHeight: '240px',
    objectFit: 'contain'
  }
})
