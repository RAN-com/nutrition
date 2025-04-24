import {
  Avatar,
  Button,
  Dialog,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material'
import { grey } from '@mui/material/colors'
import CustomIcon from '@renderer/components/icons'
import CustomTypography from '@renderer/components/typography'
import { useAppSelector } from '@renderer/redux/store/hook'
import { OrderData } from '@renderer/types/product'
import { embedAllStyles } from '@renderer/utils/functions'
import moment from 'moment'
import { useNavigate, useParams } from 'react-router-dom'

const HEADER = ['Product Name', 'Quantity', 'Price']

const genRow = (prod: OrderData['products']) => {
  return prod.map((e) => [e?.detail?.name, e?.quantity, e?.detail?.price])
}

const getTotal = (total: number) => ['Total', '', total]
const getGst = (gst?: string) => (gst ? ['Gst', '', gst] : [])
const getOffer = (offer?: number) => (offer ? ['Discount', '', `${offer}%`] : [])

const BillingModal = () => {
  const orderId = useParams()?.orderId
  const user = useAppSelector((s) => s.auth?.user)
  const currentData = useAppSelector(
    (s) => s.orders.orders?.filter((e) => e.orderId === orderId)[0]
  )
  const navigate = useNavigate()
  const total = currentData?.total_price
  const gst = (total - parseInt(`${currentData?.buyer?.offer || 0}`) / 100) * 0.18

  const productRow = genRow(currentData?.products ?? [])
  const totalRow = getTotal(currentData?.total_price ?? 0)
  const gstRow = getGst((gst || 0).toFixed(2))
  const offerRow = getOffer(currentData?.buyer?.offer ?? 0)

  return (
    <Dialog
      open={true}
      onClose={() => navigate('/billing')}
      sx={{
        borderRadius: '0px',
        backgroundColor: 'transparent',
        '.MuiPaper-root': {
          maxHeight: '80dvh',
          width: 'calc(100% - 24px)',
          maxWidth: '420px',
          borderRadius: '12px',
          backgroundColor: '#fff',
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
      <div>
        <InvoiceContainer>
          <Header
            sx={{
              width: '100%',
              flexDirection: 'row',
              padding: ' 16px',
              position: 'sticky',
              top: 0,

              backgroundColor: '##ffffff33',
              backdropFilter: 'blur(10px)'
            }}
          >
            <CustomTypography>Product Invoice</CustomTypography>
            <CustomIcon
              name="LUCIDE_ICONS"
              icon="LuX"
              color={grey[600]}
              onClick={() => navigate('/billing')}
            />
          </Header>
          <div className="billing-modal">
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell colSpan={HEADER.length}>
                      <Header>
                        <CustomTypography sx={{ '& span': { fontWeight: 'bold' }, gap: '4px' }}>
                          Invoice <span>{currentData?.orderId}</span>
                        </CustomTypography>
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
                        <Avatar src={user?.photo_url ?? undefined} alt={user?.name ?? undefined} />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <CustomTypography fontWeight={'bold'}>{user?.name}</CustomTypography>
                          <CustomTypography
                            variant={'body2'}
                            fontWeight={'medium'}
                            color={grey[400]}
                          >
                            {user?.center_address}
                          </CustomTypography>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow
                    sx={{
                      backgroundColor: grey['200']
                    }}
                  >
                    {HEADER.map((e, i) => (
                      <TableCell align={i === 0 ? 'left' : 'center'}>{e}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {productRow.map((pr) => (
                    <TableRow>
                      {pr.map((prod, i) => (
                        <TableCell
                          align={i === 0 ? 'left' : 'center'}
                          sx={{
                            fontWeight: i === 0 ? 'medium' : 'bold'
                          }}
                        >
                          {prod}{' '}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                  <TableRow sx={{ borderBottomWidth: '0px' }}>
                    {offerRow.map((prod, i) => (
                      <TableCell
                        sx={{ paddingTop: '0px', paddingBottom: '0px', border: 'none' }}
                        align={i === 0 ? 'left' : 'center'}
                      >
                        {prod}{' '}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    {gstRow.map((prod, i) => (
                      <TableCell
                        sx={{ paddingTop: '0px', paddingBottom: '0px', border: 'none' }}
                        align={i === 0 ? 'left' : 'center'}
                      >
                        {prod}{' '}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    {totalRow.map((prod, i) => (
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          paddingTop: '4px',
                          paddingBottom: '4px'
                        }}
                        align={i === 0 ? 'left' : 'center'}
                      >
                        {prod}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
            {/* <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr .5fr auto',
                paddingBottom: '12px',
                border: '1px solid grey',
                marginTop: '12px',
                paddingLeft: '12px',
                paddingRight: '12px'
                // borderBottom: '1px solid grey'
              }}
            >
              <>
                <CustomTypography
                  sx={{ margin: '12px 0px' }}
                  fontWeight={'bold'}
                  color={grey['400']}
                >
                  Product Name
                </CustomTypography>
                <CustomTypography
                  sx={{ margin: '12px 0px' }}
                  fontWeight={'bold'}
                  color={grey['400']}
                >
                  Quantity
                </CustomTypography>
                <CustomTypography
                  sx={{ margin: '12px 0px' }}
                  fontWeight={'bold'}
                  color={grey['400']}
                >
                  Price
                </CustomTypography>
              </>
              {currentData?.products?.map((e) => (
                <>
                  <CustomTypography sx={{ margin: '8px 0px' }} fontWeight={'bold'}>
                    {e.detail?.name}
                  </CustomTypography>
                  <CustomTypography sx={{ margin: '8px auto' }}>{e.quantity}</CustomTypography>
                  <CustomTypography sx={{ margin: '8px auto' }}>
                    ₹ {e.detail?.price}
                  </CustomTypography>
                </>
              ))}
              {parseInt(`${currentData?.buyer?.offer || '0'}`) > 0 && (
                <>
                  <CustomTypography fontWeight={'bold'} color={grey['400']}>
                    Discount
                  </CustomTypography>
                  <CustomTypography fontWeight={'bold'} color={grey['400']}></CustomTypography>
                  <CustomTypography fontWeight={'bold'} color={grey['400']}>
                    {currentData?.buyer?.offer}%
                  </CustomTypography>
                </>
              )}
              {parseInt(`${currentData?.buyer?.offer || '0'}`) > 0 && (
                <>
                  <CustomTypography fontWeight={'bold'} color={grey['400']}>
                    GST
                  </CustomTypography>
                  <CustomTypography fontWeight={'bold'} color={grey['400']}></CustomTypography>
                  <CustomTypography fontWeight={'bold'} color={grey['400']}>
                    {gst}
                  </CustomTypography>
                </>
              )}
              <CustomTypography sx={{ margin: '0px 0px' }} fontWeight={'bold'}>
                Total
              </CustomTypography>
              <>&nbsp;</>
              <CustomTypography sx={{ margin: '0px 0px' }}>₹ {total}</CustomTypography>
            </div> */}
            <div>
              <CustomTypography gap={'8px'} marginTop={'24px'}>
                Purchased Date:{' '}
                <span>{moment(currentData?.order_on).format('DD/mm/yyyy hh:mm')}</span>
              </CustomTypography>
              <CustomTypography gap={'8px'}>
                Purchased Time: <span>{moment(currentData?.order_on).format('hh:mm A')}</span>
              </CustomTypography>
            </div>
          </div>
        </InvoiceContainer>
      </div>
      <ButtonContainer style={{ position: 'sticky', bottom: 0 }}>
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
            const printDocument = embedAllStyles(
              '.billing-modal',
              `${currentData?.buyer.name}-Record`,
              false
            )
            if (printDocument) {
              window.electron?.ipcRenderer.send(
                'generatePdf',
                printDocument,
                `${currentData?.buyer.name}-${currentData?.buyer.phone}`.replace('.', '_')
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
  justifyContent: 'space-between',
  zIndex: 10
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
  backgroundColor: '##ffffff33',
  backdropFilter: 'blur(10px)',
  marginTop: '12px',
  borderRadius: '12px',
  justifyContent: 'center',
  '.MuiButton-root': {
    flex: 1
  }
})
