import { Button, Dialog } from '@mui/material'
import CustomTypography from '../typography'
import { markMarathonCancelled } from '@renderer/firebase/marathon'

type Props = {
  open: boolean
  onClose(): void
  uid: string
  mid: string
}

export const MarathonDeleteModal = ({ onClose, open }: Props) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: '100%',
            maxWidth: '320px',
            display: 'flex',
            padding: '12px',
            flexDirection: 'column',
            alignItems: 'center'
          }
        }
      }}
    >
      <>asdfasdfasdf</>
    </Dialog>
  )
}

export const MarathonCancelModal = ({ onClose, open, uid, mid }: Props) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: '100%',
            maxWidth: '320px',
            display: 'flex',
            padding: '12px',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
          }
        }
      }}
    >
      <CustomTypography textAlign={'center'} fontSize={'12px'}>
        By cancelling the marathon, you confirm that no further changes can be made. However, all
        participant data and progress will remain accessible in read-only mode
      </CustomTypography>
      <div style={{ display: 'flex', gap: '12px' }}>
        <Button
          color={'error'}
          onClick={async () => {
            await markMarathonCancelled(uid, mid)
            onClose()
          }}
        >
          Yes, I want to cancel
        </Button>
        <Button variant="contained" onClick={onClose}>
          Go Back
        </Button>
      </div>
    </Dialog>
  )
}
