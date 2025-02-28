import { Divider, MenuItem, styled, Tooltip } from '@mui/material'
import { red } from '@mui/material/colors'
import CustomIcon from '@renderer/components/icons'
import CustomTypography from '@renderer/components/typography'
import { setCurrentNavigation, validateCardDetails } from '@renderer/redux/features/user/card'
import { useAppSelector, useAppDispatch } from '@renderer/redux/store/hook'
import { CardCreateData } from '@renderer/types/card'
import { capitalizeSentence } from '@renderer/utils/functions'
import * as yup from 'yup'

const sections = [
  'personal_details',
  'about',
  'services',
  'photo_gallery',
  'video_gallery',
  'contact'
]

const AppointmentSidebar = () => {
  const { errors } = useAppSelector((s) => s.card.editor)
  const dispatch = useAppDispatch()

  return (
    <Container>
      <CustomTypography variant={'body1'} fontWeight={'bold'} color={'#3d3d3d'}>
        Sections
      </CustomTypography>
      <Divider
        sx={{
          padding: '8px 0px',
          paddingBottom: '24px'
        }}
      />
      {sections.map((e) => {
        const currentItem = errors.findIndex((d) => d.template_id === (e as keyof CardCreateData))
        const error = errors[currentItem]
        return (
          <MenuItem
            onClick={() => {
              const query = document.querySelector(
                `.template_${e.toLowerCase().split(' ').join('_').toLowerCase()}`
              )
              dispatch(setCurrentNavigation(e as keyof CardCreateData))
              if (error) {
                dispatch(
                  validateCardDetails({
                    id: e as keyof CardCreateData
                  })
                )
              }
              if (query) {
                query.scrollIntoView({
                  behavior: 'smooth'
                })
              }
            }}
            sx={{
              justifyContent: 'space-between'
            }}
          >
            {capitalizeSentence(e)}
            {error ? (
              <Tooltip title={error?.inputs.map((e) => e.error + '\n').join('\n')}>
                <span>
                  <CustomIcon name={'MATERIAL_DESIGN'} icon={'MdError'} color={red['300']} />
                </span>
              </Tooltip>
            ) : (
              ''
            )}
          </MenuItem>
        )
      })}
    </Container>
  )
}

export default AppointmentSidebar

const Container = styled('div')({
  width: '100%',
  height: '100%',
  backgroundColor: '#e6e6e6',
  gridColumn: '1',
  gridRow: '2',
  padding: '16px 24px',
  borderRadius: '12px'
})
