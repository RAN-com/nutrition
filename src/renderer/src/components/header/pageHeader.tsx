import { styled, SxProps, Theme } from '@mui/material'

type Props = {
  start?: React.ReactNode
  end?: React.ReactNode
  sx?: SxProps<Theme>
}

const PageHeader = ({ start, end, sx }: Props) => {
  return (
    (start || end) && (
      <Container sx={sx}>
        {start && start}
        {end && end}
      </Container>
    )
  )
}

export default PageHeader

const Container = styled('div')({
  width: '100%',
  height: 'max-content',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  // position: 'sticky',
  // top: 0,
  padding: '12px 24px',
  backgroundColor: 'white',
  backdropFilter: 'blur(10px)',
  zIndex: 100,
  borderRadius: '12px'
})
