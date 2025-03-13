import { Button, Divider, styled } from '@mui/material'
import PageHeader from '@renderer/components/header/pageHeader'
import CustomTypography from '@renderer/components/typography'
import { useAppSelector, useAppDispatch } from '@renderer/redux/store/hook'
import React from 'react'
import EmptyCart from '@renderer/assets/cart-empty.png'
import CustomIcon from '@renderer/components/icons'
import CartCard from '@renderer/components/cart/card'
import { deleteFromCart, setQuantity } from '@renderer/redux/features/user/products'
import { grey } from '@mui/material/colors'
import Checkout from './checkout'

const Cart = () => {
  // const user = useAppSelector((s) => s.auth.user?.uid)
  const cart = useAppSelector((s) => s.product.cart.products)
  const dispatch = useAppDispatch()
  // const [name, setName] = React.useState('')
  const total = cart.reduce(
    (sum, { detail }) =>
      sum + detail.price * cart.filter((e) => e.detail.pid === detail.pid)[0].quantity,
    0
  )
  const [showCheckout, setShowCheckout] = React.useState(false)

  return (
    <>
      <Container
        className="scrollbar"
        sx={{
          position: 'relative',
          top: 0,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '24px',
          backgroundColor: '#f5f5f5',
          overflowY: 'auto',
          gap: '12px',
          maxWidth: '420px'
        }}
      >
        <Checkout open={showCheckout} onClose={() => setShowCheckout(false)} />
        <PageHeader
          sx={{
            backgroundColor: '#f5f5f5aa',
            backdropFilter: 'blur(10px)',
            position: 'sticky',
            top: 0,
            padding: '18px 24px',
            paddingBottom: '0px'
          }}
          start={
            cart.length > 0 ? (
              <CustomTypography variant={'h6'} paddingBottom={'12px'}>
                Cart
              </CustomTypography>
            ) : null
          }
        />
        <Container
          className="scrollbar"
          sx={{
            padding: '0px 18px',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            ...(cart.length === 0
              ? {
                  height: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: grey[200]
                }
              : {
                  height: '100%',
                  backgroundColor: 'white',
                  maxWidth: 'calc(100% - 32px)',
                  margin: '0 auto',
                  padding: '8px 8px',
                  borderRadius: '12px',
                  gap: '12px'
                })
          }}
        >
          {cart.length === 0 ? (
            <>
              <img src={EmptyCart} alt="Empty Cart" style={{ width: '100%', maxWidth: '300px' }} />
              <CustomTypography variant={'h6'}>Your cart is empty</CustomTypography>
              <CustomTypography variant={'body2'} paddingBottom={'12px'}>
                Add products from the product list to your cart
              </CustomTypography>
            </>
          ) : (
            cart.map((cart) => (
              <CartCard
                onRemove={() => {
                  dispatch(deleteFromCart({ id: cart.detail.pid }))
                }}
                key={cart.detail.pid}
                cart={cart}
                onDecrement={() => {
                  dispatch(
                    setQuantity({
                      type: 'remove',
                      id: cart.detail.pid,
                      quantity: 1
                    })
                  )
                }}
                onIncrement={() => {
                  dispatch(
                    setQuantity({
                      type: 'add',
                      id: cart.detail.pid,
                      quantity: 1
                    })
                  )
                }}
              />
            ))
          )}
        </Container>
        {cart.length !== 0 && (
          <Container
            sx={{
              maxWidth: 'calc(100% - 32px)',
              margin: 'auto',
              padding: '12px 18px',
              marginBottom: '18px',
              backgroundColor: 'white',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              '.row': {
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center'
              }
            }}
          >
            <div className="row">
              <CustomTypography variant={'body1'}>Item Amount</CustomTypography>
              <CustomTypography variant={'body1'}>${total.toFixed(2)}</CustomTypography>
            </div>
            <Divider />
            <div className="row">
              <CustomTypography variant={'h6'}>Total</CustomTypography>
              <CustomTypography variant={'body1'} fontWeight={'bold'}>
                ${total.toFixed(2)}
              </CustomTypography>
            </div>
            {/* Checkout Button */}
            <Button
              variant={'contained'}
              color="primary"
              disableElevation={true}
              focusRipple={false}
              disableRipple={true}
              disableFocusRipple={true}
              disableTouchRipple={true}
              onClick={() => setShowCheckout(true)}
              endIcon={
                <CustomIcon
                  size={20}
                  name={'LUCIDE_ICONS'}
                  stopPropagation={false}
                  icon="LuArrowRight"
                  color={'white'}
                />
              }
              sx={{
                padding: '8px 12px'
              }}
            >
              Go To Checkout
            </Button>
          </Container>
        )}
      </Container>
    </>
  )
}

export default Cart

const Container = styled('div')({
  width: '100%',
  transition: 'all .3s',
  height: 'calc(100%)',
  maxHeight: 'calc(100%)'
})
