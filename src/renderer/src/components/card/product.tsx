import styled from '@emotion/styled'
import { ProductData } from '@renderer/types/product'
import CustomTypography from '../typography'
import CustomIcon from '../icons'
import { grey, red } from '@mui/material/colors'
import { useAppSelector } from '@renderer/redux/store/hook'
import NotFound from '../../assets/image-not-found.jpg'
import { Tooltip } from '@mui/material'

type Props = {
  data: ProductData
  onClick?(): void
  onEdit?(): void
  showEdit?: boolean
  onAddCard?(): void
  onRemove?(): void
  onDelete?(): void
}
const ProductCard = ({ data, onClick, onEdit, onAddCard, onRemove, onDelete }: Props) => {
  const isAdded = useAppSelector((s) =>
    s.product.cart.products.some((e) => e.detail.pid === data.pid)
  )

  return (
    <Container onClick={onClick}>
      <Content>
        <div className="content">
          <CustomTypography variant="h5" fontWeight={'bold'}>
            {data?.name}
          </CustomTypography>
          <CustomTypography variant={'body1'}>{'₹ ' + data?.price}</CustomTypography>
          <CustomTypography variant={'body2'}>{data?.in_stock} Left</CustomTypography>
        </div>
        <div className="icons">
          <div style={{ display: 'flex', flexDirection: 'row', gap: '4px' }}>
            <Tooltip title={''}>
              <span>
                <CustomIcon
                  name="BOOTSTRAP_ICONS"
                  icon={isAdded ? 'BsCartX' : 'BsCart'}
                  size={18}
                  color={grey[800]}
                  onClick={() => (isAdded ? onRemove?.() : onAddCard?.())}
                  sx={{
                    padding: '8px',
                    backgroundColor: grey['200'],
                    borderRadius: '12px'
                  }}
                />
              </span>
            </Tooltip>
            <CustomIcon
              onTouchStart={onEdit}
              name="MATERIAL_DESIGN"
              icon="MdEdit"
              size={18}
              color={grey[800]}
              onClick={onEdit}
              sx={{
                padding: '8px',
                backgroundColor: grey['200'],
                borderRadius: '12px'
              }}
            />
          </div>

          <CustomIcon
            className="delete_icon"
            onTouchStart={onDelete}
            name="MATERIAL_DESIGN"
            icon="MdDelete"
            size={18}
            color={red[800]}
            onClick={onDelete}
            sx={{
              padding: '8px',
              backgroundColor: red[100],
              borderRadius: '12px'
            }}
          />
        </div>
      </Content>
      <ImageContainer>
        <img
          src={
            data?.thumbnail?.length ? data?.thumbnail : (data?.product_images?.[0]?.url ?? NotFound)
          }
        />
      </ImageContainer>
    </Container>
  )
}

export default ProductCard

const Container = styled('div')({
  width: '100%',
  maxWidth: '320px',
  height: 'max-content',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '12px',
  backgroundColor: '#ffffff',
  padding: '12px',
  '.delete_icon': {
    opacity: 0,
    pointerEvents: 'none'
  },
  '&:hover': {
    '.delete_icon': {
      opacity: 1,
      pointerEvents: 'all'
    }
  }
})

const ImageContainer = styled('div')({
  width: '100%',
  margin: 'auto',
  aspectRatio: '16/9',
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

const Content = styled('div')({
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  paddingBottom: '12px',
  '.content': {
    display: 'flex',
    flexDirection: 'column'
  },
  '.icons': {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  }
})
