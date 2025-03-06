import { Button, Dialog, Divider, Modal, styled } from '@mui/material'
import CustomTypography from '@renderer/components/typography'
import React from 'react'
import AppointmentSidebar from './sidebar'
import AppointmentTemplate from './template'
import PageHeader from '@renderer/components/header/pageHeader'
import CustomIcon from '@renderer/components/icons'
import { useAppSelector, useAppDispatch } from '@renderer/redux/store/hook'
import { asyncInitCardUpdate, resetEditor } from '@renderer/redux/features/user/card'
import { Link } from 'react-router-dom'
import { SERVER_DOMAIN } from '@renderer/constants/value'
import { addOrUpdateCardDetails } from '@renderer/firebase/card'
import { errorToast, successToast } from '@renderer/utils/toast'

type Props = {
  open: boolean
  onClose(): void
}

const AppointmentsCard = ({ onClose, open }: Props) => {
  const [showCancelModal, setShowCancelModal] = React.useState(false)
  const dispatch = useAppDispatch()
  const staff = useAppSelector((s) => s.staffs.current_staff)
  const createCard = useAppSelector((s) => s.card.editor)
  const assigned_domain = useAppSelector((s) => s.staffs?.current_staff_domain)

  const [loading, setLoading] = React.useState(false)
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
                {staff?.data.assigned_subdomain && (
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
                )}
                <Modal open={loading}>
                  <div></div>
                </Modal>
                <Button
                  disabled={!Boolean(assigned_domain)}
                  disableElevation
                  disableFocusRipple
                  disableRipple
                  disableTouchRipple
                  loading={loading}
                  onClick={async () => {
                    setLoading(true)
                    if (!staff?.data) {
                      setLoading(false)
                      return
                    }
                    const upload = await addOrUpdateCardDetails(staff?.data?.sid, createCard?.data)
                    if (upload?.status) {
                      successToast('Updated Successfully')
                      console.log('Updated')
                    } else {
                      console.log('Error')
                      errorToast('Something went wrong. Try Again later')
                    }
                    setLoading(false)
                  }}
                >
                  <CustomTypography
                    color={!assigned_domain ? 'grey' : 'primary'}
                    textTransform={'none'}
                  >
                    {createCard?.data_type === 'UPDATE' ? 'update' : 'Create'}
                  </CustomTypography>
                </Button>
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
