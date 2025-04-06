import { Backdrop, Button, Dialog, FormControlLabel, Radio, RadioGroup } from '@mui/material'
import { CustomerAttendance } from '@renderer/types/customers'
import { useFormik } from 'formik'
import React from 'react'
import CustomTypography from '../typography'
import CustomIcon from '../icons'
import { grey } from '@mui/material/colors'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import moment from 'moment'
import CustomTextInput from '../text-input'

type Props = {
  onClose?(): void
  open: boolean
  edit?: CustomerAttendance
}

import * as Yup from 'yup'
import { addAttendance, payDueAmount, updateAttendance } from '@renderer/firebase/customers'
import { useAppSelector, useAppDispatch } from '@renderer/redux/store/hook'
import {
  asyncGetCurrentCustomerAttendance,
  asyncGetUserSubscription
} from '@renderer/redux/features/user/customers'
import ImageUpload from '../image-upload'
import { deleteFile, uploadFiles } from '@renderer/lib/upload-img'

const validationSchema = Yup.object().shape({
  date: Yup.string().required('Date is required').typeError('Invalid date format'),
  weight: Yup.number().required('Weight is required').min(10, 'Enter valid weight'),
  photo_url: Yup.array().required('Photo is required'),
  amount_paid: Yup.number().optional().min(100, 'Minimum amount is Rs.100'),
  mark_status: Yup.boolean()
    .required('Mark status is required')
    .oneOf([true, false], 'Mark status must be true or false')
})

