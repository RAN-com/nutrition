import { Button, Dialog, styled } from '@mui/material'
import { grey } from '@mui/material/colors'
import CustomIcon from '@renderer/components/icons'
import CustomTypography from '@renderer/components/typography'
import { useAppSelector } from '@renderer/redux/store/hook'
import moment from 'moment'
import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const BillingModal = () => {
  const orderId = useParams()?.orderId
  const user = useAppSelector((s) => s.auth?.user)
  const currentData = useAppSelector(
    (s) => s.orders.orders?.filter((e) => e.orderId === orderId)[0]
  )
  const navigate = useNavigate()
  const total = currentData?.products.reduce(
    (sum, { detail }) =>
      sum +
      detail.price * currentData?.products.filter((e) => e.detail.pid === detail.pid)[0].quantity,
    0
  )

  React.useEffect(() => {
    window.electron?.ipcRenderer?.on('pdfGeneratedError', (_event, path) => {
      console.log('Error', path)
    })
    window.electron?.ipcRenderer?.on('pdfGeneratedSucc', (_event, path) => {
      console.log('Path', path)
      alert(`Invoice has been saved in ${path}`)
    })
  }, [])

  return (
    <Dialog
      className="billing-modal"
      open={true}
      onClose={() => navigate('/billing')}
      sx={{
        borderRadius: '0px',
        backgroundColor: 'transparent',
        '.MuiPaper-root': {
          borderRadius: '0px',
          width: 'calc(100% - 24px)',
          maxWidth: '420px',
          backgroundColor: 'transparent',
          boxShadow: 'none'
        },
        ['@media print']: {
          '.CustomIcon': {
            display: 'none'
          },
          button: {
            display: 'none'
          },
          '.MuiButton-root': {
            display: 'none'
          }
        }
      }}
    >
      <div className="billing-modal">
        <InvoiceContainer>
          <Header>
            <CustomTypography sx={{ '& span': { fontWeight: 'bold' }, gap: '4px' }}>
              Invoice <span>{currentData?.orderId}</span>
            </CustomTypography>
            <CustomIcon
              name="LUCIDE_ICONS"
              icon="LuX"
              color={grey[600]}
              onClick={() => navigate('/billing')}
            />
          </Header>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '40px 1fr',
              padding: '24px 0px',
              gap: '12px',
              alignItems: 'center'
            }}
          >
            {user?.photo_url && (
              <img
                src={user?.photo_url}
                alt={user?.name}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px'
                }}
              />
            )}
            {/* <Avatar src={user?.photo_url ?? undefined} alt={user?.name ?? undefined} /> */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <CustomTypography fontWeight={'bold'}>{user?.name}</CustomTypography>
              <CustomTypography variant={'body2'} fontWeight={'medium'} color={grey[400]}>
                {user?.center_address}
              </CustomTypography>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr .5fr auto' }}>
            <>
              <CustomTypography sx={{ margin: '12px 0px' }} fontWeight={'bold'} color={grey['400']}>
                Product Name
              </CustomTypography>
              <CustomTypography sx={{ margin: '12px 0px' }} fontWeight={'bold'} color={grey['400']}>
                Quantity
              </CustomTypography>
              <CustomTypography sx={{ margin: '12px 0px' }} fontWeight={'bold'} color={grey['400']}>
                Price
              </CustomTypography>
            </>
            {currentData?.products?.map((e) => (
              <>
                <CustomTypography sx={{ margin: '8px 0px' }} fontWeight={'bold'}>
                  {e.detail?.name}
                </CustomTypography>
                <CustomTypography sx={{ margin: '8px auto' }}>{e.quantity}</CustomTypography>
                <CustomTypography sx={{ margin: '8px auto' }}>₹ {e.detail?.price}</CustomTypography>
              </>
            ))}
            <CustomTypography sx={{ margin: '0px 0px' }} fontWeight={'bold'}>
              Total
            </CustomTypography>
            <>&nbsp;</>
            <CustomTypography sx={{ margin: '0px 0px' }}>₹ {total}</CustomTypography>
          </div>
          <div>
            <CustomTypography gap={'8px'} marginTop={'24px'}>
              Purchased Date:{' '}
              <span>{moment(currentData?.order_on).format('DD/mm/yyyy hh:mm')}</span>
            </CustomTypography>
            <CustomTypography gap={'8px'}>
              Purchased Time: <span>{moment(currentData?.order_on).format('hh:mm A')}</span>
            </CustomTypography>
          </div>
        </InvoiceContainer>
      </div>
      <ButtonContainer>
        <Button variant="outlined" onClick={() => navigate('/billing', { replace: true })}>
          Back
        </Button>
        <Button
          sx={{ border: 'none' }}
          variant="contained"
          // disabled={true}
          disableElevation
          disableFocusRipple
          disableRipple
          disableTouchRipple
          onClick={() => {
            const printDocument = document.querySelector('.billing-modal')
            console.log(printDocument?.innerHTML)
            if (printDocument) {
              window.electron?.ipcRenderer.send(
                'generatePdf',
                printDocument?.getHTML(),
                `${moment(currentData?.order_on).format('DD_MM_YYYY hh:mm: A').toString()}`
              )
            }
          }}
        >
          Download Invoice
        </Button>
      </ButtonContainer>
    </Dialog>
  )
}

export default BillingModal

const Header = styled('div')({
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between'
})

const InvoiceContainer = styled('div')({
  width: '100%',
  height: 'max-content',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: 'white',
  padding: '12px 18px',
  borderRadius: '12px'
})

const ButtonContainer = styled('div')({
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  gap: 24,
  alignItems: 'center',
  padding: '12px',
  backgroundColor: 'white',
  marginTop: '12px',
  borderRadius: '12px',
  justifyContent: 'center',
  '.MuiButton-root': {
    flex: 1
  }
})
