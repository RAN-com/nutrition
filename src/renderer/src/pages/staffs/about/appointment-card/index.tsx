import { Button, debounce, Dialog, Divider, Modal, styled } from '@mui/material'
import CustomTypography from '@renderer/components/typography'
import React from 'react'
import AppointmentSidebar from './sidebar'
import AppointmentTemplate from './template'
import PageHeader from '@renderer/components/header/pageHeader'
import CustomIcon from '@renderer/components/icons'
import { useAppSelector, useAppDispatch } from '@renderer/redux/store/hook'
import { asyncInitCardUpdate, resetEditor } from '@renderer/redux/features/user/card'
import { Link } from 'react-router-dom'
import * as yup from 'yup'
import { useFormik } from 'formik'
import { assignOrUpdateDomain } from '@renderer/firebase/domain'
import {
  appendSubdomainToRecord,
  checkSubdomain,
  setSubDomainToStaff
} from '@renderer/firebase/appointments'
import { getStaff } from '@renderer/firebase/staffs'
import {
  asyncGetCurrentStaffDomainData,
  setCurrentStaff
} from '@renderer/redux/features/user/staff'
import moment from 'moment'
import { blue } from '@mui/material/colors'
import CustomTextInput from '@renderer/components/text-input'
import { SERVER_DOMAIN } from '@renderer/constants/value'
import { addOrUpdateCardDetails } from '@renderer/firebase/card'
import { successToast } from '@renderer/utils/toast'

type Props = {
  open: boolean
  onClose(): void
}

const validationSchema = yup.object({
  domain: yup
    .string()
    .matches(/^[a-zA-Z0-9_]+$/, 'Only alphanumeric characters and underscores are allowed.')
    .min(4, 'Domain must be at least 3 characters')
    .max(16, 'Domain cannot exceed 50 characters')
    .required('Domain is required')
})

