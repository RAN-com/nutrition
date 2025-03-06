import { Button, Dialog, FormControlLabel, Modal, styled, Switch } from '@mui/material'
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
// import NotFound from "../../assets/image-not-found.jpg";

type Props = {
  edit: ProductData | null
  open: boolean
  onClose(): void
}

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .required('Product name is required')
    .max(100, 'Name must not exceed 100 characters'),
  price: Yup.number().required('Price is required').min(1, 'Price must be at least ₹1'),
  in_stock: Yup.number()
    .required('Stock quantity is required')
    .min(1, 'Stock quantity must be at least ₹1'),
  is_available: Yup.boolean().required('Availability status is required')
  // thumbnail: Yup.mixed().required('Thumbnail must be a valid URL'),
  // product_images: Yup.array().min(1, 'At least one product image is required')
})

const CreateProduct = ({ edit, open, onClose }: Props) => {
  const [loading, setLoading] = React.useState(false)
  const user = useAppSelector((s) => s.auth.user)
  const dispatch = useAppDispatch()

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: edit?.name ?? '',
      price: edit?.price ?? 0,
      in_stock: edit?.in_stock ?? 0,
      // thumbnail: (edit?.thumbnail || null) ?? (null as (File | string) | null),
      // product_images: edit?.product_images ?? ([] as { url: string | File; comment: string }[]),
      is_available: edit?.is_available ?? true
    },
    validationSchema,
    onSubmit: async (values) => {
      if (!user) return
      setLoading(true)
      // let thumbnail = ''
      // let product_images = [] as { url: string | File; comment: string }[]
      // if (values.thumbnail) {
      //   if (typeof values.thumbnail !== 'string') {
      //     const upload = await uploadFiles(
      //       user?.uid,
      //       [values.thumbnail],
      //       [user?.uid, 'product_thumbnail']
      //     )

      //     if (upload?.[0]?.Location) {
      //       thumbnail = upload?.[0]?.Location
      //       formik.setFieldValue('thumbnail', upload?.[0]?.Location)
      //     }
      //   }
      // }
      // if (values.product_images.length >= 1) {
      //   const files = values.product_images
      //   if (files.length !== 0) {
      //     const upload = await Promise.all(
      //       files.map((e) =>
      //         typeof e.url !== 'string'
      //           ? uploadFiles(user?.uid, [e.url], [user?.uid, 'product_images'])
      //           : null
      //       )
      //     )

      //     if (upload.length === files.length) {
      //       successToast('Product Images uploaded successfully')
      //     } else {
      //       errorToast('Some images of product images was not uploaded')
      //     }

      //     product_images = upload.map((e, idx) => {
      //       if (e === null) {
      //         return files[idx] as { url: string; comment: string }
      //       } else {
      //         return {
      //           url: e[0].Location,
      //           comment: (files[idx].comment as string) ?? ''
      //         }
      //       }
      //     })

      //     formik.setFieldValue('product_images', product_images)
      //   }
      // }

      try {
        if (!edit) {
          const upload = await addProduct(user?.uid, {
            in_stock: values.in_stock ?? null,
            is_available: values.is_available,
            name: values.name ?? null,
            price: values.price ?? null,
            // product_images: product_images as { url: string; comment: string }[],
            // thumbnail: thumbnail as string,
            added_on: new Date().getTime() ?? null,
            added_by: user?.uid ?? null
          })
          console.log(upload)
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
            // product_images: product_images as { url: string; comment: string }[],
            // thumbnail: thumbnail as string,
            added_on: new Date().getTime() ?? null,
            added_by: user?.uid ?? null,
            updated_on: new Date().getTime()
          })
          console.log(update)
          setLoading(false)
          dispatch(asyncGetProducts({ uid: user?.uid }))
          formik.resetForm()
          onClose()
        }
      } catch (err) {
        console.log(err)
        setLoading(false)
        formik.resetForm()
      }
    }
  })

  const keys = Object.keys(formik.values)

  // const handleMedia = (evt: React.ChangeEvent<HTMLInputElement>, key) => {
  //   const files = evt.target.files
  //   if (files) {
  //     const len = files.length
  //     const arr = [] as { url: File; comment: string }[]
  //     if (key === 'thumbnail') {
  //       formik.setFieldValue(key, files[0])
  //     } else {
  //       for (let i = 0; i < len; i++) {
  //         arr.push({ url: files[i], comment: '' })
  //       }
  //       formik.setFieldValue('product_images', [...formik?.values?.product_images, ...arr])
  //     }
  //   } else {
  //     errorToast('File cannot be uploaded')
  //   }
  // }

  // const Upload = ({ id, error }: { id: string; error: boolean }) => {
  //   return (
  //     <UploadContainer
  //       sx={{
  //         borderColor: error ? red['500'] : '#b7b7f5'
  //       }}
  //     >
  //       <input
  //         type={'file'}
  //         multiple={id === 'product_images'}
  //         accept="image/*"
  //         name={id}
  //         onChange={(e) => handleMedia(e, id)}
  //       />
  //       <CustomIcon
  //         name={'MATERIAL_DESIGN'}
  //         icon={'MdFileUpload'}
  //         color={grey['600']}
  //         stopPropagation={false}
  //       />
  //       <CustomTypography fontSize={'12px'}>
  //         Click to upload {capitalizeSentence(id)}
  //       </CustomTypography>
  //     </UploadContainer>
  //   )
  // }

  // const handleDelete = ({
  //   idx,
  //   type
  // }: { type: 'thumbnail'; idx?: number } | { type: 'product'; idx: number }) => {
  //   if (type === 'thumbnail') {
  //     formik.setFieldValue('thumbnail', null)
  //   } else if (type === 'product') {
  //     const values = formik.values.product_images
  //     formik.setFieldValue(
  //       'product_images',
  //       values.filter((_, i) => i !== idx)
  //     )
  //   }
  // }

  React.useEffect(() => {
    if (edit) {
      formik.setValues({
        name: edit?.name ?? '',
        price: edit?.price ?? 0,
        in_stock: edit?.in_stock ?? 0,
        // thumbnail: (edit?.thumbnail || null) ?? (null as (File | string) | null),
        // product_images: edit?.product_images ?? ([] as { url: string | File; comment: string }[]),
        is_available: edit?.is_available ?? true
      })
    } else {
      formik.resetForm()
    }
  }, [])

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
            if (key !== 'product_images' && key !== 'thumbnail' && key !== 'is_available') {
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
            } else if (key.includes('is_available')) {
              return (
                <>
                  <FormControlLabel
                    control={
                      <Switch
                        value={formik.values.is_available}
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
                  {/* <CustomTypography color={grey['500']}>
                    {capitalizeSentence(key.toString())}*
                  </CustomTypography>
                  {key === 'thumbnail' ? (
                    formik.values.thumbnail === null ? (
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
                    )
                  ) : key === 'product_images' ? (
                    <>
                      {formik.values.product_images.map((prod, idx) => (
                        <>
                          <ImageContainer>
                            <img
                              src={
                                typeof prod?.url === 'string'
                                  ? prod?.url
                                  : URL.createObjectURL(prod?.['url'])
                              }
                              alt={'property image'}
                            />
                            <CustomIcon
                              name="IONICONS5"
                              color={red['100']}
                              onTouchStart={() => handleDelete({ type: 'product', idx })}
                              onClick={() => handleDelete({ type: 'product', idx })}
                              icon="IoTrash"
                              className="delete-ct"
                              size={18}
                              sx={{
                                borderRadius: '12px',
                                padding: '8px',
                                backgroundColor: red['600']
                              }}
                            />
                          </ImageContainer>
                          {typeof prod?.['comment'] === 'string' ? (
                            <CustomTextInput
                              input={{
                                value: formik.values.product_images[idx]?.comment,
                                placeholder: 'Enter product description',
                                onChange: (evt) => {
                                  const value = formik.values.product_images
                                  formik.setFieldValue(
                                    'product_images',
                                    value.map((e, k) => {
                                      if (idx === k) {
                                        return {
                                          url: e?.['url'],
                                          comment: evt.target.value
                                        }
                                      } else {
                                        return e
                                      }
                                    })
                                  )
                                }
                              }}
                              formProps={{ sx: { marginBottom: '12px' } }}
                            />
                          ) : (
                            <CustomTypography
                              onClick={() => {
                                const value = formik.values.product_images
                                formik.setFieldValue(
                                  'product_images',
                                  value.map((e, k) => {
                                    if (idx === k) {
                                      return {
                                        url: e?.['url'],
                                        comment: ''
                                      }
                                    } else {
                                      return e
                                    }
                                  })
                                )
                              }}
                              sx={{ marginBottom: '12px', cursor: 'pointer', zIndex: 10000 }}
                              color={'primary'}
                              fontWeight={'bold'}
                            >
                              <CustomIcon
                                stopPropagation={false}
                                name={'LUCIDE_ICONS'}
                                icon="LuPlus"
                                color={theme.palette.primary.main}
                              />
                              Add Comment
                            </CustomTypography>
                          )}
                        </>
                      ))}
                      <Upload
                        id={key}
                        error={
                          !!(
                            formik.touched[key as keyof typeof formik.errors] &&
                            formik.errors[key as keyof typeof formik.errors]
                          )
                        }
                      />
                    </>
                  ) : (
                    ''
                  )} */}
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

// const UploadContainer = styled('div')({
//   width: '100',
//   aspectRatio: '16 / 9',
//   backgroundColor: 'white',
//   display: 'flex',
//   flexDirection: 'column',
//   alignItems: 'center',
//   justifyContent: 'center',
//   marginBottom: '12px',
//   borderRadius: '12px',
//   border: '2px dashed #b7b7f5',
//   cursor: 'pointer',
//   position: 'relative',
//   top: 0,
//   '&:hover': {
//     borderStyle: 'solid'
//   },
//   '& input': {
//     width: '100%',
//     height: '100%',
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     opacity: 0,
//     cursor: 'pointer',
//     zIndex: 100
//   }
// })

// const ImageContainer = styled('div')({
//   width: '100%',
//   aspectRatio: '16 / 9',
//   overflow: 'hidden',
//   position: 'relative',
//   top: 0,
//   borderRadius: '12px',
//   margin: '12px 0px',
//   border: '2px dashed #b7b7f5',
//   backgroundColor: '#636363',
//   '& .delete-ct': {
//     position: 'absolute',
//     top: '12px',
//     right: '12px',
//     zIndex: 10
//   },
//   '& img': {
//     width: '100%',
//     height: '100%',
//     objectFit: 'contain'
//   },
//   '&:hover': {
//     borderStyle: 'solid'
//   }
// })
