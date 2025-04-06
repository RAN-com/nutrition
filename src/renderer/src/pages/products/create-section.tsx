import {
  Button,
  Dialog,
  FormControlLabel,
  MenuItem,
  Modal,
  Select,
  styled,
  Switch
} from '@mui/material'
import CustomTextInput from '@renderer/components/text-input'
import CustomTypography from '@renderer/components/typography'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import React from 'react'
import CustomIcon from '@renderer/components/icons'
import { useAppSelector, useAppDispatch } from '@renderer/redux/store/hook'
import { addProduct, lastDoc, updateProduct } from '@renderer/firebase/product'
import { asyncGetProducts, setProductEdit } from '@renderer/redux/features/user/products'
import { ProductData } from '@renderer/types/product'
import { uploadFiles } from '@renderer/lib/upload-img'
import { errorToast } from '@renderer/utils/toast'
import { grey, red } from '@mui/material/colors'
import { capitalizeSentence } from '@renderer/utils/functions'
// import NotFound from "../../assets/image-not-found.jpg";

type Props = {
  edit: ProductData | null
  open: boolean
  onClose(): void
}

const productType = [
  { id: 'OUT_PURCHASE', value: 'Out Purchase' },
  { id: 'CENTER_USAGE', value: 'Center Usage' }
]

const flavours = [
  { id: 'vanilla', value: 'Vanilla' },
  { id: 'kulfi', value: 'Kulfi' },
  { id: 'strawberry', value: 'Strawberry' },
  { id: 'mango', value: 'Mango' },
  { id: 'french_vanilla', value: 'French Vanilla' },
  { id: 'dutch_chocolate', value: 'Dutch Chocolate' },
  { id: 'orange_cream', value: 'Orange Cream' },
  { id: 'banana_caramel', value: 'Banana Caramel' }
]

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .required('Product name is required')
    .max(100, 'Name must not exceed 100 characters'),
  price: Yup.number().required('Price is required').min(1, 'Price must be at least ₹1'),
  in_stock: Yup.number()
    .required('Stock quantity is required')
    .min(1, 'Stock quantity must be at least ₹1'),
  is_available: Yup.boolean().required('Availability status is required'),
  thumbnail: Yup.mixed().required('Thumbnail must be a valid URL'),
  product_type: Yup.string().required('Product Type is required'),
  flavour: Yup.string().when('name', (name: any, schema) => {
    return name && name.includes('Formula 1')
      ? schema.required('Flavour is required for Formula 1 products')
      : schema.optional()
  })
})

