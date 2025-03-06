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
import { deleteFile, uploadFiles } from '@renderer/lib/upload-img'
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
  age: yup
    .number()
    .required('Age is required')
    .integer('Age must be an integer')
    .positive('Age must be a positive number')
    .typeError('Age must be a number'),
  // gender: yup
  //   .string()
  //   .required('Gender is required')
  //   .oneOf(['male', 'female'], 'Gender must be either "male" or "female"'),
  neck_circumference: yup
    .number()
    .required('Neck circumference is required')
    .positive('Neck circumference must be a positive number')
    .typeError('Neck circumference must be a number'),
  waist_circumference: yup
    .number()
    .required('Waist circumference is required')
    .positive('Waist circumference must be a positive number')
    .typeError('Waist circumference must be a number'),
  hip_circumference: yup
    .number()
    .nullable() // Nullable for optional handling
    .when('gender', (gender, schema) =>
      gender.includes('female')
        ? schema
            .required('Hip circumference is required for females')
            .positive('Hip circumference must be a positive number')
            .typeError('Hip circumference must be a number')
        : schema.notRequired()
    ),
  triceps_skinfold: yup
    .number()
    .required('Triceps skinfold is required')
    .positive('Triceps skinfold must be a positive number')
    .typeError('Triceps skinfold must be a number'),
  body_fat_percentage: yup
    .number()
    .required('Body fat percentage is required')
    .positive('Body fat percentage must be a positive number')
    .max(100, 'Body fat percentage cannot exceed 100')
    .typeError('Body fat percentage must be a number'),
  photo_url: yup.array().of(yup.string()).notRequired()
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
      weight: '',
      height: '',
      age: '',
      neck_circumference: '',
      waist_circumference: '',
      hip_circumference: '',
      triceps_skinfold: '',
      body_fat_percentage: '',
      photo_url: [] as string[]
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setLoading(true)
      console.log('Heyyyy')
      const heightInMeters = Number(values.height) / 100 // Convert height to meters
      const weight = Number(values.weight)
      const age = Number(values.age)

      // Calculate BMI
      const BMI = weight / (heightInMeters * heightInMeters)

      // Calculate BMR (Harris-Benedict Equation)
      const BMR =
        gender === 'male'
          ? 88.362 + 13.397 * weight + 4.799 * Number(values.height) - 5.677 * age
          : 447.593 + 9.247 * weight + 3.098 * Number(values.height) - 4.33 * age

      // Estimate Body Fat Percentage (US Navy Method)
      const BODY_FAT = parseInt(values.body_fat_percentage || '0')

      // Calculate TSF (Triceps Skinfold Thickness)
      const TSF = Number(values.triceps_skinfold)

      // Estimate Muscle Mass (generic estimation)
      const MUSCLE_MASS = weight * (1 - BODY_FAT / 100) * 0.5

      // Estimate Body Age (based on age and BMI)
      const BODY_AGE = age + (BMI > 25 ? BMI - 25 : 0)

      console.log({
        BMI,
        BMR,
        BODY_FAT,
        TSF,
        MUSCLE_MASS,
        BODY_AGE,
        HEIGHT: Number(values.height),
        WEIGHT: weight
      })
      if (type === 'visitor') {
        await addVisitorRecord({
          uid: admin?.uid as string,
          data: {
            BMI,
            BMR,
            BODY_FAT,
            TSF,
            MUSCLE_MASS,
            BODY_AGE,
            HEIGHT: Number(values.height),
            WEIGHT: weight
          },
          recorded_by: admin?.uid as string,
          recorded_on: moment().format('YYYY-MM-DD:hh:mm:ss'),
          vid: user?.data?.[type === 'visitor' ? 'vid' : 'cid'] as string
          // recorded_by: admin?.uid as string,
          // recorded_on: moment().format("YYYY-MM-DD:hh:mm:ss"),
          // vid: user?.data?[
          //   type === "visitor" ? "vid" : "cid"
          // ]
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
          BMI,
          BMR,
          BODY_FAT,
          TSF,
          MUSCLE_MASS,
          BODY_AGE,
          HEIGHT: Number(values.height),
          WEIGHT: weight
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
    }
  })

  console.log(user, type, formik.values)
  // Filter out gender and hip_circumference if its male
  const keys = Object.keys(formik.values).filter((k) => {
    if (k === 'hip_circumference') {
      return user?.data?.gender === 'female'
    }
    return k !== 'gender'
  })

  console.log(formik.errors)
  return (
    <Dialog
      className="scrollbar"
      open={open}
      onClose={() => {
        formik.resetForm()
        setLoading(false)
        onClose?.()
      }}
      PaperProps={{
        className: 'scrollbar'
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
                onClear={async (idx) => {
                  const split = formik.values.photo_url[idx]?.split('.com')
                  const [_, ...filename] = split[split.length - 1].split('/')
                  await deleteFile(filename.join('/'))
                  formik.setFieldValue('photo_url', '')
                }}
                multiple={false}
                uploaded_urls={
                  formik.values.photo_url.length > 0
                    ? [...formik.values.photo_url].filter(Boolean)
                    : []
                }
                onChange={async (e) => {
                  if (e.target.files && e.target.files.length === 1) {
                    const url = await uploadFiles(
                      admin?.uid as string,
                      [e.target.files[0]],
                      ['customers']
                    )
                    formik.setFieldValue('photo_url', [url])
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
