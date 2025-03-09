import { Paper, styled } from '@mui/material'
import Logo from '@renderer/assets/logo.png'
import * as yup from 'yup'
import { useFormik } from 'formik'
import CustomTextInput from '@renderer/components/text-input'

import BGImg from '@renderer/assets/login-bg.png'
import CustomTypography from '@renderer/components/typography'
import { sendResetLink } from '@renderer/firebase'
import { successToast } from '@renderer/utils/toast'

const validationSchema = yup.object({
  email: yup.string().email('Invalid email address').required('Email is required')
})

const AuthReset = () => {
  const formik = useFormik({
    initialValues: {
      email: ''
    },
    validationSchema,
    onSubmit: (values) => {
      successToast(`Password reset link sent to ${values.email}`)
      sendResetLink({ email: values.email })
    }
  })

  return (
    <Container>
      <Paper elevation={2}>
        <LogoContainer>
          <img src={Logo} alt={'LOGO'} />
        </LogoContainer>
        <CustomTypography variant={'h5'} fontWeight={'normal'}>
          Reset your Password
        </CustomTypography>
        <form onSubmit={formik.handleSubmit}>
          <CustomTextInput
            input={{
              placeholder: 'Enter your email',
              name: 'email',
              value: formik.values.email,
              onChange: formik.handleChange,
              onBlur: formik.handleBlur,
              error: Boolean(formik.touched.email && formik.errors.email),
              helperText: formik.touched.email && formik.errors.email,
              sx: {
                marginBottom: '18px'
              }
            }}
          />
          <SubmitButton type="submit">Reset</SubmitButton>
        </form>
      </Paper>
    </Container>
  )
}

export default AuthReset

const Container = styled('div')(({ theme }) => ({
  width: '100%',
  height: `calc(${window.screen.availHeight}px - 164px)`,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundImage: `url(${BGImg})`,
  backgroundPosition: 'start',
  backgroundSize: 'contain',
  position: 'relative',
  top: 0,
  '&::after': {
    content: '""',
    width: '100%',
    height: '100%',
    backgroundColor: '#00bd48c6',
    position: 'absolute',
    top: 0,
    left: 0
  },
  '& .MuiPaper-root': {
    width: 'calc(100% - 24px)',
    zIndex: 100,
    maxWidth: '420px',
    padding: '24px 32px',
    height: 'max-content',
    maxHeight: 'calc(100% - 24px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e9faeffd',
    '& form': {
      width: '100%',
      padding: '24px 0px 8px 0px'
    },
    [theme.breakpoints.down('sm')]: {
      padding: '16px 24px'
    }
  }
}))

const LogoContainer = styled('div')({
  width: 'max-content',
  height: '40px',
  maxHeight: '40px',
  margin: 'auto',
  '& img': {
    margin: 'auto',
    maxWidth: 'max-content',
    height: '40px',
    maxHeight: '40px',
    objectFit: 'contain'
  }
})

const SubmitButton = styled('button')({
  width: '100%',
  height: '40px',
  border: 'none',
  borderRadius: '8px',
  backgroundColor: '#007BFF',
  color: '#fff',
  fontSize: '16px',
  cursor: 'pointer',
  transition: 'background-color 0.3s ease',
  '&:hover': {
    backgroundColor: '#0056b3'
  }
})