const AppointmentsCard = ({ onClose, open }: Props) => {
  const [showCancelModal, setShowCancelModal] = React.useState(false)
  const dispatch = useAppDispatch()
  const staff = useAppSelector((s) => s.staffs.current_staff)
  const createCard = useAppSelector((s) => s.card.editor)
  const [assign, setAssign] = React.useState(false)
  const user = useAppSelector((s) => s.auth.user)
  const assigned_domain = useAppSelector((s) => s.staffs?.current_staff_domain)

  const formik = useFormik({
    initialValues: {
      domain: ''
    },
    validationSchema,
    async onSubmit(values) {
      if (!staff) return alert('Staff Not found. Try Again')
      if (confirm('You cannot change this name. Do you want to continue ?')) {
        await assignOrUpdateDomain(values.domain, {
          created_by: user?.uid as string,
          created_on: moment().format('YYYY-MM-DD'),
          is_active: true,
          staff_id: staff?.data?.sid
        })

        await setSubDomainToStaff(staff?.data, values.domain)
        await appendSubdomainToRecord(user?.uid as string, values.domain, staff?.data)
        const d = await getStaff(user?.uid as string, staff?.data?.sid as string)
        dispatch(
          asyncGetCurrentStaffDomainData({
            domain: values.domain
          })
        )
        if (d.data) {
          dispatch(setCurrentStaff(d?.data))
        }
      }
    }
  })

  const domainExists = async (e: string) => {
    if (!user) return false
    const res = await Promise.resolve(checkSubdomain(user?.uid, e))
    if (res.status) {
      formik.setFieldError('domain', 'Domain Already Exists')
      return true
    } else {
      return false
    }
  }

  const [loading, setLoading] = React.useState(false)
  const [isAvailable, setIsAvailable] = React.useState(false)

  React.useEffect(() => {
    if (staff?.data && open) {
      dispatch(asyncInitCardUpdate({ sid: staff?.data?.sid }))
    }
  }, [staff])

  return (
    <>
      <Dialog
        open={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        sx={{
          '.MuiPaper-root': {
            width: '100%',
            maxWidth: '420px',
            padding: '12px 24px'
          }
        }}
      >
        <div>
          <CustomTypography variant={'body1'} paddingBottom={'12px'} fontWeight={'bold'}>
            Do you want to exit ??
          </CustomTypography>
        </div>
        <Divider />
        <div>
          <CustomTypography variant={'body1'} padding={'12px 0px'}>
            You're updates will not be saved. Make sure to update everything before you cancel
          </CustomTypography>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant={'contained'} onClick={() => setShowCancelModal(false)}>
            Continue Editing
          </Button>
          <Button
            onClick={() => {
              onClose()
              dispatch(resetEditor())
              setShowCancelModal(false)
            }}
          >
            Okay, Exit
          </Button>
        </div>
      </Dialog>
      <Modal open={open} onClose={() => setShowCancelModal(true)}>
        <Container>
          <PageHeader
            sx={{
              gridColumn: '1 / span 2',
              gridRow: '1',
              padding: '0px'
            }}
            start={
              <>
                <Button
                  startIcon={<CustomIcon name={'LUCIDE_ICONS'} icon="LuArrowLeft" />}
                  disableElevation
                  disableFocusRipple
                  disableRipple
                  disableTouchRipple
                  onClick={() => setShowCancelModal(true)}
                >
                  <CustomTypography textTransform={'none'}>Exit</CustomTypography>
                </Button>
              </>
            }
            end={
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row'
                }}
              >
                {staff?.data.assigned_subdomain ? (
                  <Link
                    to={`${import.meta.env.DEV ? 'http://' : 'https://'}${staff?.data?.assigned_subdomain}.${SERVER_DOMAIN}`}
                    target="_blank"
                    rel={'noreferrer'}
                  >
                    <Button
                      variant={'text'}
                      startIcon={<CustomIcon name="LUCIDE_ICONS" icon={'LuLink'} />}
                      disableElevation
                      disableFocusRipple
                      disableRipple
                      disableTouchRipple
                    >
                      <CustomTypography variant="body2" textTransform={'none'}>
                        {staff?.data?.assigned_subdomain}
                      </CustomTypography>
                    </Button>
                  </Link>
                ) : assign ? (
                  <div
                    style={{
                      display: 'flex'
                    }}
                  >
                    {formik.values.domain.length > 0 ? (
                      <CustomIcon
                        name="LUCIDE_ICONS"
                        icon="LuX"
                        onClick={() => {
                          formik.resetForm()
                          setLoading(false)
                          setIsAvailable(false)
                        }}
                        color={'grey'}
                        sx={{ marginRight: '8px' }}
                      />
                    ) : (
                      <CustomIcon
                        name="LUCIDE_ICONS"
                        icon="LuArrowLeft"
                        onClick={() => {
                          formik.resetForm()
                          setLoading(false)
                          setIsAvailable(false)
                          setAssign(false)
                        }}
                        color={'grey'}
                        sx={{ marginRight: '8px' }}
                      />
                    )}
                    <CustomTextInput
                      formProps={{
                        sx: {
                          maxWidth: '340px',
                          '.MuiOutlinedInput-root': {
                            paddingRight: '4px'
                          }
                        }
                      }}
                      input={{
                        size: 'small',
                        placeholder: 'Enter Domain Name',
                        name: 'domain',
                        value: formik.values.domain,
                        color: assigned_domain ? 'success' : 'error',
                        error: (formik.touched.domain && Boolean(formik.errors.domain))?.valueOf(),
                        helperText: formik.touched.domain && formik.errors.domain,
                        onChange: async (e) => {
                          const value = e.target.value.split(' ').join('')
                          formik.setFieldValue('domain', value)
                          if (value.length >= 4) {
                            setLoading(true)
                            debounce(async () => {
                              setIsAvailable(!(await domainExists(value)))
                              setLoading(false)
                            }, 600)()
                          }
                        },
                        slotProps: {
                          input: {
                            endAdornment: (
                              <div
                                style={{
                                  display: 'flex'
                                }}
                              >
                                {
                                  <CustomIcon
                                    name={'LUCIDE_ICONS'}
                                    icon={'LuArrowRight'}
                                    color={'white'}
                                    disabled={!assigned_domain}
                                    onClick={() => {
                                      formik.submitForm()
                                    }}
                                    sx={{
                                      backgroundColor: blue['700'],
                                      width: '32px',
                                      height: '32px',
                                      marginLeft: '12px',
                                      borderRadius: '4px'
                                    }}
                                  />
                                }
                                {/* </Button> */}
                              </div>
                            )
                          }
                        }
                      }}
                    />
                  </div>
                ) : (
                  <Button
                    variant="text"
                    disableElevation
                    disableRipple
                    disableFocusRipple
                    disableTouchRipple
                    disabled={!assigned_domain}
                    onClick={() => {
                      setAssign(true)
                    }}
                    startIcon={
                      <CustomIcon
                        stopPropagation={false}
                        name={'IONICONS'}
                        icon="IoIosLink"
                        color="primary"
                      />
                    }
                  >
                    <CustomTypography textTransform={'none'}>Assign Domain</CustomTypography>
                  </Button>
                )}
                {!assign && (
                  <Button
                    disabled={!Boolean(assigned_domain)}
                    disableElevation
                    disableFocusRipple
                    disableRipple
                    disableTouchRipple
                    onClick={async () => {
                      setLoading(true)
                      if (!staff?.data) {
                        setLoading(false)
                        return
                      }
                      const upload = await addOrUpdateCardDetails(
                        staff?.data?.sid,
                        createCard?.data
                      )
                      console.log(loading, upload)
                      if (upload?.status) {
                        successToast(upload.message)
                      }
                      setLoading(false)
                    }}
                  >
                    <CustomTypography
                      color={!assigned_domain ? 'grey' : 'primary'}
                      textTransform={'none'}
                    >
                      {createCard?.data_type === 'UPDATE' ? 'update' : 'Create asdfasdf'}
                    </CustomTypography>
                  </Button>
                )}
              </div>
            }
          />
          <AppointmentSidebar />
          <AppointmentTemplate />
        </Container>
      </Modal>
    </>
  )
}

export default AppointmentsCard

const Container = styled('div')({
  width: '100%',
  height: '100%',
  display: 'grid',
  gridTemplateColumns: '380px 1fr',
  gridTemplateRows: 'auto 1fr',
  backgroundColor: 'white',
  gap: '12px',
  padding: '12px'
})
