import { Dialog, Button, styled } from '@mui/material'
import CustomTypography from '../typography'

const RestartModal = ({
  open,
  onClose,
  onRestart
}: {
  open: boolean
  onClose(): void
  onRestart(): void
}) => {
  return (
    <Dialog
      open={open}
      slotProps={{
        paper: {
          sx: {
            width: '100%',
            maxWidth: '420px',
            padding: '12px 18px',
            paddingTop: '24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }
        }
      }}
    >
      <CustomTypography variant={'h4'} paddingBottom={'12px'}>
        New Version Available
      </CustomTypography>
      <CustomTypography variant={'body2'} textAlign={'center'}>
        We added new features and bug fixes to make your experience smooth as possible
      </CustomTypography>
      <Row>
        <Button
          variant="outlined"
          sx={{
            flex: 1,
            borderRadius: 100
          }}
          onClick={onClose}
        >
          Later
        </Button>
        <Button
          disableElevation
          disableFocusRipple
          disableRipple
          disableTouchRipple
          sx={{
            flex: 1,
            borderRadius: 100
          }}
          onClick={onRestart}
          variant="contained"
          color="primary"
        >
          Update Now
        </Button>
      </Row>
    </Dialog>
  )
}

export default RestartModal

const Row = styled('div')({
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  gap: '12px',
  marginTop: '24px',
  paddingBottom: '12px'
})
