import { styled } from '@mui/material'
import ProductList from './product-list'
import Cart from './cart'

const ProductsPage = () => {
  return (
    <>
      <Container
        sx={{
          height: 'calc(100%)',
          maxHeight: 'calc(100%)',
          overflow: 'auto',
          position: 'relative',
          top: 0,
          width: '100%',
          display: 'flex',
          flexGrow: 1,
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