const MarkAttendance = ({ open, onClose, edit }: Props) => {
  const user = useAppSelector((s) => s.auth.user)
  const dispatch = useAppDispatch()
  const subscription = useAppSelector((s) => s.customer?.current_customer?.subscription)

  const customer = useAppSelector((s) => s.customer.current_customer?.data)
  const [loading, setLoading] = React.useState(false)
  const currentDate = useAppSelector((s) => s.customer.selected_attendance_date)

  const formik = useFormik({
    enableReinitialize: !!edit || !!currentDate,
    initialValues: {
      date: moment(currentDate?.date || edit?.date).toISOString(),
      weight: edit?.weight ?? '',
      mark_status: edit?.mark_status || false,
      photo_url: edit?.photo_url ?? []
    } as Partial<CustomerAttendance>,

    validationSchema,
    onSubmit: async (values) => {
      if (!user?.uid || !customer?.cid) return alert('Login again')
      if (
        !!values.amount_paid &&
        values.amount_paid > 0 &&
        values.amount_paid <= (subscription?.price || 0) - (subscription?.amountPaid || 0)
      ) {
        await payDueAmount({ uid: user?.uid, cid: customer.cid, dueAmount: values.amount_paid })
      } else {
        formik.setFieldError(
          'amount_paid',
          `Due amount should be less than or equal to ${(subscription?.price || 0) - (subscription?.amountPaid || 0)} `
        )
        return
      }
      if (!!edit) {
        await updateAttendance({
          uid: user?.uid,
          cid: customer?.cid,
          attendanceData: {
            ...values,
            marked_by: user?.uid as string
          } as CustomerAttendance
        }).then(() => {
          dispatch(
            asyncGetCurrentCustomerAttendance({
              uid: customer?.created_by?.uid,
              cid: customer?.cid,
              month: moment(values.date).month(),
              year: moment(values.date).year()
            })
          )
            .then(() => {
              dispatch(
                asyncGetUserSubscription({ uid: user?.uid as string, cid: customer?.cid as string })
              )
              setLoading(false)
              formik.resetForm()
              onClose?.()
            })
            .catch(() => {
              setLoading(false)
              formik.resetForm()
              onClose?.()
            })
        })
      } else {
        await addAttendance({
          uid: user?.uid,
          cid: customer?.cid,
          attendanceData: {
            ...values,
            marked_by: user?.uid as string,
            date: moment(values.date).format('YYYY-MM-DD')
          } as CustomerAttendance
        }).then(() => {
          dispatch(
            asyncGetCurrentCustomerAttendance({
              uid: customer?.created_by?.uid,
              cid: customer?.cid,
              month: moment(values.date).month(),
              year: moment(values.date).year()
            })
          )
            .then(() => {
              dispatch(
                asyncGetUserSubscription({
                  uid: user?.uid as string,
                  cid: customer?.cid as string
                })
              )
              setLoading(false)
              formik.resetForm()
              onClose?.()
            })
            .catch(() => {
              setLoading(false)
              formik.resetForm()
              onClose?.()
            })
        })
      }
    }
  })

  const pending = subscription?.price === subscription?.amountPaid

  return (
    <Dialog
      open={open}
      onClose={() => {
        formik.resetForm()
        setLoading(false)
        onClose?.()
      }}
      sx={{
        '.MuiPaper-root': {
          width: 'calc(100% - 24px)',
          maxHeight: 'calc(100% - 24px)',
          maxWidth: '420px',
          padding: '12px 18px'
        },
        '.header': {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        },
        '& form': {
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          paddingBottom: '12px'
        }
      }}
    >
      <Backdrop open={loading} sx={{ position: 'fixed', zIndex: 100000000 }} />
      <form onSubmit={formik.handleSubmit}>
        <div className="header">
          <CustomTypography variant={'h6'}>Mark Attendance</CustomTypography>
          <CustomIcon name={'LUCIDE_ICONS'} onClick={onClose} icon={'LuX'} color={grey['700']} />
        </div>
        <LocalizationProvider key={'date'} dateAdapter={AdapterMoment}>
          <CustomTypography color={grey['500']} marginTop={'12px'}>
            Attendance Date
          </CustomTypography>
          <DatePicker
            disabled={true}
            onChange={(e) => formik.setFieldValue('date', e?.toISOString())}
            name={'date'}
            disableFuture={true}
            format="DD-MM-YYYY"
            value={moment(formik.values.date)}
          />
        </LocalizationProvider>
        <CustomTextInput
          formProps={{
            sx: {
              marginTop: '12px'
            }
          }}
          input={{
            inputMode: 'decimal',
            type: 'number',
            error: (formik.touched.weight && Boolean(formik.errors.weight))?.valueOf(),
            helperText: formik.touched.weight && formik.errors.weight,
            label: <CustomTypography>Enter Weight</CustomTypography>,
            name: 'weight',
            value: formik.values.weight,
            onChange: formik.handleChange,
            placeholder: `Enter Weight`
          }}
        />
        {!pending && (
          <CustomTextInput
            formProps={{
              sx: {
                marginTop: '12px'
              }
            }}
            input={{
              inputMode: 'decimal',
              type: 'number',
              error: (formik.touched.amount_paid && Boolean(formik.errors.amount_paid))?.valueOf(),
              helperText: formik.touched.amount_paid && formik.errors.amount_paid,
              label: <CustomTypography>Due amount {'(Optional)'}</CustomTypography>,
              name: 'amount_paid',
              value: formik.values.amount_paid,
              onChange: formik.handleChange,
              placeholder: `Enter Due Amount`
            }}
          />
        )}
        <ImageUpload
          onClear={async (index: number) => {
            // Delete the file when it's cleared
            const split = formik.values.photo_url?.[index].split('.com')
            const [, ...filename] = split?.[split?.length - 1].split('/') ?? ['']
            await deleteFile(filename.join('/'))
            const newPhotos = [...(formik.values?.photo_url ?? [])]
            newPhotos.splice(index, 1) // Remove the deleted image from the list
            formik.setFieldValue('photo_url', newPhotos) // Update the Formik field value
          }}
          uploaded_urls={formik.values.photo_url ?? []} // Pass all uploaded formik.values.photo_url?.
          onChange={async (e) => {
            if (e.target.files && e.target.files.length > 0) {
              // Handle multiple file uploads
              const newFiles = Array.from(e.target.files)
              const uploadedUrls = await uploadFiles(user?.uid as string, newFiles, ['customers'])
              const newUrls = uploadedUrls.map((url) => url.Location)
              console.log(newUrls)
              // Update state with the new photo URLs
              formik.setFieldValue('photo_url', [...(formik.values?.photo_url ?? []), ...newUrls])
            }
          }}
        />
        <RadioGroup
          sx={{
            paddingBottom: '12px'
          }}
          row={true}
          aria-labelledby="demo-radio-buttons-group-label"
          name="radio-buttons-group"
          onChange={(e) => formik.setFieldValue('mark_status', e.target.value === 'present')}
        >
          <FormControlLabel
            checked={!formik.values.mark_status}
            value={'absent'}
            control={<Radio />}
            label="Absent"
          />
          <FormControlLabel
            checked={formik.values.mark_status}
            value="present"
            control={<Radio />}
            label="Present"
          />
        </RadioGroup>

        <Button
          type={'submit'}
          sx={{ width: '100%', maxWidth: '240px', margin: 'auto' }}
          variant="contained"
        >
          Submit
        </Button>
      </form>
    </Dialog>
  )
}

export default MarkAttendance
