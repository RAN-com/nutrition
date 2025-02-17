import { styled } from '@mui/material'
import { grey } from '@mui/material/colors'
import CustomTypography from '@renderer/components/typography'

// const validationSchema = yup.object({
//   phone: yup
//     .string()
//     .required()
//     .min(10, 'Enter a valid phone number')
//     .max(10, 'Enter a valid phone number'),
//   address: yup.string().required().min(5, 'Enter valid address')
// })

const ContactTemplate = () => {
  // const formik = useFormik({
  //   initialValues: {},
  //   validationSchema,
  //   onSubmit(values, formikHelpers) {
  //   },
  // })
  // const [phoneInput, setPhoneInput] = React.useState('')
  // const [addressInput, setAddressInput] = React.useState('')

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
    </Container>
  )
}

export default ContactTemplate

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
