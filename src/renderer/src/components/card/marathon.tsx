import { styled } from '@mui/material'
import CustomIcon from '../icons'
import CustomTypography from '../typography'
import { MarathonData } from '@renderer/types/marathon'

type Props = {
  type: 'add' | 'list'
  data?: MarathonData
}

export default function MarathonCard({ type, data }: Props) {
  const isAdd = type === 'add' || !data
  return (
    <Container
      sx={
        isAdd
          ? {
              cursor: 'pointer',
              backgroundColor: 'rgba(170, 176, 234, 0.55)',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              transform: 'scale(1)',
              '&:hover': {
                transform: 'scale(0.99)'
              },
              transition: 'all .3s'
            }
          : {}
      }
    >
      {isAdd ? (
        <>
          <CustomIcon
            stopPropagation={false}
            name="LUCIDE_ICONS"
            icon="LuPlus"
            color={'#110067'}
            size={24}
          />
          <CustomTypography variant="body1">Create Marathon</CustomTypography>
        </>
      ) : (
        <></>
      )}
    </Container>
  )
}

const Container = styled('div')({
  width: '100%',
  maxWidth: '320px',
  minHeight: '220px',
  borderRadius: '16px',
  padding: '16px',
  display: 'flex',
  flexDirection: 'column'
})
