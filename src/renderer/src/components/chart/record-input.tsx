import { Backdrop, Button, Dialog } from '@mui/material'
import { useAppSelector, useAppDispatch } from '@renderer/redux/store/hook'
import { useFormik } from 'formik'
import * as yup from 'yup'
import React from 'react'
import CustomTextInput from '../text-input'
import { capitalizeSentence } from '@renderer/utils/functions'
import CustomTypography from '../typography'
import CustomIcon from '../icons'
import ImageUpload from '../image-upload'
import { grey } from '@mui/material/colors'
import { addCustomerRecord } from '@renderer/firebase/customers'
import { asyncGetCustomerRecords } from '@renderer/redux/features/user/customers'
import { addVisitorRecord } from '@renderer/firebase/visitor'
import moment from 'moment'
import { asyncSetCurrentVisitor } from '@renderer/redux/features/user/visitors'

const validationSchema = yup.object().shape({
  weight: yup
    .number()
    .required('Weight is required')
    .positive('Weight must be a positive number')
    .typeError('Weight must be a number'),
  height: yup
    .number()
    .required('Height is required')
    .positive('Height must be a positive number')
    .typeError('Height must be a number'),
  bmi: yup
    .number()
    .required('BMI is required')
    .positive('BMI must be a positive number')
    .typeError('BMI must be a number'),
  bmr: yup
    .number()
    .required('BMR is required')
    .positive('BMR must be a positive number')
    .typeError('BMR must be a number'),
  body_fat_percentage: yup
    .number()
    .required('Body fat percentage is required')
    .positive('Body fat percentage must be a positive number')
    .max(100, 'Body fat percentage cannot exceed 100')
    .typeError('Body fat percentage must be a number'),
  muscle_mass: yup
    .number()
    .required('Muscle mass is required')
    .positive('Muscle mass must be a positive number')
    .typeError('Muscle mass must be a number'),
  visceral_fat: yup
    .number()
    .required('Visceral Fat is required')
    .positive('Visceral Fat must be a positive number')
    .typeError('Visceral Fat must be a number'),
  body_age: yup
    .number()
    .required('Body age is required')
    .positive('Body age must be a positive number')
    .typeError('Body age must be a number'),
  triceps_skinfold: yup
    .number()
    .required('Triceps skinfold is required')
    .positive('Triceps skinfold must be a positive number')
    .typeError('Triceps skinfold must be a number')
})

type Props = {
  open: boolean
  onClose: () => void
  type: 'customer' | 'visitor'
}

