import { Button, styled } from '@mui/material'
import Gif from '@renderer/assets/UoK72GjJFo(1).gif'
import CustomTypography from '@renderer/components/typography'
import { useNavigate } from 'react-router-dom'
const NotFound = () => {
  const navigate = useNavigate()
  return (
    <Container>
      <div className="ic">
        <img src={Gif} alt={'image'} />
        <CustomTypography variant="body1" textAlign={'center'} sx={{}}>
          We maybe working on this page....🙌
        </CustomTypography>
        <Button
          variant="contained"
          disableRipple={true}
          disableElevation
          disableFocusRipple
          disableTouchRipple
          onClick={() => navigate('/home')}
          sx={{ padding: '8px 32px', marginTop: '12px', borderRadius: '4px' }}
        >
          Go Home
        </Button>
      </div>
    </Container>
  )
}

export default NotFound

const Container = styled('div')({
  width: '100vw',
  height: 'calc(var(--vh, 1vh) * 100 - 164px)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  userSelect: 'none',
  msUserSelect: 'none',
  MozUserSelect: 'none',
  WebkitUserSelect: 'none',
  '.ic': {
    width: '100%',
    maxWidth: '460px',
    textAlign: 'center',
    margin: '0 auto',
    padding: '18px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  '& img': {
    width: '200px',
    height: '200px'
  }
})
