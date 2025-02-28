import { styled } from '@mui/material'
import { grey, red } from '@mui/material/colors'
import CustomIcon from '@renderer/components/icons'
import CustomTypography from '@renderer/components/typography'
import { setCardDetails } from '@renderer/redux/features/user/card'
import { useAppSelector, useAppDispatch } from '@renderer/redux/store/hook'
import { useFormik } from 'formik'
import * as yup from 'yup'

const validationSchema = yup.object({
  image: yup
    .array()
    .min(1, 'Upload At-least one picture to continue')
    .max(100, 'You have reached the limit. Try to contact the administrator')
    .required()
})

const PhotoGallery = () => {
  const images = useAppSelector((s) => s.card.editor?.data?.['photo_gallery'] ?? [])
  const dispatch = useAppDispatch()
  const formik = useFormik({
    enableReinitialize: images.length >= 0,
    initialValues: {
      image: [...images] as {
        url: File | string
        description?: string
      }[]
    },
    validationSchema,
    onSubmit(values, { resetForm }) {
      dispatch(
        setCardDetails({
          id: 'photo_gallery',
          value: [...images, ...values.image]
        })
      )
      formik.setFieldValue('image', [])
      resetForm()
    }
  })

  console.log(formik.values)
  const handleRemoveVideo = (index: number) => {
    const updatedImages = formik.values.image.filter((_, i) => i !== index)
    formik.setFieldValue('image', updatedImages)
    dispatch(
      setCardDetails({
        id: 'photo_gallery',
        value: updatedImages
      })
    )
  }

  return (
    <Container>
      <CustomTypography
        paddingBottom={'12px'}
        variant={'h4'}
        width={'100%'}
        marginBottom={'12px'}
        borderBottom={`1px solid ${grey['300']}`}
        sx={{
          backgroundColor: 'white',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          paddingTop: '12px'
        }}
      >
        Photo Gallery
      </CustomTypography>
      <div
        style={{
          width: '100%',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backgroundColor: 'white',
          paddingTop: '12px',
          paddingBottom: '12px'
        }}
      >
        <UploadImage>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const files = e.target.files
              if (!files) {
                return
              }

              const newImages = Array.from(files).map((file) => ({
                url: file,
                description: ''
              }))

              formik.setFieldValue('image', [...formik.values.image, ...newImages])
              dispatch(
                setCardDetails({
                  id: 'photo_gallery',
                  value: [...images, ...newImages]
                })
              )
              // formik.submitForm()
            }}
            multiple={true}
          />
          <CustomTypography>Click to upload the pictures</CustomTypography>
        </UploadImage>
      </div>
      {formik.values.image.map((e, k) => (
        <ImageContainer key={k}>
          <CustomIcon
            name={'LUCIDE_ICONS'}
            icon={'LuTrash'}
            color={'white'}
            className="icon"
            onClick={() => {
              handleRemoveVideo(k)
            }}
            sx={{
              padding: '8px',
              backgroundColor: red['500'],
              borderRadius: '12px'
            }}
          />
          <img
            src={typeof e.url === 'string' ? e.url : URL.createObjectURL(e.url)}
            alt={e.description}
          />
        </ImageContainer>
      ))}
    </Container>
  )
}

export default PhotoGallery

const Container = styled('div')({
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  padding: '0 24px',
  overflowY: 'auto',
  paddingBottom: '12px',
  position: 'relative',
  top: 0
})

const UploadImage = styled('div')({
  width: '100%',
  height: 'max-content',
  display: 'flex',
  flexDirection: 'column',
  padding: '32px 42px',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  aspectRatio: '16 / 2',
  top: 0,
  border: '1px dashed',
  borderRadius: '12px',
  input: {
    cursor: 'pointer',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0,
    zIndex: 100
  }
})

const ImageContainer = styled('div')({
  width: '100%',
  position: 'relative',
  top: 0,
  '.icon': {
    position: 'absolute',
    right: '12px',
    top: '12px',
    zIndex: 10
  },
  backgroundColor: '#a8a8a8',
  margin: '12px 0px',
  img: {
    width: '100%',
    height: '100%',
    objectFit: 'contain'
  }
})