const CreateProduct = ({ edit, open, onClose }: Props) => {
  const [loading, setLoading] = React.useState(false)
  const user = useAppSelector((s) => s.auth.user)
  const dispatch = useAppDispatch()

  const formik = useFormik({
    enableReinitialize: !!edit,
    initialValues: {
      name: edit?.name ?? '',
      flavour: edit?.flavour,
      price: edit?.price ?? 0,
      in_stock: edit?.in_stock ?? 0,
      thumbnail: (edit?.thumbnail || null) ?? (null as (File | string) | null),
      // product_images: edit?.product_images ?? ([] as { url: string | File; comment: string }[]),
      is_available: edit?.is_available ?? true,
      product_type: edit?.type ?? 'OUT_PURCHASE'
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      if (!user) return
      setLoading(true)
      let thumbnail = ''
      // let product_images = [] as { url: string | File; comment: string }[]
      if (values.thumbnail) {
        if (typeof values.thumbnail !== 'string') {
          const upload = await uploadFiles(
            user?.uid,
            [values.thumbnail],
            [user?.uid, 'product_thumbnail']
          )

          if (upload?.[0]?.Location) {
            thumbnail = upload?.[0]?.Location
            formik.setFieldValue('thumbnail', upload?.[0]?.Location)
          }
        } else {
          thumbnail = values.thumbnail
        }
      }

      try {
        if (!edit) {
          await addProduct(user?.uid, {
            in_stock: values.in_stock ?? null,
            is_available: values.is_available,
            name: values.name ?? null,
            price: values.price ?? null,
            flavour: values.flavour,
            // product_images: product_images as { url: string; comment: string }[],
            thumbnail: thumbnail as string,
            added_on: new Date().getTime() ?? null,
            added_by: user?.uid ?? null,
            type: values.product_type
          })

          setLoading(false)
          dispatch(asyncGetProducts({ uid: user?.uid }))
          formik.resetForm()
          onClose()
        } else {
          const update = await updateProduct(user?.uid, edit?.pid, {
            ...edit,
            in_stock: values.in_stock ?? null,
            is_available: values.is_available,
            name: values.name ?? null,
            price: values.price ?? null,
            flavour: values.flavour,
            // product_images: product_images as { url: string; comment: string }[],
            thumbnail: thumbnail as string,
            added_on: new Date().getTime() ?? null,
            added_by: user?.uid ?? null,
            updated_on: new Date().getTime()
          })
          console.log(update)
          setLoading(false)
          dispatch(asyncGetProducts({ uid: user?.uid }))
          resetForm()
          onClose()
        }
      } catch (err) {
        console.log(err)
        setLoading(false)
        resetForm()
      }
    }
  })

  const keys = Object.keys(formik.values)

  const handleMedia = (evt: React.ChangeEvent<HTMLInputElement>, key) => {
    const files = evt.target.files
    if (files) {
      if (key === 'thumbnail') {
        formik.setFieldValue(key, files[0])
      }
    } else {
      errorToast('File cannot be uploaded')
    }
  }

  const Upload = ({ id, error }: { id: string; error: boolean }) => {
    return (
      <UploadContainer
        sx={{
          borderColor: error ? red['500'] : '#b7b7f5'
        }}
      >
        <input
          type={'file'}
          multiple={id === 'product_images'}
          accept="image/*"
          name={id}
          onChange={(e) => handleMedia(e, id)}
        />
        <CustomIcon
          name={'MATERIAL_DESIGN'}
          icon={'MdFileUpload'}
          color={grey['600']}
          stopPropagation={false}
        />
        <CustomTypography fontSize={'12px'}>
          Click to upload {capitalizeSentence(id)}
        </CustomTypography>
      </UploadContainer>
    )
  }

  const handleDelete = ({
    type
  }: { type: 'thumbnail'; idx?: number } | { type: 'product'; idx: number }) => {
    if (type === 'thumbnail') {
      formik.setFieldValue('thumbnail', null)
    }
  }

  React.useEffect(() => {
    if (edit) {
      formik.resetForm()
      formik.setValues({
        name: edit?.name || '',
        flavour: edit.flavour,
        price: edit?.price || 0,
        in_stock: edit?.in_stock || 0,
        thumbnail: edit?.thumbnail || null || (null as (File | string) | null),
        // product_images: edit?.product_images || ([] as { url: string | File; comment: string }[]),
        is_available: edit?.is_available || true,
        product_type: edit?.type ?? 'CENTER_USAGE'
      })
    } else {
      formik.resetForm()
    }
  }, [])

  const showFlavors = (formik.values.name ?? '').includes('Formula 1')

  return (
    <>
      <Modal open={loading} onClose={() => {}}>
        <div></div>
      </Modal>
      <Container
        open={open}
        onClose={() => {
          dispatch(setProductEdit(undefined))
          formik.resetForm()
          onClose()
        }}
        className="scrollbar"
        slotProps={{
          paper: {
            className: 'scrollbar'
          }
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            backgroundColor: '#adadad4b',
            backdropFilter: 'blur(10px)',
            zIndex: 1000,
            padding: '18px',
            paddingBottom: '8px'
          }}
        >
          <CustomTypography
            variant={'h4'}
            marginBottom={'12px'}
            onClick={async () => console.log(await lastDoc(user?.uid as string))}
          >
            Add Product
          </CustomTypography>
          <CustomIcon name={'LUCIDE_ICONS'} icon="LuX" color={'grey'} onClick={onClose} />
        </div>
        <form onSubmit={formik.handleSubmit}>
          {keys.map((key) => {
            if (key.includes('product_type')) {
              return (
                <>
                  <CustomTypography>{key?.toString() + '*'}</CustomTypography>
                  <Select
                    sx={{ width: '100%' }}
                    size="small"
                    value={formik.values.product_type ?? ''}
                    onChange={(e) => formik.setFieldValue('product_type', e.target.value)}
                    error={Boolean(
                      formik.touched[key as keyof typeof formik.errors] &&
                        formik.errors[key as keyof typeof formik.errors]
                    )}
                  >
                    {productType.map((fl) => (
                      <MenuItem value={fl.id}>{fl.value}</MenuItem>
                    ))}
                  </Select>
                </>
              )
            } else if (
              key !== 'product_images' &&
              key !== 'thumbnail' &&
              key !== 'is_available' &&
              key !== 'flavour'
            ) {
              return (
                <CustomTextInput
                  formProps={{
                    sx: {
                      margin: '12px 0px'
                    }
                  }}
                  input={{
                    name: key,
                    error: Boolean(
                      formik.touched[key as keyof typeof formik.errors] &&
                        formik.errors[key as keyof typeof formik.errors]
                    ),
                    helperText:
                      formik.touched[key as keyof typeof formik.errors] &&
                      formik.errors[key as keyof typeof formik.errors]
                        ? JSON.stringify(formik.errors[key as keyof typeof formik.errors])
                        : undefined,
                    label: <CustomTypography>{key?.toString() + '*'}</CustomTypography>,
                    type: key === 'price' || key === 'in_stock' ? 'number' : 'text',
                    inputMode: key === 'price' || key === 'in_stock' ? 'decimal' : 'text',
                    value: formik.values[key as keyof typeof formik.values],
                    onChange: formik.handleChange
                  }}
                />
              )
            } else if (key.includes('flavour')) {
              return (
                showFlavors && (
                  <>
                    <CustomTypography>{key?.toString() + '*'}</CustomTypography>
                    <Select
                      sx={{ width: '100%' }}
                      size="small"
                      value={formik.values.flavour ?? ''}
                      onChange={(e) => formik.setFieldValue('flavour', e.target.value)}
                      error={Boolean(
                        formik.touched[key as keyof typeof formik.errors] &&
                          formik.errors[key as keyof typeof formik.errors]
                      )}
                    >
                      {flavours.map((fl) => (
                        <MenuItem value={fl.id}>{fl.value}</MenuItem>
                      ))}
                    </Select>
                  </>
                )
              )
            } else if (key.includes('is_available')) {
              return (
                <>
                  <FormControlLabel
                    checked={formik.values.is_available}
                    control={
                      <Switch
                        checked={formik.values.is_available}
                        onChange={(e) => formik.setFieldValue('is_available', e.target.checked)}
                      />
                    }
                    label={`Product ${formik.values.is_available ? 'Available' : 'Not Available'}`}
                  />
                </>
              )
            } else {
              return (
                <div>
                  <CustomTypography color={grey['500']}>
                    {capitalizeSentence(key.toString())}*
                  </CustomTypography>
                  {key === 'thumbnail' &&
                    (formik.values.thumbnail === null ? (
                      <Upload
                        id={key}
                        error={
                          !!(
                            formik.touched[key as keyof typeof formik.errors] &&
                            formik.errors[key as keyof typeof formik.errors]
                          )
                        }
                      />
                    ) : (
                      <ImageContainer>
                        <img
                          src={
                            formik.values.thumbnail
                              ? typeof formik.values.thumbnail === 'string'
                                ? formik.values.thumbnail
                                : URL.createObjectURL(formik.values.thumbnail)
                              : undefined
                          }
                          alt={'thumbnail'}
                        />
                        <CustomIcon
                          name="IONICONS5"
                          onTouchStart={() => handleDelete({ type: 'thumbnail', idx: undefined })}
                          onClick={() => handleDelete({ type: 'thumbnail', idx: undefined })}
                          color={red['100']}
                          icon="IoTrash"
                          className="delete-ct"
                          size={18}
                          sx={{ borderRadius: '12px', padding: '8px', backgroundColor: red['600'] }}
                        />
                      </ImageContainer>
                    ))}
                </div>
              )
            }
          })}
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', marginTop: '12px' }}>
            <Button variant={'contained'} onClick={formik.submitForm}>
              {edit ? 'Update' : 'Add Product'}
            </Button>
            <Button
              disabled={!formik.dirty}
              onClick={() => {
                if (edit) {
                  dispatch(setProductEdit(undefined))
                }
                formik.resetForm()
              }}
            >
              Reset
            </Button>
          </div>
        </form>
      </Container>
    </>
  )
}

