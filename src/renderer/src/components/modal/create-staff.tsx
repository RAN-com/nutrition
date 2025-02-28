import { Button, Dialog, FormControlLabel, Modal, Radio, RadioGroup } from '@mui/material'
import CustomTypography from '../typography'
import { useFormik } from 'formik'
import CustomTextInput from '../text-input'
import { capitalizeSentence } from '@renderer/utils/functions'
import ImageUpload from '../image-upload'
import moment from 'moment'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { grey } from '@mui/material/colors'
import { DatePicker } from '@mui/x-date-pickers'
import * as Yup from 'yup'
import CustomIcon from '../icons'
import { deleteFile, uploadFiles } from '@renderer/lib/upload-img'
import { useAppSelector, useAppDispatch } from '@renderer/redux/store/hook'
import { StaffData } from '@renderer/types/staff'
import { addStaff, updateStaff } from '@renderer/firebase/staffs'
import { asyncGetStaffs } from '@renderer/redux/features/user/staff'
import React from 'react'

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  photo_url: Yup.string().url('Invalid URL').optional(),
  gender: Yup.string()
    .oneOf(['male', 'female', 'other'], 'Invalid gender')
    .required('Gender is required'),
  phone: Yup.string()
    .matches(/^\d{10}$/, 'Phone number must be 10 digits')
    .required('Phone is required'),
  address: Yup.string().required('Address is required')
})

const CreateStaffModal = ({
  onClose,
  open,
  edit
}: {
  open: boolean
  onClose(): void
  edit?: {
    data: StaffData['data']
  }
}) => {
  const user = useAppSelector((s) => s.auth.user)
  const [loading, setLoading] = React.useState(false)
  const dispatch = useAppDispatch()
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: edit?.data?.name ?? '',
      email: edit?.data?.email ?? '',
      gender: edit?.data?.gender ?? '',
      phone: edit?.data?.phone ?? '',
      address: edit?.data?.address ?? '',
      date_of_birth: edit?.data?.date_of_birth ?? '',
      medical_issues: edit?.data?.medical_issues ?? '',
      photo_url: edit?.data?.photo_url ?? ''
    },
    validationSchema,
    onSubmit: () => {
      setLoading(true)
      if (!user) {
        setLoading(false)
        alert('Login Again')
        return
      }
      try {
        if (edit?.data) {
          updateStaff(edit?.data.createdBy, edit?.data?.sid, {
            ...edit?.data,
            ...formik.values
          })
            .then(() => {
              setLoading(false)
              dispatch(asyncGetStaffs({ uid: user?.uid }))
              formik.resetForm()
              onClose?.()
            })
            .catch(() => {
              setLoading(false)
              formik.resetForm()
              onClose?.()
            })
        } else {
          addStaff({
            createdBy: user?.uid,
            available_limit: user?.subscription?.total_staffs as number,
            ...formik.values
          })
            .then(() => {
              setLoading(false)
              dispatch(asyncGetStaffs({ uid: user?.uid }))
              formik.resetForm()
              onClose?.()
            })
            .catch(() => {
              setLoading(false)
              formik.resetForm()
              onClose?.()
            })
        }
      } catch (err) {
        console.error(err)
        setLoading(false)
      }
    }
  })

  // React.useEffect(() => {
  //   if (Object.keys(formik.errors).length > 0 && !formik.dirty) {
  //     Object.keys(formik.errors).map((e) => errorToast(e))
  //   }
  // }, [formik.errors])

  console.log(formik.errors)
  const keys = Object.keys(formik.values)
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
          maxHeight: 'calc(100vh / 1.5)',
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
          <CustomTypography variant={'h6'}>Add New Staff</CustomTypography>
          <CustomIcon name={'LUCIDE_ICONS'} onClick={onClose} icon={'LuX'} color={grey['700']} />
        </div>
        {keys.map((k, idx) =>
          k.includes('gender') ? (
            <>
              <CustomTypography marginTop={'12px'} color={grey['500']}>
                Gender
              </CustomTypography>
              <RadioGroup
                aria-labelledby="demo-radio-buttons-group-label"
                name="radio-buttons-group"
                onChange={(e) => formik.setFieldValue(k, e.target.value)}
              >
                <FormControlLabel value="female" control={<Radio />} label="Female" />
                <FormControlLabel value="male" control={<Radio />} label="Male" />
                <FormControlLabel value="others" control={<Radio />} label="Other" />
              </RadioGroup>
            </>
          ) : k.includes('date') ? (
            <LocalizationProvider key={'date'} dateAdapter={AdapterMoment}>
              <CustomTypography color={grey['500']} marginTop={'12px'}>
                Date of birth
              </CustomTypography>
              <DatePicker
                onChange={(e) => formik.setFieldValue(k, e?.toISOString())}
                name={k}
                disableFuture={true}
                format="DD-MM-YYYY"
                value={moment(formik.values.date_of_birth)}
              />
            </LocalizationProvider>
          ) : k.includes('photo_url') ? (
            <>
              <CustomTypography marginTop={'12px'} color={grey['500']}>
                Upload Image(Optional)
              </CustomTypography>
              <ImageUpload
                onClear={async () => {
                  const split = formik.values.photo_url.split('.com')
                  const [_, ...filename] = split[split.length - 1].split('/')
                  await deleteFile(filename.join('/'))
                  formik.setFieldValue('photo_url', '')
                }}
                multiple={false}
                uploaded_urls={[formik.values.photo_url].filter(Boolean)}
                onChange={async (e) => {
                  if (e.target.files && e.target.files.length === 1) {
                    const url = await uploadFiles(
                      user?.uid as string,
                      [e.target.files[0]],
                      ['customers']
                    )
                    if (url[0]) {
                      formik.setFieldValue('photo_url', url[0].Location)
                    }
                  }
                }}
              />
            </>
          ) : (
            <CustomTextInput
              formProps={{
                sx: {
                  marginTop: '12px'
                }
              }}
              input={{
                disabled: !!edit && k.includes('email'),
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
          )
        )}
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

export default CreateStaffModal
