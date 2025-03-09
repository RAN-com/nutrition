import { Button, styled, Tooltip } from '@mui/material'
import ProductCard from '@renderer/components/card/product'
import PageHeader from '@renderer/components/header/pageHeader'
import CustomIcon from '@renderer/components/icons'
import CustomTypography from '@renderer/components/typography'
import {
  addToCart,
  asyncGetProducts,
  deleteFromCart,
  setProductEdit
} from '@renderer/redux/features/user/products'
import { useAppSelector, useAppDispatch } from '@renderer/redux/store/hook'
import React from 'react'
import CreateProduct from './create-section'

const ProductList = () => {
  const { page, limit } = useAppSelector((s) => s.product.data)
  const admin = useAppSelector((s) => s.auth.user)
  const products = useAppSelector((s) => s.product.data)
  const canAdd = (admin?.subscription?.total_products ?? 1) <= products?.total
  const dispatch = useAppDispatch()
  const [addProduct, setAddProduct] = React.useState(false)
  const edit = useAppSelector((s) => s.product.edit)
  React.useEffect(() => {
    if (!admin) return
    dispatch(
      asyncGetProducts({
        uid: admin?.uid
      })
    )
  }, [page, limit])

  return (
    <>
      <CreateProduct
        open={addProduct}
        edit={edit ?? null}
        onClose={() => {
          setAddProduct(false)
        }}
      />
      <Container
        className="scrollbar"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto'
        }}
      >
        <PageHeader
          start={
            <div>
              <CustomTypography variant={'h6'} paddingBottom={'12px'}>
                Products Inventory
              </CustomTypography>
            </div>
          }
          end={
            <Tooltip title={canAdd ? 'You have reached the limit of Products' : ''} arrow>
              <Button
                startIcon={
                  <CustomIcon
                    stopPropagation={false}
                    name={'LUCIDE_ICONS'}
                    icon="LuPlus"
                    color={'white'}
                  />
                }
                variant={'contained'}
                color="primary"
                // disabled={canAdd}
                disableElevation={true}
                focusRipple={false}
                disableRipple={true}
                disableFocusRipple={true}
                disableTouchRipple={true}
                onClick={() => !canAdd && setAddProduct(true)}
                sx={{
                  marginBottom: '12px',
                  padding: '6px 12px'
                }}
              >
                Add
              </Button>
            </Tooltip>
          }
        />
        <Container
          className="scrollbar"
          sx={{
            padding: '18px 0px',
            borderRadius: '24px',
            backgroundColor: '#f5f5f5',
            width: '100%',
            ...(products.total === 0
              ? {
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center'
                }
              : {
                  height: 'max-content',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  gap: '12px',
                  flexWrap: 'wrap',
                  overflowY: 'auto'
                })
          }}
        >
          {products?.total === 0 ? (
            <>
              <CustomTypography variant={'h6'}>No products found</CustomTypography>
              <CustomTypography variant={'body2'} paddingBottom={'12px'}>
                Add products to your inventory
              </CustomTypography>
            </>
          ) : (
            products?.products?.map((e) => (
              <div
                style={{
                  // min width should be 320ox, implement in flex box
                  flexGrow: 0,
                  flexBasis: '320px',
                  margin: products.products.length > 3 ? 'auto' : '0'
                }}
              >
                <ProductCard
                  key={e.pid}
                  onEdit={() => {
                    dispatch(setProductEdit(e))
                    setAddProduct(true)
                  }}
                  data={e}
                  onAddCard={() => dispatch(addToCart(e))}
                  onRemove={() => dispatch(deleteFromCart({ id: e.pid }))}
                />
              </div>
            ))
          )}
        </Container>
      </Container>
    </>
  )
}

export default ProductList

const Container = styled('div')({
  width: '100%',
  transition: 'all .3s'
})
