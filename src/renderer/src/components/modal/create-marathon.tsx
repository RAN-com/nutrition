import {
  Box,
  Button,
  Chip,
  Dialog,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Modal,
  OutlinedInput,
  Select,
  styled
} from '@mui/material'
import { useAppSelector, useAppDispatch } from '@renderer/redux/store/hook'
import { useFormik } from 'formik'
import React from 'react'
import * as Yup from 'yup'
import CustomTypography from '../typography'
import CustomIcon from '../icons'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import { grey } from '@mui/material/colors'
import moment from 'moment'

import { MarathonData } from '@renderer/types/marathon'
import { asyncGetCustomers } from '@renderer/redux/features/user/customers'
import { createMarathon, deleteMarathon, updateInitMarathon } from '@renderer/firebase/marathon'
import { errorToast, successToast } from '@renderer/utils/toast'

type Props = {
  open: boolean
  edit?: MarathonData
  onClose(): void
}

// Define Yup Validation Schema
const validationSchema = Yup.object().shape({
  customers: Yup.array()
    .of(
      Yup.object().shape({
        cid: Yup.string().required('Customer ID is required'),
        name: Yup.string().required('Name is required'),
        dob: Yup.string().required('Date of birth is required'),
        age: Yup.number().required('Age is required').min(1, 'Age must be at least 1')
      })
    )
    .min(1, 'At least one customer is required'),
  type: Yup.string().oneOf(['weight_loss', 'weight_gain'], 'Invalid type'),
  from_date: Yup.string().required('Date is required'),
  to_date: Yup.string().required('Date is required')
})

const ITEM_HEIGHT = 48
const ITEM_PADDING_TOP = 8

const marathon_type = [
  { label: 'Weight Loss', id: 'weight_loss' },
  { label: 'Weight Gain', id: 'weight_gain' }
]

