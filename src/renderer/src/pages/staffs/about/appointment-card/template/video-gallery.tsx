import { Button, styled } from '@mui/material'
import { grey, red } from '@mui/material/colors'
import CustomIcon from '@renderer/components/icons'
import CustomTextInput from '@renderer/components/text-input'
import CustomTypography from '@renderer/components/typography'
import { setCardDetails } from '@renderer/redux/features/user/card'
import { useAppSelector, useAppDispatch } from '@renderer/redux/store/hook'
import { useFormik } from 'formik'
import * as yup from 'yup'

const validationSchema = yup.object({
  url: yup.object().required(),
  description: yup.string().optional().notRequired()
})

const VideoGallery = () => {
  const videos = useAppSelector((s) => s.card.editor.data?.['video_gallery'] ?? [])
  const dispatch = useAppDispatch()
  const formik = useFormik({
    initialValues: {
      url: undefined as File | string | undefined,
      description: ''
    },
    validationSchema,
    onSubmit(values, { resetForm }) {
      // if (values?.url) {
      console.log(values)
      dispatch(
        setCardDetails({
          id: 'video_gallery',
          value: [
            ...videos,
            {
              url: values.url as string,
              description: values.description
            }
          ]
        })
      )
      resetForm()
      // }
    }
  })

  const handleRemoveVideo = (index: number) => {
    const updatedVideos = videos.filter((_, i) => i !== index)
    dispatch(
      setCardDetails({
        id: 'video_gallery',
        value: updatedVideos
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
        Video Gallery
      </CustomTypography>
      <div
        style={{
          width: '100%',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backgroundColor: 'white',
          paddingTop: '12px',
          paddingBottom: '12px',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {!formik.values.url ? (
          <UploadImage>
            <input
              type="file"
              accept="video/*"
              multiple={false}
              onChange={(e) => {
                const files = e.target.files
                if (!files) {
                  return
                }

                formik.setFieldValue('url', files[0])
              }}
            />
            <CustomTypography>Click to upload the videos</CustomTypography>
          </UploadImage>
        ) : (
          <>
            <ImageContainer>
              <CustomIcon
                name={'LUCIDE_ICONS'}
                icon={'LuTrash'}
                color={'white'}
                onClick={() => formik.setFieldValue('url', undefined)}
                className="icon"
                sx={{
                  padding: '8px',
                  backgroundColor: red['500'],
                  borderRadius: '12px'
                }}
              />
              <video
                src={
                  typeof formik.values.url === 'string'
                    ? formik.values.url
                    : URL.createObjectURL(formik.values.url)
                }
                controls
              />
            </ImageContainer>
          </>
        )}
        <CustomTextInput
          formProps={{
            sx: {
              margin: '12px 0px'
            }
          }}
          input={{
            size: 'small',
            placeholder: 'Type about the video here',
            label: 'Description',
            onChange: (e) => {
              formik.setFieldValue('description', e.target.value)
            }
          }}
        />
        <Button
          sx={{
            marginBottom: '12px'
          }}
          onClick={() => formik.submitForm()}
        >
          Add Video
        </Button>
      </div>
      {videos.map((e, k) => (
        <>
          <ImageContainer key={k}>
            <CustomIcon
              name={'LUCIDE_ICONS'}
              icon={'LuTrash'}
              color={'white'}
              className="icon"
              onClick={() => handleRemoveVideo(k)}
              sx={{
                padding: '8px',
                backgroundColor: red['500'],
                borderRadius: '12px'
              }}
            />
            <video src={typeof e.url === 'string' ? e.url : URL.createObjectURL(e.url)} controls />
          </ImageContainer>
        </>
      ))}
    </Container>
  )
}

export default VideoGallery

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
  maxHeight: '320px',
  position: 'relative',
  top: 0,
  aspectRatio: '16/9',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '12px',
  overflow: 'hidden',
  '.icon': {
    position: 'absolute',
    right: '12px',
    top: '12px',
    zIndex: 10
  },
  backgroundColor: '#a8a8a8',
  '& video': {
    height: '100%',
    margin: 'auto',
    width: '100%',
    aspectRatio: '16/9',
    objectFit: 'contain'
  }
})
