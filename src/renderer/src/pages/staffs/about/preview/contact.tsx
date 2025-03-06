import { Button, styled } from '@mui/material'
import CustomIcon from '@renderer/components/icons'
import CustomTextInput from '@renderer/components/text-input'
import CustomTypography from '@renderer/components/typography'
import { SERVER_DOMAIN } from '@renderer/constants/value'
import { useAppSelector } from '@renderer/redux/store/hook'
import { successToast } from '@renderer/utils/toast'

const ContactPreview = () => {
  const contact = useAppSelector((s) => s?.card?.editor?.data?.['contact'] ?? null)
  const domain = useAppSelector((s) => s.staffs.current_staff)
  const theme = useAppSelector((s) => s?.card?.editor?.data?.['personal_details']?.card_theme)
  const url = `${import.meta.env.DEV ? 'http://' : 'https://'}${domain?.data?.assigned_subdomain}.${SERVER_DOMAIN}`
  return (
    <Container className="scrollbar">
      <div
        className="header"
        style={{
          backgroundColor: theme?.accent_color
        }}
      >
        <CustomTypography variant={'h5'} color={'white'} fontWeight={'medium'}>
          Contact
        </CustomTypography>
      </div>
      <div
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          paddingTop: '24px',
          paddingBottom: '32px'
        }}
      >
        <Row>
          {contact?.phone?.map((e, i) => {
            return (
              <>
                <CustomIcon
                  name={'LUCIDE_ICONS'}
                  icon="LuPhone"
                  size={24}
                  color={theme?.accent_color}
                  sx={{
                    opacity: i === 0 ? 1 : 0
                  }}
                />
                <CustomTypography>{e}</CustomTypography>
              </>
            )
          })}
        </Row>
        <Row>
          {contact?.address && (
            <>
              <CustomIcon
                name={'FONT_AWESOME_6'}
                icon="FaAddressCard"
                size={24}
                color={theme?.accent_color}
              />
              <CustomTypography>{contact?.address}</CustomTypography>
            </>
          )}
        </Row>
      </div>
      <ShareContainer
        sx={{
          border: `2px solid ${theme?.accent_color}`,
          padding: '12px 16px',
          borderRadius: '12px'
        }}
      >
        <CustomTypography fontWeight={'bold'}>Share url</CustomTypography>
        <CustomTextInput
          input={{
            value: url,
            slotProps: {
              input: {
                endAdornment: (
                  <Button
                    onClick={async () => {
                      await window.electron?.updateResponse(`copy_text#${url}`)
                      await successToast('Copied to clipboard')
                    }}
                  >
                    Copy
                  </Button>
                )
              }
            }
          }}
        />
      </ShareContainer>
    </Container>
  )
}

export default ContactPreview

const Container = styled('div')({
  width: '100%',
  height: '100%',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  padding: '0px 32px',
  position: 'relative',
  top: 0,
  '.header': {
    width: '100%',
    maxWidth: '80%',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px 0px',
    borderRadius: '0px 0px 12px 12px',
    marginBottom: '12px'
  }
})

const Row = styled('div')({
  width: '100%',
  display: 'grid',
  gridTemplateColumns: '40px 1fr',
  gap: '12px'
})

const ShareContainer = styled('div')({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center'
})
