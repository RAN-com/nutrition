import { Button, Dialog, DialogContent, DialogContentText, DialogTitle } from '@mui/material'
import CustomTextInput from '@renderer/components/text-input'
import CustomTypography from '@renderer/components/typography'
import { useFormik } from 'formik'
import * as yup from 'yup'

type Props = {
  open: boolean
  onClose(): void
  phone?: string
}

const validationSchema = yup.object().shape({
  message: yup
    .string()
    .required('Message is required')
    .min(10, 'Message must be at least 10 characters')
    .max(500, 'Message cannot exceed 500 characters')
})

export default function WhatsAppInput({ onClose, open, phone }: Props) {
  const formik = useFormik({
    initialValues: {
      message: ''
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit(values, { resetForm }) {
      // considering the mobile number as IN  without +91
      const url = new URL(`https://wa.me/91${phone}`)
      url.searchParams.append('text', values.message)
      console.log(url)
      window.open(url, '_blank')
      resetForm()
      onClose()
    }
  })

  return (
    <Dialog
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: '100%',
            padding: '12px 16px',
            maxWidth: '420px'
          }
        }
      }}
    >
      {phone ? (
        <>
          <CustomTypography>
            <CustomTypography fontSize={'14px'} fontWeight={'400'}>
              Enter your WhatsApp message
            </CustomTypography>
          </CustomTypography>
          <CustomTextInput
            formProps={{
              sx: {
                margin: '12px 0px'
              }
            }}
            input={{
              minRows: 4,
              maxRows: 8,
              placeholder: 'Your Message',
              multiline: true,
              value: formik.values.message,
              onChange: formik.handleChange,
              name: 'message',
              error: formik.touched.message && Boolean(formik.errors.message),
              helperText: formik.touched.message && formik.errors.message
            }}
          />
          <Button
            variant="contained"
            disabled={!formik.isValid || formik.isSubmitting || formik.values.message.length <= 9}
            onClick={() => formik.submitForm()}
          >
            Send Message
          </Button>
        </>
      ) : (
        <>
          <DialogTitle variant="h6">Opps</DialogTitle>
          <DialogContent>
            <DialogContentText>
              <CustomTypography>Mobile not found for this visitor</CustomTypography>
              <CustomTypography>Add and try again</CustomTypography>
            </DialogContentText>
          </DialogContent>
          <Button variant="contained" onClick={onClose}>
            Close
          </Button>
        </>
      )}
    </Dialog>
  )
}
