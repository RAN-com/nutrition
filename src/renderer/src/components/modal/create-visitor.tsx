import {
  Button,
  Dialog,
  FormControlLabel,
  MenuItem,
  Modal,
  Radio,
  RadioGroup,
  Select
} from '@mui/material'
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
import React from 'react'
import CustomIcon from '../icons'
import { deleteFile, uploadFiles } from '@renderer/lib/upload-img'
import { useAppSelector, useAppDispatch } from '@renderer/redux/store/hook'
import { VisitorData } from '@renderer/types/visitor'
import { addVisitor, updateVisitor } from '@renderer/firebase/visitor'
import { asyncGetVisitors } from '@renderer/redux/features/user/visitors'
import { infoToast } from '@renderer/utils/toast'
import { fileOrStringSchema } from '@renderer/lib/yup'

const validationSchema = Yup.object({
  name: Yup.string()
    .required('Name is required')
    .min(3, 'Name must be at least 3 characters long')
    .max(50, 'Name must not exceed 50 characters'),
  email: Yup.string().email('Invalid email address').optional(),
  phone: Yup.string()
    .required('Phone number is required')
    .matches(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits'),
  assigned_staff: Yup.object({
    sid: Yup.string().required(),
    name: Yup.string().required()
  }).required('Assign a staff'),
  address: Yup.string()
    .required('Address is required')
    .min(10, 'Address must be at least 10 characters long'),
  date_of_birth: Yup.string().required('Date of Birth is required'),
  gender: Yup.string()
    .required('Gender is required')
    .oneOf(['male', 'female', 'others'], 'Gender must be either "male" or "female" or "others"'),
  medical_issues: Yup.string()
    .optional()
    .max(200, 'Medical issues description cannot exceed 200 characters'),
  photo_url: fileOrStringSchema
})

const AddVisitorModal = ({
  onClose,
  open,
  edit
}: {
  open: boolean
  onClose(): void
  edit?: {
    data: VisitorData['data']
  }
}) => {
  const user = useAppSelector((s) => s.auth.user)
  const [loading, setLoading] = React.useState(false)
  const dispatch = useAppDispatch()
  const staffs = useAppSelector((s) => s.staffs.staffs)

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: edit?.data?.name ?? '',
      email: edit?.data?.email ?? '',
      gender: edit?.data?.gender ?? '',
      phone: edit?.data?.phone ?? '',
      assigned_staff: edit?.data?.assigned_staff ?? undefined,
      address: edit?.data?.address ?? '',
      date_of_birth: edit?.data?.date_of_birth ?? '',
      medical_issues: edit?.data?.medical_issues ?? '',
      photo_url: edit?.data?.photo_url ?? ''
    },
    validationSchema,
    onSubmit: async () => {
      setLoading(true)
      if (!user) {
        setLoading(false)
        return
      }
      try {
        if (edit?.data) {
          console.log('Updating')
          updateVisitor(edit?.data?.created_by, edit?.data?.vid, {
            ...edit?.data,
            ...formik.values
          })
            .then(() => {
              setLoading(false)
              dispatch(asyncGetVisitors({ uid: user?.uid }))
              // formik.resetForm()
              onClose?.()
            })
            .catch(() => {
              setLoading(false)
              // formik.resetForm()
              onClose?.()
            })
        } else {
          console.log('Adding')
          addVisitor({
            created_by: user?.uid as string,
            created_on: new Date().toISOString(),
            ...formik.values,
            assigned_staff: {
              name: formik.values.assigned_staff?.name as string,
              sid: formik.values.assigned_staff?.sid as string
            }
          })
            .then(() => {
              setLoading(false)
              dispatch(asyncGetVisitors({ uid: user?.uid }))
              // formik.resetForm()
              onClose?.()
            })
            .catch(() => {
              setLoading(false)
              // formik.resetForm()
              onClose?.()
            })
        }
      } catch (err) {
        console.error(err)
        setLoading(false)
      }
    }
  })

  React.useEffect(() => {
    if (!edit) formik.resetForm()
  }, [])

  const keys = Object.keys(formik.values)
  console.log(formik.errors)
  return (
    <Dialog
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
        '.MuiPaper-root': {
          width: 'calc(100% - 24px)',
          height: 'calc(100% - 24px)',
          maxHeight: 'calc(100vh / 1.5)',
          maxWidth: '420px',
          padding: '12px 18px',
          display: 'flex',
          flexDirection: 'column',
          form: {
            width: '100%',
            margin: 'auto',
            display: 'flex',
            flexDirection: 'column'
          }
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
      </Modal>{' '}
      <form onSubmit={formik.handleSubmit}>
        <div className="header">
          <CustomTypography variant={'h6'}>Add New Visitor</CustomTypography>
          <CustomIcon name={'LUCIDE_ICONS'} onClick={onClose} icon={'LuX'} color={grey['700']} />
        </div>
        {keys.map((k, idx) =>
          k.includes('gender') ? (
            <>
              <CustomTypography marginTop={'12px'} color={grey['500']}>
                {k !== 'gender' ? 'Assign Staff' : k}
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
          ) : k.includes('assigned_staff') ? (
            <>
              <CustomTypography marginTop={'12px'} color={grey['500']}>
                Assign Staff
              </CustomTypography>
              <Select
                value={formik.values.assigned_staff?.sid ?? ''}
                onChange={(e) => {
                  const staff = staffs.filter((s) => s.data?.sid === e.target.value)[0]
                  if (!staff) {
                    infoToast('Refresh and Try Again')
                    return
                  }
                  console.log(staff)
                  formik.setFieldValue('assigned_staff', {
                    name: staff.data.name,
                    sid: staff.data.sid
                  })
                }}
                sx={{
                  marginTop: '12px',
                  width: '100%'
                }}
              >
                {staffs.map((e) => (
                  <MenuItem value={e.data.sid}>{e.data?.name}</MenuItem>
                ))}
              </Select>
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
              <CustomTypography
                marginTop={'12px'}
                color={!!formik.errors['photo_url'] ? 'red' : grey['500']}
              >
                Upload Image*
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

export default AddVisitorModal
