import {
  Button,
  debounce,
  FormControl,
  FormLabel,
  MenuItem,
  Modal,
  Paper,
  Select,
  styled
} from '@mui/material'
import CustomIcon from '@renderer/components/icons'
import CustomTextInput from '@renderer/components/text-input'
import CustomTypography from '@renderer/components/typography'
import { confirmOrder } from '@renderer/firebase/order'
import { updateProduct } from '@renderer/firebase/product'
import { resetCart } from '@renderer/redux/features/user/products'
import { useAppSelector, useAppDispatch } from '@renderer/redux/store/hook'
import { ProductData } from '@renderer/types/product'
import { errorToast } from '@renderer/utils/toast'
import { useFormik } from 'formik'
import React from 'react'
import * as yup from 'yup'
type Props = {
  open: boolean
  onClose: () => void
}

function calculateDiscountedPrice(originalPrice: number, offerPercentage: number): number {
  if (originalPrice < 0 || offerPercentage < 0 || offerPercentage > 100) {
    throw new Error('Invalid input values')
  }
  const discount: number = (originalPrice * offerPercentage) / 100
  return originalPrice - discount
}

const validationSchema = yup.object({
  name: yup
    .string()
    .matches(/^[a-zA-Z ]*$/, 'Name should contain only alphabets')
    .required('Name is required')
    .min(3, 'Name is too short')
    .max(50, 'Name is too long'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup
    .string()
    .required('Phone is required')
    .min(10, 'Phone number is too short')
    .max(10, 'Phone number is too long')
    .matches(/^[0-9]*$/, 'Phone number should contain only numbers'),
  address: yup
    .string()
    .required('Address is required')
    .min(10, 'Address is too short')
    .max(100, 'Address is too long'),
  offer: yup
    .number()
    .min(0, 'Offer should be greater than or equal to 0')
    .max(100, 'Offer should be less than or equal to 100')
    .required(),
  mode: yup.string().required('Mode of Payment is required')
})
const Checkout = ({ open, onClose }: Props) => {
  const cart = useAppSelector((s) => s.product.cart.products)

  const total = cart.reduce(
    (sum, { detail }) =>
      sum + detail.price * cart.filter((e) => e.detail.pid === detail.pid)[0].quantity,
    0
  )

  const [loading, setLoading] = React.useState(false)

  const user = useAppSelector((s) => s.auth.user)
  const dispatch = useAppDispatch()

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      mode: 'COD',
      offer: 0
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      if (total === 0) {
        errorToast('Try Again')
        resetForm()
        onClose()
        return
      }
      if (user) {
        setLoading(true)
        await confirmOrder(user?.uid as string, {
          order_on: new Date().getTime(),
          order_by: user?.uid as string,
          products: cart,
          total_price: calculateDiscountedPrice(total, values.offer),
          total_products: cart.length,
          buyer: {
            ...values
          }
        })
        const data = cart.map((e) => {
          return {
            ...e.detail,
            in_stock: e.detail.in_stock - e.quantity
          }
        }) as ProductData[]
        await Promise.all(data.map((e) => updateProduct(user?.uid as string, e.pid, e, false)))
        dispatch(resetCart())
        onClose()
        debounce(() => {
          setLoading(false)
        })()
      } else {
        setLoading(false)
      }
    }
  })

  const keys = Object.keys(formik.values)

  React.useEffect(() => {
    if (open) {
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          onClose()
        }
      })
    }

    return () => {
      window.removeEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          onClose()
        }
      })
    }
  }, [])

  console.log(formik.errors)

  return (
    <Container
      sx={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        backgroundColor: 'rgb(117, 117, 117)',
        display: 'flex',
        justifyContent: 'center',
        padding: '12px 0px',
        // alignItems: 'center',
        zIndex: 1000,
        opacity: open ? 1 : 0,
        pointerEvents: open ? 'auto' : 'none'
      }}
      onClick={onClose}
    >
      <Modal open={loading} onClose={() => {}}>
        <div></div>
      </Modal>
      <Paper
        onClick={(e) => {
          e.stopPropagation()
        }}
        sx={{
          width: 'calc(100% - 24px)',
          height: '100%',
          maxWidth: '480px',
          backgroundColor: 'white',
          borderRadius: '12px',
          border: '2px solid #00000011',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          top: 0,
          '.header': {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-start',
            padding: '12px 18px',
            gap: '12px',
            borderBottom: '1px solid #00000011',
            backgroundColor: '#f5f5f540',
            position: 'sticky',
            top: 0
          },
          '.content': {
            height: '100%',
            overflowY: 'auto',
            padding: '18px',
            paddingTop: '12px'
          }
        }}
        elevation={0}
        variant={'outlined'}
      >
        <div className="header">
          <CustomIcon name="LUCIDE_ICONS" icon="LuArrowLeft" color={'black'} onClick={onClose} />
          <CustomTypography variant={'h6'} fontWeight={'bold'}>
            Checkout
          </CustomTypography>
        </div>
        <div className="content scrollbar">
          {keys.map((k) =>
            k === 'mode' ? (
              <FormControl
                key={k}
                sx={{
                  width: '100%',
                  marginBottom: '8px'
                }}
              >
                <FormLabel
                  children={
                    <CustomTypography>{k.charAt(0).toUpperCase() + k.slice(1)}</CustomTypography>
                  }
                />
                <Select
                  id={k}
                  value={formik.values[k]}
                  onChange={(e) => formik.setFieldValue(k, e.target.value)}
                  sx={{
                    width: '100%',
                    border: '1px solid #00000011',
                    borderRadius: '8px',
                    backgroundColor: '#f5f5f5',
                    outline: 'none'
                  }}
                >
                  <MenuItem value="COD">Cash on Delivery</MenuItem>
                  <MenuItem value="UPI">UPI</MenuItem>
                  <MenuItem value="CARD">Card</MenuItem>
                </Select>
              </FormControl>
            ) : (
              <CustomTextInput
                input={{
                  sx: {
                    marginBottom: '8px'
                  },
                  value: formik.values[k],
                  id: k,
                  onChange: (e) => formik.setFieldValue(k, e.target.value),
                  error: formik.touched[k] && Boolean(formik.errors[k]),
                  helperText: formik.touched[k] && formik.errors[k],
                  label: (
                    <CustomTypography marginBottom={'0px'} color={'inherit'}>
                      {k.charAt(0).toUpperCase() + k.slice(1)} {k === 'offer' && '(In percentage)'}
                    </CustomTypography>
                  ),
                  placeholder: k.charAt(0).toUpperCase() + k.slice(1),
                  type: k === 'phone' ? 'tel' : 'text' // phone number
                }}
              />
            )
          )}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'center',
              padding: '12px 0px'
            }}
          >
            <CustomTypography variant={'body2'} paddingBottom={'12px'}>
              Total Amount : ₹{calculateDiscountedPrice(total, formik.values.offer).toFixed(2)}
            </CustomTypography>
          </div>
        </div>
        <div
          style={{
            padding: '12px',
            borderTop: '1px solid #00000011'
          }}
        >
          <Button
            onClick={() => formik.submitForm()}
            variant={'contained'}
            color={'primary'}
            sx={{ width: '100%' }}
          >
            <CustomTypography color={'white'} variant={'body2'} textTransform={'none'}>
              Complete Payment : ₹{calculateDiscountedPrice(total, formik.values.offer).toFixed(2)}
            </CustomTypography>
          </Button>
        </div>
      </Paper>
    </Container>
  )
}

export default Checkout

const Container = styled('div')({
  width: '100%',
  transition: 'all .3s',
  zIndex: 10000
})