export default function CreateMarathon({ onClose, open, edit }: Props) {
  const customers = useAppSelector((s) => s.customer.customers)
  const dispatch = useAppDispatch()
  const user = useAppSelector((s) => s.auth.user)

  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (user?.uid) {
      dispatch(asyncGetCustomers({ uid: user?.uid }))
    }
  }, [])

  const formik = useFormik({
    enableReinitialize: !!edit,
    initialValues: {
      customers: edit?.customers ?? ([] as MarathonData['customers']),
      type: edit?.type ?? ('weight_loss' as 'weight_loss' | 'weight_gain'),
      from_date: edit?.from_date ?? moment().set('days', 3).toString(),
      to_date: edit?.to_date ?? moment().set('days', 10).toString()
    },
    validationSchema,
    async onSubmit(values, { resetForm }) {
      setLoading(true)
      if (edit) {
        const create = await updateInitMarathon({ ...edit, ...values })
        if (create.status) {
          setLoading(false)
          onClose()
          resetForm()
          successToast('Marathon Created Successfully')
        } else {
          setLoading(false)
          resetForm()
          onClose()
          errorToast(create?.message)
        }
        return
      }
      const create = await createMarathon(user?.uid as string, values)
      if (create.status) {
        setLoading(false)
        onClose()
        resetForm()
        successToast('Marathon Created Successfully')
      } else {
        setLoading(false)
        resetForm()
        onClose()
        errorToast(create?.message)
      }
    }
  })

  const minFromDate = moment().set('days', 4)
  const minToDate = moment(minFromDate).set('days', 10)
  console.log(formik.errors, formik.values)

  return (
    <Dialog
      open={open}
      onClose={() => {
        onClose()
        formik.resetForm()
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
      <Container>
        <div
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <CustomTypography style={{ alignSelf: 'flex-start', width: 'fit-content' }} variant="h6">
            {'Fill in the details'}
          </CustomTypography>
          <CustomIcon
            name="LUCIDE_ICONS"
            icon="LuX"
            color={'black'}
            onClick={() => {
              onClose()
              formik.resetForm()
            }}
          />
        </div>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <CustomTypography color={grey['500']} marginTop={'12px'}>
              Select start date
            </CustomTypography>
            <DatePicker
              disabled={!!edit}
              defaultValue={edit ? moment(edit?.from_date) : undefined}
              minDate={minFromDate}
              onChange={(e) => {
                if (e?.format('DD/MM/YYYY') === moment().format('DD/MM/YYYY')) {
                  errorToast('You cannot select today date')
                  return
                }
                formik.setFieldValue('from_date', e?.toDate().toLocaleString())
              }}
              name={'from_date'}
              disablePast={true}
              disableHighlightToday={true}
              format="DD/MM/YYYY"
              // value={formik.values.from_date?.length > 1 ? moment(formik.values.from_date) : null}
            />
          </LocalizationProvider>

          <LocalizationProvider dateAdapter={AdapterMoment}>
            <CustomTypography color={grey['500']} marginTop={'12px'}>
              Select End Date
            </CustomTypography>
            <DatePicker
              disabled={!!edit}
              defaultValue={edit ? moment(edit?.to_date) : undefined}
              onChange={(e) => {
                if (e && moment(e).diff(moment(formik.values.from_date), 'days') < 6) {
                  errorToast('End date must be at least 7 days after the start date')
                  return
                }
                formik.setFieldValue('to_date', e?.toDate().toLocaleString())
              }}
              closeOnSelect
              minDate={minToDate}
              name={'to_date'}
              disablePast={true}
              disableHighlightToday={true}
              format="DD/MM/YYYY"
              // value={formik.values.to_date?.length > 1 ? moment(formik.values.to_date) : null}
            />
          </LocalizationProvider>

          <FormControl sx={{ width: '100%', margin: '16px 0px' }}>
            <InputLabel id="chip">Select Customers</InputLabel>
            <Select
              labelId="chip"
              id="multiple-chip"
              multiple
              value={formik.values.customers.map((e) => e.cid)}
              onChange={(evt) => {
                if (typeof evt.target.value === 'string') return

                const selectedCustomers = evt.target.value
                  .map((cid) => {
                    const customer = customers.find((e) => e.cid === cid)
                    const age = moment().diff(moment(customer?.date_of_birth), 'years', false)
                    if (age < 12) {
                      errorToast(`Cannot able to add ${customer?.name} as age below 12`)
                      return
                    }
                    return customer
                      ? {
                          cid: customer.cid,
                          name: customer.name,
                          dob: customer.date_of_birth,
                          age: moment().diff(moment(customer.date_of_birth), 'years', false)
                        }
                      : null
                  })
                  .filter(Boolean)
                formik.setFieldValue('customers', selectedCustomers)
              }}
              defaultValue={edit?.customers?.map((e) => e?.cid) || undefined}
              input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => {
                    const data = customers?.find((e) => e?.cid === value)
                    return <Chip label={data?.name} key={value} />
                  })}
                </Box>
              )}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
                    width: 250
                  }
                }
              }}
            >
              {customers?.map((name) => (
                <MenuItem key={name.cid} value={name.cid}>
                  {name.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ width: '100%', marginBottom: '16px' }}>
            <InputLabel id="type">Goal</InputLabel>
            <Select
              labelId="type"
              id="multiple-chip"
              value={formik.values.type}
              onChange={(evt) => {
                formik.setFieldValue('type', evt.target.value)
              }}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
                    width: 250
                  }
                }
              }}
            >
              {marathon_type?.map((name) => (
                <MenuItem key={name.label} value={name.id}>
                  {name.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <div
            style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Button
              variant="contained"
              disabled={Object.keys(formik.errors).length !== 0}
              fullWidth
              sx={{ maxWidth: '320px', margin: 'auto' }}
              onClick={() => formik.submitForm()}
            >
              {edit ? 'Update' : 'Create'} Marathon
            </Button>
            {edit && (
              <IconButton
                onClick={async () => {
                  setLoading(true)
                  const del = await deleteMarathon(
                    edit?.created_by?.uid as string,
                    edit?.mid as string
                  )
                  if (del.status) {
                    successToast(del.message)
                  } else {
                    errorToast(del.message)
                  }
                  formik.resetForm()
                  onClose()
                  setLoading(false)
                }}
              >
                <CustomIcon
                  stopPropagation={false}
                  name="LUCIDE_ICONS"
                  icon="LuTrash"
                  color="red"
                />
              </IconButton>
            )}
          </div>
        </div>
      </Container>
    </Dialog>
  )
}

const Container = styled('form')({
  display: 'flex',
  flexDirection: 'column',
  gap: '18px'
})
