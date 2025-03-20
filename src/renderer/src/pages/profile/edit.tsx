import { Button, Modal, styled } from '@mui/material'
import CustomIcon from '@renderer/components/icons'
import CustomTextInput from '@renderer/components/text-input'
import CustomTypography from '@renderer/components/typography'
import { deleteFile, uploadFiles } from '@renderer/lib/upload-img'
import { asyncUpdateUser } from '@renderer/redux/features/user/auth'
import { useAppSelector, useAppDispatch } from '@renderer/redux/store/hook'
import { errorToast } from '@renderer/utils/toast'
import { useFormik } from 'formik'
import React from 'react'
import * as yup from 'yup'

// Define validation schema
const validationSchema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email address').required('Email is required'),
  locality: yup.string().required('Locality is required'),
  city: yup.string().required('City is required'),
  phone: yup
    .string()
    .matches(/^[0-9]+$/, 'Phone number must be digits')
    .required('Phone number is required')
    .min(10, 'Phone number must be at least 10 digits')
    .max(10, 'Phone number must be less than 10 digits'),
  center_address: yup.string().required('Center address is required')
})

const EditProfile = () => {
  const { user, updating } = useAppSelector((s) => s.auth)
  const [loading, setLoading] = React.useState(false)

  const dispatch = useAppDispatch()

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      email: user?.email ?? '',
      phone: user?.phone ?? '',
      locality: user?.locality ?? '',
      city: user?.city ?? '',
      name: user?.name ?? '',
      center_address: user?.center_address ?? ''
    },
    validationSchema,
    onSubmit: (values) => {
      dispatch(asyncUpdateUser({ ...user, ...values }))
    }
  })

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true)

    try {
      const files = e.target.files?.[0]
      if (!user?.uid) return errorToast('Login Expired. Try Again')
      if (!files) return errorToast('Select a valid file')
      if (user?.photo_url) {
        await deleteFile(user?.photo_url?.split('.com')[0] ?? '')
      }
      const upload = await uploadFiles(user?.uid, [files], ['profile'])
      if (upload?.[0]) {
        dispatch(asyncUpdateUser({ ...user, photo_url: upload?.[0]?.Location }))
        setLoading(false)
        return null
      }
      setLoading(false)
    } catch (err) {
      console.log(err)
      setLoading(false)

      return null
    }
    setLoading(false)

    return
  }

  return (
    <Container>
      <Modal open={updating || loading}>
        <div></div>
      </Modal>
      <Header>
        <ProfilePicture>
          <img src={user?.photo_url} alt={'Profile'} />
          <div className="edit_cover">
            <div style={{ all: 'inherit', position: 'relative' }}>
              <input title={''} type={'file'} accept={'image/*'} onChange={handleImageChange} />
              <CustomIcon
                name="LUCIDE_ICONS"
                icon="LuPen"
                color={'white'}
                sx={{
                  paddingTop: '12px'
                }}
                stopPropagation={false}
              />
              <CustomTypography color="white">Change Profile Picture</CustomTypography>
            </div>
          </div>
        </ProfilePicture>
        <div className="details">
          <CustomTypography variant="h4">{user?.name}</CustomTypography>
          <CustomTypography variant="body1" fontWeight={'normal'}>
            {user?.center_address}
          </CustomTypography>
        </div>
      </Header>
      <Body onSubmit={formik.handleSubmit}>
        <CustomTextInput
          input={{
            placeholder: 'Enter Name',
            name: 'name',
            label: 'Name',
            value: formik.values.name,
            onChange: formik.handleChange,
            onBlur: formik.handleBlur,
            error: Boolean(formik.touched.name && formik.errors.name),
            helperText: formik.touched.name && formik.errors.name
            // sx: {
            //   marginBottom: '18px',
            //   input: {
            //     color: '#fefefeaa'
            //   }
            // }
          }}
        />
        <CustomTextInput
          input={{
            placeholder: 'Enter Phone Number',
            name: 'phone',
            label: 'Phone',
            value: formik.values.phone,
            onChange: formik.handleChange,
            onBlur: formik.handleBlur,
            disabled: !!user?.phone,
            error: Boolean(formik.touched.phone && formik.errors.phone),
            helperText: formik.touched.phone && formik.errors.phone
            // sx: {
            //   marginBottom: '18px',
            //   input: {
            //     color: '#fefefeaa'
            //   }
            // }
          }}
        />
        <CustomTextInput
          input={{
            placeholder: 'Enter Email',
            name: 'email',
            label: 'Email',
            value: formik.values.email,
            onChange: formik.handleChange,
            disabled: true,
            onBlur: formik.handleBlur,
            error: Boolean(formik.touched.email && formik.errors.email),
            helperText: formik.touched.email && formik.errors.email
            // sx: {
            //   marginBottom: '18px',
            //   input: {
            //     color: '#fefefeaa'
            //   }
            // }
          }}
        />
        <CustomTextInput
          input={{
            placeholder: 'Enter Locality',
            name: 'locality',
            label: 'Locality',
            value: formik.values.locality,
            onChange: formik.handleChange,
            onBlur: formik.handleBlur,
            // disabled: true,
            error: Boolean(formik.touched.locality && formik.errors.locality),
            helperText: formik.touched.locality && formik.errors.locality
            // sx: {
            //   marginBottom: '18px',
            //   input: {
            //     color: '#fefefeaa'
            //   }
            // }
          }}
        />
        <CustomTextInput
          input={{
            placeholder: 'Enter City',
            name: 'city',
            label: 'City',
            value: formik.values.city,
            onChange: formik.handleChange,
            onBlur: formik.handleBlur,
            error: Boolean(formik.touched.city && formik.errors.city),
            helperText: formik.touched.city && formik.errors.city
            // sx: {
            //   marginBottom: '18px',
            //   input: {
            //     color: '#fefefeaa'
            //   }
            // }
          }}
        />
        <CustomTextInput
          input={{
            placeholder: 'Enter center address',
            name: 'center_address',
            label: 'Center Address',
            value: formik.values.center_address,
            onChange: formik.handleChange,
            onBlur: formik.handleBlur,
            error: Boolean(formik.touched.center_address && formik.errors.center_address),
            helperText: formik.touched.center_address && formik.errors.center_address
            // sx: {
            //   marginBottom: '18px',
            //   input: {
            //     color: '#fefefeaa'
            //   }
            // }
          }}
        />
      </Body>
      <Button
        variant={'contained'}
        onClick={() => formik.submitForm()}
        sx={{ maxWidth: 320, marginBottom: 12 }}
        disabled={!(formik.dirty && formik.isValid)}
      >
        Update Details
      </Button>
    </Container>
  )
}

