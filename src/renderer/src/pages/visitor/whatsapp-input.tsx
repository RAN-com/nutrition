import {
  Button,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  styled
} from '@mui/material'
import { grey } from '@mui/material/colors'
import CustomTextInput from '@renderer/components/text-input'
import CustomTypography from '@renderer/components/typography'
import { useFormik } from 'formik'
import React from 'react'
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
  const [messages, setMessages] = React.useState<string[]>([])

  React.useEffect(() => {
    // Fetch the last 5 messages from local storage
    const storedMessages = JSON.parse(localStorage.getItem('lastSentMessages') || '[]') as string[]
    setMessages(storedMessages.slice(0, 5)) // Limit to last 5 messages
  }, [])

  const saveMessageToLocalStorage = (message: string) => {
    const storedMessages = JSON.parse(localStorage.getItem('lastSentMessages') || '[]') as string[]
    const updatedMessages = [message, ...storedMessages].slice(0, 5) // Keep only the last 5 messages
    localStorage.setItem('lastSentMessages', JSON.stringify(updatedMessages))
    setMessages(updatedMessages)
  }

  const formik = useFormik({
    initialValues: {
      message: ''
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit(values, { resetForm }) {
      const url = new URL(`https://wa.me/91${phone}`)
      url.searchParams.append('text', values.message)
      console.log(url)
      window.open(url, '_blank')

      // Save the message to local storage
      saveMessageToLocalStorage(values.message)

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
            <CustomTypography variant="h4" fontWeight={'600'}>
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
          <CustomTypography fontWeight={'bold'}>Message Templates</CustomTypography>
          <MsgBoxContainer>
            {messages.map((msg, idx) => (
              <MsgBox
                key={idx}
                onClick={(e) => {
                  e.preventDefault()
                  formik.setFieldValue('message', msg)
                }}
              >
                <CustomTypography color={grey['800']}>{msg}</CustomTypography>
              </MsgBox>
            ))}
          </MsgBoxContainer>
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
          <DialogTitle variant="h6">Oops</DialogTitle>
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

const MsgBoxContainer = styled('div')({
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'nowrap',
  overflowX: 'auto',
  scrollSnapType: 'x mandatory',
  padding: '12px 0px',
  paddingBottom: '4px',
  gap: '12px',
  marginBottom: '12px'
})

const MsgBox = styled('div')({
  width: '100%',
  minWidth: '100%',
  padding: '8px',
  border: `1px solid ${grey['300']} `,
  borderRadius: '12px',
  cursor: 'pointer',
  scrollSnapAlign: 'start',
  '&:hover': {
    backgroundColor: grey['100']
  }
})
