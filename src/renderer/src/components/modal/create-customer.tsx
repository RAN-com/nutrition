import { Backdrop, Button, Dialog, MenuItem, Select } from '@mui/material'
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
import { errorToast } from '@renderer/utils/toast'
import CustomIcon from '../icons'
import { deleteFile, uploadFiles } from '@renderer/lib/upload-img'
import { useAppSelector, useAppDispatch } from '@renderer/redux/store/hook'
import { addCustomer, updateCustomer } from '@renderer/firebase/customers'
import { asyncGetCustomers } from '@renderer/redux/features/user/customers'
import { CustomerResponse } from '@renderer/types/customers'

const validationSchema = Yup.object({
  name: Yup.string()
    .required('Name is required')
    .min(3, 'Name must be at least 3 characters long')
    .max(50, 'Name must not exceed 50 characters'),
  email: Yup.string().required('Email is required').email('Invalid email address'),
  phone: Yup.string()
    .required('Phone number is required')
    .matches(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits'),
  assigned_staff: Yup.string().required('Assign a staff'),
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
  photo_url: Yup.string().optional()
})

const CreateCustomerModal = ({
  onClose,
  open,
  edit
}: {
  open: boolean
  onClose(): void
  edit?: {
    data: CustomerResponse
  }
}) => {
  const user = useAppSelector((s) => s.auth.user)
  const [loading, setLoading] = React.useState(false)
  const dispatch = useAppDispatch()
  const staffs = useAppSelector((s) => s.staffs.staffs)
  const formik = useFormik({
    enableReinitialize: !!edit,
    initialValues: {
      name: edit?.data?.name ?? '',
      email: edit?.data?.email ?? '',
      gender: edit?.data?.gender ?? '',
      phone: edit?.data?.phone ?? '',
      address: edit?.data?.address ?? '',
      assigned_staff: edit?.data?.assigned_staff?.sid ?? '',
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
          updateCustomer(edit?.data?.created_by.uid, edit?.data?.cid, {
            ...edit?.data,
            ...formik.values,
            assigned_staff: {
              name: formik.values.assigned_staff,
              sid: formik.values.assigned_staff
            }
          })
            .then(() => {
              setLoading(false)
              dispatch(asyncGetCustomers({ uid: user?.uid, limit: 20, page: 1 }))
              formik.resetForm()
              onClose?.()
            })
            .catch(() => {
              setLoading(false)
              formik.resetForm()
              onClose?.()
            })
        } else {
          addCustomer({
            created_by: {
              uid: user?.uid
            },
            available_limit: user?.subscription?.total_customers as number,
            ...formik.values,
            assigned_staff: {
              name: formik.values.assigned_staff,
              sid: formik.values.assigned_staff
            }
          })
            .then(() => {
              setLoading(false)
              dispatch(asyncGetCustomers({ uid: user?.uid, limit: 20, page: 1 }))
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

  React.useEffect(() => {
    if (Object.keys(formik.errors).length > 0 && !formik.dirty) {
      Object.keys(formik.errors).map((e) => errorToast(e))
    }
  }, [formik.errors])

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
          maxHeight: 'calc(100% - 24px)',
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
      <Backdrop open={loading} sx={{ position: 'fixed', zIndex: 100000000 }} />
      <form onSubmit={formik.handleSubmit}>
        <div className="header">
          <CustomTypography variant={'h6'}>Add New Customer</CustomTypography>
          <CustomIcon name={'LUCIDE_ICONS'} onClick={onClose} icon={'LuX'} color={grey['700']} />
        </div>
        {keys.map((k, idx) =>
          k.includes('gender') || k.includes('assigned_staff') ? (
            <>
              <CustomTypography marginTop={'12px'} color={grey['500']}>
                {k !== 'gender' ? 'Assign Staff' : 'gender'}
              </CustomTypography>
              <Select
                value={k === 'gender' ? formik.values.gender : formik.values.assigned_staff}
                onChange={(e) => formik.setFieldValue(k, e.target.value)}
                sx={{ marginTop: '12px', width: '100%' }}
              >
                {k === 'gender' ? (
                  <>
                    <MenuItem value={'male'}>Male</MenuItem>
                    <MenuItem value={'female'}>Female</MenuItem>
                    <MenuItem value={'others'}>Others</MenuItem>
                  </>
                ) : (
                  staffs.map((e) => <MenuItem value={e.data.sid}>{e.data?.name}</MenuItem>)
                )}
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

export default CreateCustomerModal