export default EditProfile

const Container = styled('div')({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: 32
})

const Header = styled('div')({
  width: '100%',
  height: 'auto',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'flex-start',
  gap: 32,
  '& .details': {
    flex: 1,
    height: 'max-content',
    display: 'flex',
    flexDirection: 'column'
  }
})

const ProfilePicture = styled('div')({
  height: 'max-content',
  // width: '200px',
  flexGrow: 'auto',
  maxWidth: 200,
  aspectRatio: '1/1',
  borderRadius: '50%',
  overflow: 'hidden',
  position: 'relative',
  top: 0,
  '.edit_cover': {
    width: '100%',
    height: '100%',
    gap: 12,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 0,
    opacity: 0,
    input: {
      width: '100%',
      height: '100%',
      position: 'absolute',
      top: 0,
      left: 0,
      cursor: 'pointer',
      opacity: 0
    },
    '&:hover': {
      backgroundColor: '#000000aa',
      zIndex: 1,
      opacity: 1
    },
    cursor: 'pointer',
    transition: 'all .3s'
  },
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  }
})

const Body = styled('form')({
  width: '100%',
  maxWidth: 'max-content',
  margin: 'auto',
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  flex: 1,
  gap: 24,
  paddingBottom: '32px',
  '.MuiFormControl-root': {
    width: '100%',
    maxWidth: '320px'
  }
})
