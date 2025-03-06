import { styled } from '@mui/material'
import ServiceCard from '@renderer/components/card/services'
import CustomTypography from '@renderer/components/typography'
import { useAppSelector } from '@renderer/redux/store/hook'

const ServicesPreview = () => {
  const services = useAppSelector((s) => s?.card?.editor?.data?.['services'] ?? null)
  const theme = useAppSelector((s) => s?.card?.editor?.data?.['personal_details']?.card_theme)

  return (
    <Container className="scrollbar">
      <div
        className="header"
        style={{
          backgroundColor: theme?.accent_color
        }}
      >
        <CustomTypography variant={'h5'} color={'white'} fontWeight={'medium'}>
          Services
        </CustomTypography>
      </div>
      <div
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          paddingBottom: '32px'
        }}
      >
        {services?.map((e) => <ServiceCard {...e} />)}
      </div>
    </Container>
  )
}

export default ServicesPreview

const Container = styled('div')({
  width: '100%',
  height: '100%',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  padding: '0px 32px',
  position: 'relative',
  top: 0,
  '.header': {
    width: '100%',
    maxWidth: '80%',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px 0px',
    borderRadius: '0px 0px 12px 12px',
    marginBottom: '12px'
  }
})
