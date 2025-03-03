import Logo from '@renderer/assets/logo.png'
import { Backdrop, CircularProgress, styled, Paper } from '@mui/material'
import CustomTextInput from '@renderer/components/text-input'
import CustomTypography from '@renderer/components/typography'
import React from 'react'
import * as yup from 'yup'
import { useFormik } from 'formik'
import { asyncCreateUser } from '@renderer/redux/features/user/auth'
import { useAppDispatch, useAppSelector } from '@renderer/redux/store/hook'
import { generatePassword } from '@renderer/utils/functions'
import CustomIcon from '@renderer/components/icons'
import { Link, useNavigate } from 'react-router-dom'
import { blue } from '@mui/material/colors'
import BGImg from '@renderer/assets/login-bg.png'

// Define validation schema
const validationSchema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email address').required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  locality: yup.string().required('Locality is required'),
  city: yup.string().required('City is required')
})

const AuthCreate = (): React.ReactNode => {
  const dispatch = useAppDispatch()
  const user = useAppSelector((s) => s.auth.user)
  const navigate = useNavigate()

  const loading = useAppSelector((s) => s.auth.login_loading)
  const [show, setShow] = React.useState(false)
  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      locality: '',
      city: '',
      name: '',
      center_address: ''
    },
    validationSchema,
    onSubmit: (values) => {
      dispatch(asyncCreateUser({ ...values }))
    }
  })

  React.useEffect(() => {
    if (user) {
      navigate('/home', { replace: true })
    }
  }, [user])

  return (
    <Container>
      <Backdrop open={loading} sx={{ zIndex: 1000 }}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <Paper>
        <LogoContainer>
          <img src={Logo} />
        </LogoContainer>
        <CustomTypography variant="h4" fontFamily={'Syne'} marginTop={'8px'} fontWeight={'normal'}>
          Signup
        </CustomTypography>
        <form onSubmit={formik.handleSubmit}>
          <CustomTextInput
            input={{
              placeholder: 'Enter Name',
              name: 'name',
              value: formik.values.name,
              onChange: formik.handleChange,
              onBlur: formik.handleBlur,
              error: Boolean(formik.touched.name && formik.errors.name),
              helperText: formik.touched.name && formik.errors.name,
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
              placeholder: 'Enter Email',
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
              placeholder: 'Enter Locality',
              name: 'locality',
              value: formik.values.locality,
              onChange: formik.handleChange,
              onBlur: formik.handleBlur,
              error: Boolean(formik.touched.locality && formik.errors.locality),
              helperText: formik.touched.locality && formik.errors.locality,
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
              placeholder: 'Enter City',
              name: 'city',
              value: formik.values.city,
              onChange: formik.handleChange,
              onBlur: formik.handleBlur,
              error: Boolean(formik.touched.city && formik.errors.city),
              helperText: formik.touched.city && formik.errors.city,
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
              placeholder: 'Enter center address',
              name: 'center_address',
              value: formik.values.center_address,
              onChange: formik.handleChange,
              onBlur: formik.handleBlur,
              error: Boolean(formik.touched.center_address && formik.errors.center_address),
              helperText: formik.touched.center_address && formik.errors.center_address,
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
                input: {
                  endAdornment: (
                    <CustomIcon
                      name="LUCIDE_ICONS"
                      icon={show ? 'LuEyeOff' : 'LuEye'}
                      color="grey"
                      onClick={() => setShow((prev) => !prev)}
                    />
                  )
                }
              },
              placeholder: 'Enter your password',
              type: show ? 'text' : 'password',
              name: 'password',
              value: formik.values.password,
              onChange: formik.handleChange,
              onBlur: formik.handleBlur,
              error: Boolean(formik.touched.password && formik.errors.password),
              helperText: (
                <div
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  {(formik.touched.password && formik.errors.password) ?? <>&nbsp;</>}
                  <CustomTypography
                    fontSize={'12px'}
                    color={'blue'}
                    sx={{
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      userSelect: 'none',
                      msUserSelect: 'none',
                      MozUserSelect: 'none'
                    }}
                    onClick={() => formik.setFieldValue('password', generatePassword())}
                  >
                    Generate Password
                  </CustomTypography>
                </div>
              ),
              sx: {
                marginBottom: '18px',
                input: {
                  color: '#fefefeaa'
                }
              }
            }}
          />
          <SubmitButton type="submit">Create User</SubmitButton>
        </form>
        <CustomTypography
          variant={'body2'}
          marginTop={'12px'}
          gap={'2px'}
          color={'#fdfdfdaa'}
          sx={{
            a: {
              textDecoration: 'none',
              color: blue['800'],
              cursor: 'pointer'
            }
          }}
        >
          Having an account ? <Link to={'/auth/login'}>Login</Link>
        </CustomTypography>
      </Paper>
    </Container>
  )
}

export default AuthCreate

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
    maxHeight: 'calc(100% - 24px)',
    overflow: 'auto',
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
