import {
  Box,
  Chip,
  Dialog,
  FormControl,
  InputLabel,
  MenuItem,
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

type Props = {
  open: boolean
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
  from_date: Yup.date().required('From date is required'),
  to_date: Yup.date()
    .required('To date is required')
    .min(Yup.ref('from_date'), 'To date must be after from date')
})

const ITEM_HEIGHT = 48
const ITEM_PADDING_TOP = 8

export default function CreateMarathon({ onClose }: Props) {
  const customers = useAppSelector((s) => s.customer.customers)
  const dispatch = useAppDispatch()
  const user = useAppSelector((s) => s.auth.user)

  React.useEffect(() => {
    if (user?.uid) {
      dispatch(asyncGetCustomers({ uid: user?.uid }))
    }
  }, [])

  const formik = useFormik({
    initialValues: {
      customers: [] as MarathonData['customers'],
      type: 'weight_loss',
      from_date: '',
      to_date: ''
    },
    validationSchema,
    onSubmit() {}
  })

  return (
    <Dialog
      open={true}
      onClose={onClose}
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
      {/* <Modal open={loading}>
        <div></div>
      </Modal> */}
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
              formik.resetForm()
              onClose()
            }}
          />
        </div>
        <div>
          <LocalizationProvider key={'date'} dateAdapter={AdapterMoment}>
            <CustomTypography color={grey['500']} marginTop={'12px'}>
              Select start date
            </CustomTypography>
            <DatePicker
              onChange={(e) => {
                if (e?.format('DD/MM/YYYY') === moment().format('DD/MM/YYYY')) {
                  alert('You cannot select today date')
                  return
                }
                formik.setFieldValue('from_date', e?.toISOString())
              }}
              name={'from_date'}
              disablePast={true}
              disableHighlightToday={true}
              format="DD-MM-YYYY"
              value={moment(formik.values.from_date)}
            />
          </LocalizationProvider>

          <LocalizationProvider key={'date'} dateAdapter={AdapterMoment}>
            <CustomTypography color={grey['500']} marginTop={'12px'}>
              Select End Date
            </CustomTypography>
            <DatePicker
              onChange={(e) => {
                if (e && moment(e).diff(moment(formik.values.to_date), 'days') < 7) {
                  alert('End date must be at least 7 days after the start date')
                  return
                }
                formik.setFieldValue('to_date', e?.toISOString())
              }}
              name={'to_date'}
              disablePast={true}
              disableHighlightToday={true}
              format="DD-MM-YYYY"
              value={moment(formik.values.to_date)}
            />
          </LocalizationProvider>

          <FormControl sx={{ m: 1, width: 300 }}>
            <InputLabel id="demo-multiple-chip-label">Chip</InputLabel>
            <Select
              labelId="demo-multiple-chip-label"
              id="demo-multiple-chip"
              multiple
              value={formik.values.customers.map((e) => e)}
              onChange={() => {}}
              input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value.cid} label={value.name} />
                  ))}
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
              {customers.map((name) => (
                <MenuItem key={name.cid} value={name.cid}>
                  {name.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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
