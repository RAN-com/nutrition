import { Button, Fade, Menu, MenuItem, styled, Tooltip } from '@mui/material'
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
import { blue, grey } from '@mui/material/colors'
import { capitalizeSentence } from '@renderer/utils/functions'
import zIndex from '@mui/material/styles/zIndex'
import { deleteProduct } from '@renderer/firebase/product'
import { errorToast } from '@renderer/utils/toast'

const ProductList = () => {
  const { page, limit } = useAppSelector((s) => s.product.data)
  const admin = useAppSelector((s) => s.auth.user)
  const [products, cart] = useAppSelector((s) => [s.product.data, s.product.cart])
  const canAdd = (admin?.subscription?.total_products ?? 1) <= products?.total
  const dispatch = useAppDispatch()
  const [addProduct, setAddProduct] = React.useState(false)
  const edit = useAppSelector((s) => s.product.edit)
  const [pageType, setPageType] = React.useState<'OUT_PURCHASE' | 'CENTER_USAGE'>('OUT_PURCHASE')
  const [anchorEl, setAnchorEl] = React.useState<Element | null>(null)
  const isCheckoutOpen = useAppSelector((s) => s.product.isCheckoutActive)
  const [refresh, setRefresh] = React.useState(0)

  const filter = products?.products?.filter((e) => e?.type === pageType) ?? []

  React.useEffect(() => {
    if (!admin) return
    dispatch(
      asyncGetProducts({
        uid: admin?.uid
      })
    )
  }, [page, limit])

  React.useEffect(() => {
    if (!admin || refresh === 0) return
    dispatch(
      asyncGetProducts({
        uid: admin?.uid
      })
    )
  }, [refresh])

  return (
    <>
      <CreateProduct
        open={addProduct}
        edit={edit ?? null}
        onClose={() => {
          dispatch(setProductEdit(undefined))
          setAddProduct(false)
        }}
      />
      <Container
        className="scrollbar"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          position: 'relative',
          top: 0
        }}
      >
        <Fade in={isCheckoutOpen}>
          <div
            style={{
              position: 'absolute',
              top: 0,
              zIndex: zIndex.modal,
              backgroundColor: grey['900'] + 'ee',
              width: '100%',
              height: '100%',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <CustomTypography variant="h6" fontWeight={'normal'} color={'white'}>
              Complete the checkout process to continue...
            </CustomTypography>
          </div>
        </Fade>
        <PageHeader
          start={
            <div>
              <CustomTypography variant={'h6'}>Products Inventory</CustomTypography>
              <CustomTypography
                sx={{
                  cursor: 'pointer'
                }}
                onClick={(e) => setAnchorEl(e.currentTarget)}
              >
                {capitalizeSentence(pageType.toLocaleLowerCase())}{' '}
                <CustomIcon
                  name={'LUCIDE_ICONS'}
                  icon="LuChevronDown"
                  color={blue['400']}
                  stopPropagation={false}
                />
              </CustomTypography>
              <Menu open={!!anchorEl} onClose={() => setAnchorEl(null)} anchorEl={anchorEl}>
                <MenuItem
                  onClick={() => {
                    setPageType('OUT_PURCHASE')
                    setRefresh((prev) => (prev += 1))
                    setAnchorEl(null)
                  }}
                  value={'OUT_PURCHASE'}
                >
                  Out Purchase
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setRefresh((prev) => (prev += 1))
                    setPageType('CENTER_USAGE')
                    setAnchorEl(null)
                  }}
                  value={'CENTER_USAGE'}
                >
                  Center Usage
                </MenuItem>
              </Menu>
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
            ...(filter?.length === 0
              ? {
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center'
                }
              : {
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  height: 'max-content',
                  gap: '12px',
                  flexWrap: 'wrap',
                  overflowY: 'auto'
                })
          }}
        >
          {filter?.length === 0 ? (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <CustomTypography variant={'h6'}>No products found</CustomTypography>
              <CustomTypography variant={'body2'} paddingBottom={'12px'}>
                Add products to your inventory
              </CustomTypography>
            </div>
          ) : (
            filter?.map((e) => (
              <div
                style={{
                  // min width should be 320ox, implement in flex box
                  flexGrow: 0,
                  flexBasis: '320px'
                  // margin: products.products.length > 3 ? 'auto' : '0'
                }}
              >
                <ProductCard
                  key={e.pid}
                  onEdit={() => {
                    dispatch(setProductEdit(e))
                    setAddProduct(true)
                  }}
                  onDelete={async () => {
                    await deleteProduct(admin?.uid as string, e.pid)
                  }}
                  data={e}
                  onAddCard={() => {
                    const check = cart?.products?.filter((e) => e.detail?.type !== pageType)
                    if (check.length) {
                      const id = (
                        pageType === 'OUT_PURCHASE' ? 'Out Purchase' : 'Center Usage'
                      ).replace('_', ' ')

                      const exist = (
                        pageType === 'OUT_PURCHASE' ? 'Center Usage' : 'Out Purchase'
                      ).replace('_', ' ')

                      errorToast(
                        `You cannot add ${id} Items.\n Products from ${exist} already exists`
                      )
                    } else {
                      dispatch(addToCart(e))
                    }
                  }}
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