const RecordForm = ({ open, onClose, type }: Props) => {
  const user = useAppSelector((s) =>
    type === 'customer' ? s.customer.current_customer : s.visitor.current_visitor
  )

  const gender = user?.data?.gender as string
  console.log(gender)
  const admin = useAppSelector((s) => s.auth.user)
  const dispatch = useAppDispatch()
  const [loading, setLoading] = React.useState(false)

  const formik = useFormik({
    initialValues: {
      weight: undefined as undefined | number,
      height: undefined as undefined | number,
      bmi: undefined as undefined | number,
      bmr: undefined as undefined | number,
      body_fat_percentage: undefined as undefined | number,
      muscle_mass: undefined as undefined | number,
      body_age: undefined as undefined | number,
      triceps_skinfold: undefined as undefined | number,
      visceral_fat: undefined as undefined | number,
      photo_url: [] as (string | File)[]
    },
    enableReinitialize: true,
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setLoading(true)
      console.log('Heyyyy')
      if (type === 'visitor') {
        await addVisitorRecord({
          uid: admin?.uid as string,
          data: {
            bmi: values?.bmi ?? 0,
            bmr: values?.bmr ?? 0,
            body_fat: values?.body_fat_percentage ?? 0,
            tsf: values?.triceps_skinfold ?? 0,
            skeletal_muscle: values?.muscle_mass ?? 0,
            body_age: values?.body_age ?? 0,
            weight: values?.weight ?? 0,
            height: values?.height ?? 0,
            recorded_by: admin?.uid as string,
            visceral_fat: values.visceral_fat ?? 0,
            recorded_on: moment().format('YYYY-MM-DD:hh:mm:ss')
          },
          recorded_by: admin?.uid as string,
          recorded_on: moment().format('YYYY-MM-DD:hh:mm:ss'),
          vid: user?.data?.[type === 'visitor' ? 'vid' : 'cid'] as string
        })
          .then(() => {
            dispatch(
              asyncSetCurrentVisitor({
                uid: admin?.uid as string,
                vid: user?.data?.[type === 'visitor' ? 'vid' : 'cid'] as string
              })
            )
            formik.resetForm()
            setLoading(false)
            onClose?.()
          })
          .catch((e) => {
            console.error(e)
            formik.resetForm()
            setLoading(false)
            onClose?.()
          })
        return
      }
      await addCustomerRecord({
        uid: admin?.uid as string,
        cid: user?.data?.[type === 'customer' ? 'cid' : 'vid'] as string,
        data: {
          bmi: values?.bmi ?? 0,
          bmr: values?.bmr ?? 0,
          body_fat: values?.body_fat_percentage ?? 0,
          tsf: values?.triceps_skinfold ?? 0,
          skeletal_muscle: values?.muscle_mass ?? 0,
          body_age: values?.body_age ?? 0,
          weight: values?.weight ?? 0,
          height: values?.height ?? 0,
          recorded_by: admin?.uid as string,
          recorded_on: moment().format('YYYY-MM-DD:hh:mm:ss')
        }
      })
        .then(() => {
          dispatch(
            asyncGetCustomerRecords({
              uid: admin?.uid as string,
              cid: user?.data?.[type === 'customer' ? 'cid' : 'vid'] as string
            })
          )
          formik.resetForm()
          setLoading(false)
          onClose?.()
        })
        .catch((e) => {
          console.error(e)
          formik.resetForm()
          setLoading(false)
          onClose?.()
        })
      onClose?.()
    }
  })

  const keys = Object.keys(formik.values).filter((k) => {
    if (k === 'hip_circumference') {
      return user?.data?.gender === 'female'
    }
    return k !== 'gender'
  })

  return (
    <Dialog
      className="scrollbar"
      open={open}
      onClose={() => {
        formik.resetForm()
        setLoading(false)
        onClose?.()
      }}
      slotProps={{
        paper: {
          className: 'scrollbar'
        }
      }}
      sx={{
        width: '100%',
        '.MuiPaper-root': {
          width: 'calc(100% - 24px)',
          maxHeight: 'calc(var(--vh, 1vh) * 80)',
          maxWidth: '420px',
          padding: '12px 18px',
          paddingBottom: '24px'
        },
        form: {
          display: 'flex',
          flexDirection: 'column'
        },
        '.header': {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px'
        }
      }}
    >
      <Backdrop open={loading} sx={{ position: 'fixed', zIndex: 100000000 }} />
      <div className="header">
        <CustomTypography variant={'h6'} height={'max-content'}>
          Add Record for {type === 'customer' ? 'Customer' : 'Visitor'}
        </CustomTypography>

        <CustomIcon onClick={onClose} name={'LUCIDE_ICONS'} icon={'LuX'} />
      </div>
      <form onSubmit={formik.handleSubmit}>
        {keys.map((k) =>
          k === 'photo_url' ? (
            <>
              <CustomTypography marginTop={'12px'} color={grey['500']}>
                Upload Image(Optional)
              </CustomTypography>
              <ImageUpload
                onClear={(idx) => {
                  const updatedUrls = [...formik.values.photo_url]
                  updatedUrls.splice(idx, 1) // Remove the selected image
                  formik.setFieldValue('photo_url', updatedUrls)
                }}
                multiple={true}
                uploaded_urls={formik.values.photo_url}
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    const fileUrls = Array.from(e.target.files).map((file) =>
                      URL.createObjectURL(file)
                    ) // Generate local URLs
                    formik.setFieldValue('photo_url', [...formik.values.photo_url, ...fileUrls])
                  }
                }}
              />
            </>
          ) : (
            <>
              <CustomTextInput
                key={k}
                input={{
                  label: (
                    <CustomTypography
                      error={Boolean(formik.touched[k] && formik.errors[k])}
                      variant={'body2'}
                    >
                      {capitalizeSentence(k)}
                    </CustomTypography>
                  ),
                  placeholder: `Enter ${capitalizeSentence(k)}`,
                  name: k,
                  value: formik.values[k],
                  onChange: formik.handleChange,
                  onBlur: formik.handleBlur,
                  error: Boolean(formik.touched[k] && formik.errors[k]),
                  helperText: formik.touched[k] && formik.errors[k],
                  sx: {
                    marginBottom: '8px'
                  }
                }}
              />
            </>
          )
        )}
        <Button
          type={'submit'}
          variant={'contained'}
          sx={{ width: '100%', maxWidth: '280px', margin: 'auto', justifySelf: 'center' }}
        >
          Submit
        </Button>
      </form>
    </Dialog>
  )
}

export default RecordForm
