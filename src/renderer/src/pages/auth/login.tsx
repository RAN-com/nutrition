import { Modal, Paper, styled } from '@mui/material'
import Logo from '@renderer/assets/logo.png'
import * as yup from 'yup'
import { useFormik } from 'formik'
import { useAppDispatch, useAppSelector } from '@renderer/redux/store/hook'
import { asyncUserLogin } from '@renderer/redux/features/user/auth'
import CustomTextInput from '@renderer/components/text-input'
import CustomIcon from '@renderer/components/icons'
import { blue, grey } from '@mui/material/colors'
import React from 'react'

import BGImg from '@renderer/assets/login-bg.png'
import CustomTypography from '@renderer/components/typography'
import { Link, useNavigate } from 'react-router-dom'

const validationSchema = yup.object({
  email: yup.string().email('Invalid email address').required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required')
})

const AuthLogin = () => {
  const { user, login_loading } = useAppSelector((s) => s.auth)
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const formik = useFormik({
    initialValues: {
      email: '',
      password: ''
    },
    validationSchema,
    onSubmit: (values) => {
      dispatch(asyncUserLogin({ email: values.email, password: values.password }))
    }
  })

  const [showPassword, setShowPassword] = React.useState(false)

  React.useEffect(() => {
    if (user) {
      navigate('/home', { replace: true })
    }
  }, [user])

  return (
    <Container>
      <Modal open={login_loading} onClose={() => {}}>
        <div></div>
      </Modal>
      <Paper elevation={2}>
        <LogoContainer>
          <img src={Logo} />
        </LogoContainer>
        <CustomTypography variant="h4" fontFamily={'Syne'} marginTop={'8px'} fontWeight={'normal'}>
          Login
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
                marginBottom: '18px',
                input: {
                  color: '#fefefeaa'
                }
              }
            }}
          />
          <CustomTextInput
            input={{
              slotProps: {
                htmlInput: {
                  type: !showPassword ? 'password' : 'text'
                },
                input: {
                  endAdornment: (
                    <CustomIcon
                      name={'LUCIDE_ICONS'}
                      icon={showPassword ? 'LuEyeOff' : 'LuEye'}
                      size={24}
                      color={grey['100']}
                      onClick={() => setShowPassword((prev) => !prev)}
                    />
                  )
                }
              },
              placeholder: 'Enter your password',
              type: !showPassword ? 'password' : 'text',
              name: 'password',
              value: formik.values.password,
              onChange: formik.handleChange,
              onBlur: formik.handleBlur,
              error: Boolean(formik.touched.password && formik.errors.password),
              helperText: formik.touched.password && formik.errors.password,
              sx: {
                marginBottom: '18px',
                input: {
                  color: '#fefefeaa'
                }
              }
            }}
          />
          <SubmitButton type="submit">Sign in</SubmitButton>
        </form>
        <CustomTypography
          color="#fefefeaa"
          variant={'body2'}
          marginTop={'12px'}
          gap={'2px'}
          sx={{
            a: {
              textDecoration: 'none',
              color: blue['800'],
              cursor: 'pointer'
            }
          }}
        >
          Don't have an account ? <Link to={'/auth/create'}>Signup</Link>
        </CustomTypography>
      </Paper>
    </Container>
  )
}

export default AuthLogin

const Container = styled('div')(({ theme }) => ({
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundImage: `url(${BGImg})`,
  backgroundPosition: 'start',
  backgroundSize: 'cover',
  position: 'relative',
  top: 0,
  '&::after': {
    content: '""',
    width: '100%',
    height: '100%',
    backgroundColor: '#0000001a',
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
    overflowY: 'auto',
    maxHeight: 'calc(100% - 24px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#fefefe1a',
    backdropFilter: 'blur(10px)',
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
