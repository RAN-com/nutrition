import { Button, Dialog, Modal } from '@mui/material'
import { grey } from '@mui/material/colors'
import CustomIcon from '@renderer/components/icons'
import CustomTextInput from '@renderer/components/text-input'
import CustomTypography from '@renderer/components/typography'
import { addVisitorRecord } from '@renderer/firebase/visitor'
import { asyncSetCurrentVisitor } from '@renderer/redux/features/user/visitors'
import { useAppSelector, useAppDispatch } from '@renderer/redux/store/hook'
import { RecordType } from '@renderer/types/record'
import { capitalizeSentence } from '@renderer/utils/functions'
import { errorToast } from '@renderer/utils/toast'
import { useFormik } from 'formik'
import React from 'react'
import * as Yup from 'yup'

type Props = {
  open: boolean
  onClose(): void
  edit?: RecordType | null
}

const validationSchema = Yup.object().shape({
  height: Yup.number().positive('Height must be positive').required('Height is required'),
  weight: Yup.number().positive('Weight must be positive').required('Weight is required'),
  body_fat: Yup.number()
    .min(0, 'Body fat must be at least 0')
    .max(100, 'Body fat must not exceed 100')
    .required('Body fat percentage is required'),
  bmi: Yup.number().positive('BMI must be positive').required('BMI is required'),
  bmr: Yup.number().positive('BMR must be positive').required('BMR is required'),

  visceral_fat: Yup.number()
    .min(0, 'Visceral fat must be at least 0')
    .max(100, 'Visceral fat must not exceed 100')
    .required('Visceral fat percentage is required'),
  body_age: Yup.number()
    .integer('Body age must be an integer')
    .positive('Body age must be positive')
    .required('Body age is required'),
  tsf: Yup.number().positive('TSF must be positive').required('TSF is required'),
  skeletal_muscle: Yup.number()
    .positive('Skeletal muscle percentage must be positive')
    .required('Skeletal muscle percentage is required')
})

const UpdateVisitorRecord = ({ open, onClose, edit }: Props) => {
  const [loading, setLoading] = React.useState(false)
  const user = useAppSelector((s) => s.auth.user)
  const dispatch = useAppDispatch()
  const currentUser = useAppSelector((s) => s.visitor.current_visitor)

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      height: edit?.height ?? '',
      weight: edit?.weight ?? '',
      body_fat: edit?.body_fat ?? '',
      bmi: edit?.bmi ?? '',
      bmr: edit?.bmr ?? '',
      visceral_fat: edit?.visceral_fat ?? '',
      body_age: edit?.body_age ?? '',
      tsf: edit?.tsf ?? '',
      skeletal_muscle: edit?.skeletal_muscle ?? ''
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      console.log('Submitted')
      setLoading(true)
      if (!user) return
      if (user) {
        setLoading(false)
        const add = await addVisitorRecord({
          ...values,
          data: values,
          recorded_by: user?.uid,
          recorded_on: edit?.recorded_on ?? new Date().toISOString(),
          uid: user?.uid,
          vid: currentUser?.data?.vid
        } as keyof typeof edit)
        if (!!add) {
          dispatch(
            asyncSetCurrentVisitor({
              uid: user?.uid as string,
              vid: currentUser?.data.vid as string
            })
          )
          onClose()
          resetForm()
        } else {
          errorToast(JSON.stringify('Something went wrong') ?? '')
        }
        return
      }
    }
  })

  const keys = Object.keys(formik.values)
  return (
    <Dialog
      open={open}
      sx={{
        '.MuiPaper-root': {
          width: 'calc(100% - 24px)',
          maxHeight: window.screen.availHeight / 2,
          maxWidth: '420px',
          padding: '12px 18px'
        },
        '.header': {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }
      }}
    >
      <Modal open={loading}>
        <div></div>
      </Modal>
      <form onSubmit={formik.handleSubmit}>
        <div className="header">
          <CustomTypography variant={'h6'}>Add Record</CustomTypography>
          <CustomIcon
            name={'LUCIDE_ICONS'}
            onClick={() => {
              onClose()
              formik.resetForm()
            }}
            icon={'LuX'}
            color={grey['700']}
          />
        </div>
        {keys.map((k, idx) => (
          <CustomTextInput
            formProps={{
              sx: {
                marginTop: '12px'
              }
            }}
            input={{
              key: edit?.bmi,
              error: (
                formik.touched[k as keyof typeof formik.touched] &&
                Boolean(formik.errors[k as keyof typeof formik.errors])
              )?.valueOf(),
              helperText:
                formik.touched[k as keyof typeof formik.touched] &&
                formik.errors[k as keyof typeof formik.errors],
              label: (
                <CustomTypography>
                  {capitalizeSentence(k)} {k.includes('medical') ? '(Optional)' : ''}
                </CustomTypography>
              ),
              name: k,
              value: formik.values[k as keyof typeof formik.values],
              onChange: formik.handleChange,
              placeholder: `Enter ${capitalizeSentence(k)}`
            }}
            key={idx}
          />
        ))}
        <Button
          type={'submit'}
          variant={'contained'}
          sx={{ width: '100%', maxWidth: '280px', margin: '12px auto' }}
        >
          Submit
        </Button>
      </form>
    </Dialog>
  )
}

export default UpdateVisitorRecord
