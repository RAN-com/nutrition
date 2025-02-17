import { Button, styled } from '@mui/material'
import { grey, red } from '@mui/material/colors'
import ServiceCard from '@renderer/components/card/services'
import CustomIcon from '@renderer/components/icons'
import CustomTextInput from '@renderer/components/text-input'
import CustomTypography from '@renderer/components/typography'
import { setCardDetails } from '@renderer/redux/features/user/card'
import { useAppSelector, useAppDispatch } from '@renderer/redux/store/hook'
import { useFormik } from 'formik'
import * as yup from 'yup'

const validationSchema = yup.object({
  title: yup.string().required('Title is required').min(5, 'Enter a valid title'),
  description: yup.string().optional(),
  subtitle: yup.string().optional()
})

const ServiceTemplate = () => {
  const services = useAppSelector((s) => s?.card?.editor?.data?.['services'])
  const dispatch = useAppDispatch()

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      image: undefined as File | string | undefined,
      subtitle: ''
    },
    validationSchema,
    onSubmit: (values, { resetForm }) => {
      dispatch(
        setCardDetails({
          id: 'services',
          value: [
            ...(services ?? []),
            {
              photo_url: values.image!,
              description: values.description,
              title: values.title,
              subtitle: values.subtitle
            }
          ]
        })
      )

      resetForm()
    }
  })
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
        Services
      </CustomTypography>
      <div
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          position: 'sticky',
          top: 0,
          paddingBottom: '12px'
        }}
      >
        <CustomTextInput
          input={{
            size: 'small',
            name: 'title',
            placeholder: 'Enter title here',
            label: 'Title of the service',
            value: formik.values.title,
            error: (formik.touched.title && Boolean(formik.errors.title))?.valueOf(),
            helperText: formik.touched.title && formik.errors.title,
            onChange: formik.handleChange
          }}
        />
        <CustomTextInput
          input={{
            size: 'small',
            name: 'subtitle',
            placeholder: 'Enter Sub Title here',
            value: formik.values.subtitle,
            label: 'SubTitle ( Optional )',
            error: (formik.touched.subtitle && Boolean(formik.errors.subtitle))?.valueOf(),
            helperText: formik.touched.subtitle && formik.errors.subtitle,
            onChange: formik.handleChange
          }}
        />
        <CustomTextInput
          input={{
            size: 'small',
            placeholder: 'Enter description here',
            label: 'Description ( Optional )',
            name: 'description',
            onChange: formik.handleChange,
            value: formik.values.description,
            error: (formik.touched.description && Boolean(formik.errors.description))?.valueOf(),
            helperText: formik.touched.description && formik.errors.description
          }}
        />
        {formik.values.image ? (
          <ImageContainer>
            <img
              src={
                typeof formik.values.image === 'string'
                  ? formik.values.image
                  : URL.createObjectURL(formik.values.image)
              }
              alt={formik.values.title}
            />
            <CustomIcon
              name="LUCIDE_ICONS"
              color={red['100']}
              icon={'LuTrash'}
              sx={{
                position: 'absolute',
                right: '12px',
                top: '12px',
                padding: '8px',
                zIndex: 10,
                borderRadius: '12px',
                backgroundColor: red['500']
              }}
              onClick={() => formik.setFieldValue('image', undefined)}
            />
          </ImageContainer>
        ) : (
          <UploadImage>
            <CustomTypography>Upload Service Picture</CustomTypography>
            <CustomTypography fontSize={'12px'}>File size should be less than 5MB</CustomTypography>
            <input
              accept="image/*"
              style={
                formik.errors.image
                  ? {
                      color: 'none'
                    }
                  : {
                      color: 'red'
                    }
              }
              type={'file'}
              onChange={(e) => formik.setFieldValue('image', e.target.files?.[0])}
              multiple={false}
            />
          </UploadImage>
        )}
        <Button
          variant={'contained'}
          onClick={() => {
            formik.submitForm()
          }}
          startIcon={<CustomIcon name={'LUCIDE_ICONS'} icon={'LuPlus'} color="white" />}
        >
          Add Service
        </Button>
      </div>
      {services?.length !== 0 && (
        <div
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            padding: '12px 12px',
            zIndex: 1,
            gap: '12px',
            backgroundColor: 'white'
          }}
        >
          <CustomTypography fontWeight={'bold'}>Added Services</CustomTypography>
          {services?.map((e) => (
            <ServiceCard
              {...e}
              key={e.title}
              onDelete={() => {
                const filter = services.filter((s) => s.title.match(e.title)?.length === 0)
                console.log(filter)
                dispatch(
                  setCardDetails({
                    id: 'services',
                    value: filter
                  })
                )
              }}
            />
          ))}
        </div>
      )}
    </Container>
  )
}

export default ServiceTemplate

const Container = styled('div')({
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  padding: '0 24px',
  overflowY: 'auto',
  paddingBottom: '12px'
})

const ImageContainer = styled('div')({
  width: '100%',
  aspectRatio: '16 / 9',
  overflow: 'hidden',
  backgroundColor: '#d4d4d4',
  borderRadius: '12px',
  position: 'relative',
  top: 0,
  img: {
    width: '100%',
    height: '100%',
    objectFit: 'contain'
  }
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
    opacity: 0
  }
})
