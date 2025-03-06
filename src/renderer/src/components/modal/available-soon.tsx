import { Dialog, styled } from '@mui/material'
import AvailableSoonGIF from '../../assets/available-soon.gif'
import CustomTypography from '../typography'
import CustomIcon from '../icons'

type Props = {
  open: boolean
  onClose(): void
}

const AvailableSoon = ({ onClose, open }: Props) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <Container>
        <div
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'row-reverse',
            padding: '12px 0px 0px 0px'
          }}
        >
          <CustomIcon onClick={onClose} color={'black'} name={'LUCIDE_ICONS'} icon={'LuX'} />
        </div>
        <img src={AvailableSoonGIF} alt="UNDER_CONTRUCTION" />
        <CustomTypography
          textAlign={'center'}
          paddingBottom={'18px'}
          fontWeight={'normal'}
          flexDirection={'column'}
        >
          <CustomTypography variant={'h6'} textAlign={'center'}>
            Under Construction
          </CustomTypography>
          You can access this feature soon. You'll get notified when its done 😉😇
        </CustomTypography>
      </Container>
    </Dialog>
  )
}

export default AvailableSoon

const Container = styled('div')({
  width: '420px',
  height: 'max-content',
  padding: '12px 18px',
  backgroundColor: 'white',
  margin: 'auto',
  overflow: 'hidden',
  '& img': {
    width: '460px',
    height: 'auto',
    margin: 'auto',
    objectFit: 'contain'
  }
})
