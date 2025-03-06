import { styled } from '@mui/material'
import { grey } from '@mui/material/colors'
import { ProductData } from '@renderer/types/product'
import Counter from './counter'
import CustomTypography from '../typography'
import CustomIcon from '../icons'
import NotFound from '../../assets/image-not-found.jpg'

const CartCard = ({
  cart,
  onDecrement,
  onIncrement,
  onRemove
}: {
  cart: {
    detail: ProductData
    quantity: number
  }
  onDecrement(): void
  onIncrement(): void
  onRemove(): void
}) => {
  return (
    <Container>
      <ImageContainer>
        <img
          src={cart.detail?.product_images?.[0].url ?? cart?.detail?.thumbnail ?? NotFound}
          alt={cart.detail.name}
        />
      </ImageContainer>
      <div className="container">
        <CustomTypography fontWeight={'bold'}>{cart.detail.name}</CustomTypography>
        <CustomTypography>{'₹ ' + cart.detail.price}</CustomTypography>
      </div>
      <div
        style={{
          margin: 'auto',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'flex-end'
        }}
      >
        <CustomIcon
          name="LUCIDE_ICONS"
          icon={'LuTrash'}
          onClick={onRemove}
          size={18}
          color={grey[800]}
        />
        <Counter value={cart.quantity} onDecrement={onDecrement} onIncrement={onIncrement} />
      </div>
    </Container>
  )
}

export default CartCard

const Container = styled('div')({
  width: '100%',
  transition: 'all .3s',
  display: 'grid',
  gridTemplateColumns: '80px 1fr auto',
  padding: '12px',
  backgroundColor: grey[200],
  borderRadius: '8px',
  '.container': {
    height: '100%',
    margin: 'auto 0',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '0px 12px'
  }
})

const ImageContainer = styled('div')({
  width: '100%',
  margin: 'auto',
  aspectRatio: '1/1',
  borderRadius: '12px',
  overflow: 'hidden',
  position: 'relative',
  top: 0,
  backgroundColor: '#afafaf',
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'contain'
  }
})
