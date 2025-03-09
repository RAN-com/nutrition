import { styled } from '@mui/material'
import ProductList from './product-list'
import Cart from './cart'

const ProductsPage = () => {
  return (
    <>
      <Container
        sx={{
          height: `calc(${window.screen.availHeight}px - 164px)`,
          maxHeight: `calc(${window.screen.availHeight}px - 164px)`,
          overflow: 'hidden',
          position: 'relative',
          top: 0,
          width: '100%',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '1fr',
          gap: '12px'
        }}
      >
        <ProductList />
        <Cart />
      </Container>
    </>
  )
}

export default ProductsPage

const Container = styled('div')({
  width: '100%',
  transition: 'all .3s'
})
