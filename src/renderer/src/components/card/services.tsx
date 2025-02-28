import { styled } from '@mui/material'
import { CardData } from '@renderer/types/card'
import CustomTypography from '../typography'
import { grey, red } from '@mui/material/colors'
import CustomIcon from '../icons'

type Props = CardData['services'][number] & {
  onClick?(): void
  onDelete?(): void
}
const ServiceCard = ({ title, subtitle, photo_url, description, onClick, onDelete }: Props) => {
  return (
    <Container onClick={onClick}>
      <CustomTypography fontWeight={'bold'} variant={'h6'}>
        {title}
      </CustomTypography>
      <CustomTypography variant={'body2'} color={grey['400']}>
        {subtitle}
      </CustomTypography>
      <div className="img_container">
        <img
          src={
            photo_url
              ? typeof photo_url === 'string'
                ? photo_url
                : URL.createObjectURL(photo_url)
              : ''
          }
          alt={title}
        />{' '}
      </div>
      <CustomTypography variant={'body2'}>{description}</CustomTypography>
      {onDelete && (
        <CustomIcon
          name={'LUCIDE_ICONS'}
          icon="LuTrash"
          size={18}
          color={red['100']}
          onClick={onDelete}
          sx={{
            padding: '6px',
            backgroundColor: red['400'],
            position: 'absolute',
            top: '12px',
            right: '12px',
            borderRadius: '4px'
          }}
        />
      )}
    </Container>
  )
}

export default ServiceCard

const Container = styled('div')({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  padding: '4px 16px',
  boxShadow: '0px 0px 1px 0px blue',
  borderRadius: '12px',
  position: 'relative',
  top: 0,
  '.img_container': {
    width: '100%',
    aspectRatio: '16/9',
    overflow: 'hidden',
    backgroundColor: '#d3d3d3',
    borderRadius: '12px',
    margin: '12px 0px',
    '& img': {
      width: '100%',
      height: '100%',
      objectFit: 'contain'
    }
  }
})
