import { Button, Modal, Paper } from '@mui/material'
import useOnlineStatus from '@renderer/hooks/no-internet'

import { Outlet } from 'react-router-dom'
import load from '../../assets/offline.gif'
import CustomTypography from '../typography'

const NoInternet = () => {
  const isOnline = useOnlineStatus()

  return (
    <>
      <Outlet />
      <Modal
        open={!isOnline}
        sx={{
          '.MuiPaper-root': {
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#a6a6a64d'
          },
          '& .container': {
            display: 'flex',
            backgroundColor: '#3a3a3aa6',
            padding: '24px 48px',
            borderRadius: '12px',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            maxWidth: '420px',
            maxHeight: 'auto',
            margin: 'auto',
            '& img': {
              width: '100%'
            },
            '.btn-container': {
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              maxWidth: '320px',
              margin: 'auto',
              padding: '12px 0px',
              gap: 12
            }
          }
        }}
      >
        <Paper elevation={0}>
          <div className="container">
            <img src={load} alt={'no_internet'} />
            <CustomTypography variant="h5" color="white">
              No Internet Connection
            </CustomTypography>
            <CustomTypography variant="body2" color="white">
              Check Your connection and Try Again
            </CustomTypography>
            <div className="btn-container">
              <Button
                fullWidth
                variant="contained"
                // disableElevation
                sx={{
                  backgroundColor: '#00862d'
                }}
                onClick={() => window.location?.reload()}
              >
                <CustomTypography textTransform={'none'}>Refresh</CustomTypography>
              </Button>
              <Button
                fullWidth
                disableElevation
                disableFocusRipple
                disableRipple
                disableTouchRipple
                onClick={() => window?.close()}
              >
                <CustomTypography textTransform={'none'} color={'white'}>
                  Close
                </CustomTypography>
              </Button>
            </div>
          </div>
        </Paper>
      </Modal>
    </>
  )
}

export default NoInternet