export default CreateProduct

const Container = styled(Dialog)({
  '.MuiPaper-root': {
    width: '100%',
    height: 'max-content',
    maxWidth: '420px',
    paddingTop: '0px',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#F6F6F7',
    overflowY: 'auto',
    gridColumn: 2,
    form: {
      padding: '18px',
      paddingTop: '0px'
    }
  }
})

const UploadContainer = styled('div')({
  width: '100',
  aspectRatio: '16 / 9',
  backgroundColor: 'white',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '12px',
  borderRadius: '12px',
  border: '2px dashed #b7b7f5',
  cursor: 'pointer',
  position: 'relative',
  top: 0,
  '&:hover': {
    borderStyle: 'solid'
  },
  '& input': {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    opacity: 0,
    cursor: 'pointer',
    zIndex: 100
  }
})

const ImageContainer = styled('div')({
  width: '100%',
  aspectRatio: '16 / 9',
  overflow: 'hidden',
  position: 'relative',
  top: 0,
  borderRadius: '12px',
  margin: '12px 0px',
  border: '2px dashed #b7b7f5',
  backgroundColor: '#636363',
  '& .delete-ct': {
    position: 'absolute',
    top: '12px',
    right: '12px',
    zIndex: 10
  },
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'contain'
  },
  '&:hover': {
    borderStyle: 'solid'
  }
})
