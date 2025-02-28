import { Button, styled } from '@mui/material'
import { grey } from '@mui/material/colors'
import CustomIcon from '@renderer/components/icons'
import CustomTextInput from '@renderer/components/text-input'
import CustomTypography from '@renderer/components/typography'
import { setCardDetails } from '@renderer/redux/features/user/card'
import { useAppDispatch, useAppSelector } from '@renderer/redux/store/hook'
import { useFormik } from 'formik'
import React from 'react'
import * as yup from 'yup'

const validationSchema = yup.object({
  currentPhone: yup
    .string()
    .optional()
    .min(10, 'Enter a valid phone number')
    .max(10, 'Enter a valid phone number'),
  address: yup.string().min(10, 'Enter a valid address')
})

const ContactTemplate = () => {
  const dispatch = useAppDispatch()
  const contact = useAppSelector((s) => s?.card?.editor?.data?.['contact'] ?? null)

  const formik = useFormik({
    initialValues: {
      currentPhone: '',
      address: contact?.address || ''
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit(values) {
      if (
        values.currentPhone.length >= 10 &&
        contact?.phone?.some((e) => e.includes(values.currentPhone))
      ) {
        formik.setFieldError('currentPhone', 'Number Already Exists')
        return
      } else {
        dispatch(
          setCardDetails({
            id: 'contact',
            value: {
              ...contact,
              phone: [...(contact?.phone || []), values.currentPhone].filter(
                (e) => e.length === 10
              ),
              address: values.address?.length >= 10 ? values.address : undefined
            }
          })
        )
      }
      formik.setFieldValue('currentPhone', '')
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
        Contact
      </CustomTypography>
      <div
        style={{
          gap: '12px'
        }}
      >
        <CustomTextInput
          input={{
            label: 'Enter Mobile Number',
            size: 'small',
            value: formik.values.currentPhone, // Ensure the input doesn't overwrite previous entries
            onChange: (e) => {
              formik.setFieldValue('currentPhone', e.target.value) // Temporary value before adding
            },
            error: (formik.touched.currentPhone && Boolean(formik.errors.currentPhone))?.valueOf(),
            helperText: formik.touched.currentPhone && formik.errors.currentPhone,
            slotProps: {
              input: {
                endAdornment: (
                  <Button
                    onClick={() => {
                      formik.submitForm()
                    }}
                  >
                    Add
                  </Button>
                )
              }
            }
          }}
        />
        <div
          style={{
            paddingBottom: '16px'
          }}
        >
          {contact?.phone?.map((e) => (
            <CustomTypography>
              {e}
              <CustomIcon
                size={18}
                name={'LUCIDE_ICONS'}
                icon={'LuX'}
                onClick={() => {
                  dispatch(
                    setCardDetails({
                      id: 'contact',
                      value: {
                        ...contact,
                        phone: contact?.phone?.filter((p) => !p.includes(e))
                      }
                    })
                  )
                }}
              />
            </CustomTypography>
          ))}
        </div>

        <CustomTextInput
          input={{
            label: 'Enter address',
            size: 'small',
            onChange: (e) => formik.setFieldValue('address', e.target.value),
            error: (formik.touched.address && Boolean(formik.errors.address))?.valueOf(),
            helperText: formik.touched.address && formik.errors.address,
            slotProps: {
              input: {
                endAdornment: (
                  <Button
                    onClick={() => {
                      formik.submitForm()
                    }}
                  >
                    Add
                  </Button>
                )
              }
            }
          }}
        />
      </div>
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
