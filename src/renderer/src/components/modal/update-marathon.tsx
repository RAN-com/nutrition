import { Button, Dialog, Modal } from '@mui/material'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import CustomTypography from '../typography'
import CustomIcon from '../icons'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import { MarathonData } from '@renderer/types/marathon'
import moment from 'moment'
import CustomTextInput from '../text-input'
import { useAppSelector } from '@renderer/redux/store/hook'
import React from 'react'
import { updateCustomerMarathonData } from '@renderer/firebase/marathon'

type Props = {
  open: boolean
  onClose(): void
  data: MarathonData
  cid: string
}

// Validation Schema using Yup
const validationSchema = Yup.object({
  date: Yup.string()
    .required('Date is required')
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in the format YYYY-MM-DD'),
  weight: Yup.number()
    .required('Weight is required')
    .min(10, 'Enter a valid weight')
    .positive('Weight must be positive'),
  height: Yup.number()
    .required('Height is required')
    .min(55, 'Enter a valid height')
    .positive('Height must be positive')
})

export default function UpdateMarathon({ open, onClose, data, cid }: Props) {
  const user = useAppSelector((s) => s.auth.user)
  const [loading, setLoading] = React.useState(false)

  const formik = useFormik({
    initialValues: {
      date: '',
      weight: 0,
      height: 0
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true)
      const dayDifference = Math.round(
        moment(values.date).diff(moment(data?.from_date), 'days', true)
      )
      const update = await updateCustomerMarathonData(
        user?.uid as string,
        data?.mid as string,
        cid,
        dayDifference,
        values.date,
        {
          weight: values.weight,
          height: values.height
        }
      )

      setLoading(false)
      handleClose()
      console.log(update)
    }
  })

  console.log(formik.errors)
  const handleClose = () => {
    formik.resetForm()
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: '100%',
            padding: '16px 24px',
            maxWidth: '380px',
            display: 'flex',
            flexDirection: 'column',
            '.header': {
              width: '100%',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between'
            },
            form: {
              gap: '12px',
              display: 'flex',
              flexDirection: 'column',
              padding: '16px 0px 0px 0px'
            }
          }
        }
      }}
    >
      <Modal open={loading}>
        <></>
      </Modal>
      <div className="header">
        <CustomTypography variant="h5">Add Records</CustomTypography>
        <CustomIcon name="LUCIDE_ICONS" icon="LuX" onClick={handleClose} />
      </div>
      <form onSubmit={formik.handleSubmit}>
        <LocalizationProvider dateAdapter={AdapterMoment}>
          <DatePicker
            label={'Select Date'}
            minDate={moment(data?.from_date)}
            disableHighlightToday={true}
            format="YYYY-MM-DD"
            maxDate={moment(data.to_date)}
            onChange={(e) => formik.setFieldValue('date', e?.format('YYYY-MM-DD'))}
          />
        </LocalizationProvider>
        <div
          style={{
            display: 'flex',
            gap: '12px'
          }}
        >
          <CustomTextInput
            input={{
              label: 'Height (in cm)',
              type: 'number',
              value: formik.values.height,
              onChange: (e) => formik.setFieldValue('height', e.target.value),
              error: (formik.touched['height'] && Boolean(formik.errors['height']))?.valueOf(),
              helperText: formik.touched['height'] && formik.errors['height']
            }}
          />
          <CustomTextInput
            input={{
              label: 'Weight (in kg)',
              type: 'number',
              value: formik.values.weight,
              onChange: (e) => formik.setFieldValue('weight', e.target.value),
              error: (formik.touched['weight'] && Boolean(formik.errors['weight']))?.valueOf(),
              helperText: formik.touched['weight'] && formik.errors['weight']
            }}
          />
        </div>
        <CustomTypography variant="body2" fontSize={'10px'}>
          Enter current weight of the participant. Calculations will be done automatically
        </CustomTypography>
        <Button
          type={'submit'}
          variant="contained"
          disabled={Object.keys(formik.errors).length !== 0}
        >
          Submit
        </Button>
      </form>
    </Dialog>
  )
}
