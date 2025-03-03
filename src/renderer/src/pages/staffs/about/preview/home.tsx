import { Avatar, Divider, styled } from '@mui/material'
import { grey } from '@mui/material/colors'
import CustomIcon from '@renderer/components/icons'
import CustomTypography from '@renderer/components/typography'
import useFluidTypography from '@renderer/hooks/fluid-typo'
import { useAppSelector } from '@renderer/redux/store/hook'
import { capitalizeSentence } from '@renderer/utils/functions'

const HomePreview = () => {
  const data = useAppSelector((s) => s.card.editor.data)
  return (
    <Container
      sx={{
        backgroundImage: `url(${data?.personal_details?.card_theme?.hero_bg_image})`,
        backgroundSize: 'cover',
        position: 'relative',
        top: 0,
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: '#05000052',
          zIndex: -1
        },
        zIndex: 100
      }}
    >
      <Avatar
        src={data?.personal_details?.center_logo}
        sx={{
          width: '200px',
          height: '200px',
          boxShadow: '0px 0px 4px 2px #2222224c'
        }}
      />
      <CustomTypography
        sx={{
          paddingTop: '42px',
          paddingBottom: '12px',
          textAlign: 'center',
          fontSize: useFluidTypography('24px'),
          margin: '0 auto'
        }}
        color={'white'}
      >
        {data?.personal_details?.center_name}
      </CustomTypography>
      <Divider
        color={'white'}
        sx={{
          width: '100%'
        }}
      />
      {data?.personal_details?.displayName?.map((e) => (
        <CustomTypography
          color={'white'}
          fontSize={'1.1rem'}
          textAlign={'center'}
          sx={{
            paddingTop: '12px',
            flexWrap: 'wrap',
            color: '#ffffff',
            justifyContent: 'center',
            '& > span': {
              color: grey['200'],
              flexWrap: 'nowrap',
              cursor: 'pointer',
              marginLeft: '4px'
            }
          }}
        >
          {capitalizeSentence(e?.value)}&nbsp;
          {e.designation && <i>{`(${capitalizeSentence(e.designation)})`}</i>}
        </CustomTypography>
      ))}
      <SocialContainer>
        {data?.personal_details?.whatsapp && (
          <CustomIcon
            name={'IONICONS5'}
            icon="IoLogoWhatsapp"
            color={'white'}
            sx={{
              backgroundColor: data?.personal_details?.card_theme?.accent_color,
              padding: '8px',
              borderRadius: '12px'
            }}
          />
        )}
        {data?.personal_details?.email && (
          <CustomIcon
            name={'MATERIAL_DESIGN'}
            icon="MdEmail"
            color={'white'}
            sx={{
              backgroundColor: data?.personal_details?.card_theme?.accent_color,
              padding: '8px',
              borderRadius: '12px'
            }}
          />
        )}
        {data?.personal_details?.map_embed && (
          <CustomIcon
            name={'FONT_AWESOME'}
            icon="FaDirections"
            color={'white'}
            sx={{
              backgroundColor: data?.personal_details?.card_theme?.accent_color,
              padding: '8px',
              borderRadius: '12px'
            }}
          />
        )}
      </SocialContainer>
    </Container>
  )
}

export default HomePreview

const Container = styled('div')({
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  padding: '32px 24px',
  position: 'relative',
  top: 0,
  alignItems: 'center'
})

const SocialContainer = styled('div')({
  width: 'max-content',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  margin: 'auto auto',
  gap: 16
})
