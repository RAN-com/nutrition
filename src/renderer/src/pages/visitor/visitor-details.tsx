import { Avatar, Button, IconButton, styled } from '@mui/material'
import { grey } from '@mui/material/colors'
import RecordChart from '@renderer/components/chart'
import CustomIcon from '@renderer/components/icons'
import CustomTypography from '@renderer/components/typography'
import { asyncGetVisitors, setCurrentVisitor } from '@renderer/redux/features/user/visitors'
import { useAppSelector, useAppDispatch } from '@renderer/redux/store/hook'
import { VisitorData } from '@renderer/types/visitor'
// import { CustomerRecords } from '../../types/customers'
import { convertVisitorToCustomer } from '@renderer/firebase/visitor'
import { errorToast } from '@renderer/utils/toast'
import React from 'react'
import UpdateVisitorRecord from './record'
import toast from 'react-hot-toast'
import WhatsAppInput from './whatsapp-input'

type Props = { visitor: VisitorData | null }

const VisitorDetails = ({ visitor }: Props) => {
  const data = visitor?.data ?? null
  const records = (visitor?.records ?? []).map(
    (e) => e.data
  ) as VisitorData['records'][number]['data'][]
  const dispatch = useAppDispatch()
  const admin = useAppSelector((s) => s.auth.user)
  const [show, setShow] = React.useState(false)
  const [showMsgInput, setShowMsgInput] = React.useState(false)

  return (
    <div>
      <UpdateVisitorRecord open={show} onClose={() => setShow(false)} />
      <Header>
        <div>&nbsp;</div>
        <CustomIcon
          name="LUCIDE_ICONS"
          icon={'LuX'}
          color={grey['600']}
          onClick={() => dispatch(setCurrentVisitor(''))}
        />
      </Header>
      <WhatsAppInput
        onClose={() => setShowMsgInput(false)}
        open={showMsgInput}
        phone={visitor?.data.phone}
      />
      <Content sx={{}}>
        <Profile>
          <Avatar
            src={data?.photo_url ?? undefined}
            alt={data?.name}
            sx={{
              width: '120px',
              height: '120px',
              border: '1px solid'
            }}
          />
          <CustomTypography variant="h5" marginTop={'12px'}>
            {data?.name}
          </CustomTypography>
          <CustomTypography variant="body2" lineHeight={'1'}>
            {data?.email}
          </CustomTypography>

          <CustomTypography variant="body2" marginTop={'8px'} lineHeight={'1'}>
            +91-{data?.phone}
          </CustomTypography>
        </Profile>
        <div
          style={{
            height: 'auto',
            display: 'flex',
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            marginTop: '24px',
            marginBottom: '8px'
          }}
        >
          <IconButton onClick={() => setShowMsgInput(true)}>
            <CustomIcon name="FONT_AWESOME_6" icon="FaWhatsapp" stopPropagation={false} />
          </IconButton>
          <Button variant="outlined" sx={{ flex: 1 }} onClick={() => setShow(true)}>
            Add Record
          </Button>
        </div>
        {/* <Toaster /> */}
        <Button
          variant="contained"
          color="primary"
          disabled={records?.length === 0}
          disableRipple={true}
          disableElevation={true}
          disableFocusRipple={true}
          disableTouchRipple={true}
          onClick={async () => {
            // if (!confirm('Are you sure you want to convert this visitor to customer?')) return
            console.log('COnverting')
            const convert = await convertVisitorToCustomer(
              admin?.uid as string,
              data?.vid as string
            )

            if (!convert?.status) {
              toast.error(convert?.message as string, {})
              return
            }

            if (convert) {
              if (convert.status === 'success') {
                dispatch(
                  asyncGetVisitors({
                    uid: admin?.uid as string,
                    limit: 100,
                    page: 1
                  })
                )
                dispatch(setCurrentVisitor(''))
              } else if (convert.status === 'error') {
                errorToast(convert.message)
              } else if (convert.status === 'exists') {
                errorToast('Visitor already exists in customers')
              }
            } else {
              errorToast('Failed to convert visitor to customer')
            }
          }}
        >
          {'Convert to Customer'}
        </Button>
        <CustomTypography fontSize={'12px'} textAlign={'center'} margin={'auto'}>
          {records.length >= 1
            ? `By converting visitor to customer, all the records will be moved to customer section and
          you can manage them from there.`
            : 'Minimum one record is needed to convert to customer'}
        </CustomTypography>
      </Content>
      <Content>
        <RecordChart data={records} type="visitor" />
      </Content>
    </div>
  )
}

export default VisitorDetails

const Header = styled('div')({
  width: '100%',
  height: '60px',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 18px'
})

// const Container = styled('div')({
//   width: '100%',
//   display: 'flex',
//   flexDirection: 'column',
//   // padding: '0px 18px',
//   borderRadius: '12px 0px 0px 12px',
//   marginBottom: '12px'
// })

const Content = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  width: 'calc(100% - 32px)',
  margin: '0 auto',
  padding: '32px 24px',
  borderRadius: '12px',
  backgroundColor: 'white',
  marginBottom: '12px'
})

const Profile = styled('div')({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center'
})
