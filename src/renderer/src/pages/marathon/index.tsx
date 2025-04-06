import { styled } from '@mui/material'
import MarathonCard from '@renderer/components/card/marathon'
import CreateMarathon from '@renderer/components/modal/create-marathon'
import CustomTypography from '@renderer/components/typography'
import { useAppSelector } from '@renderer/redux/store/hook'
import React, { useState } from 'react'

export default function MarathonPage() {
  const { user } = useAppSelector((s) => s.auth)
  const [open, setOpen] = useState(false)

  React.useEffect(() => {
    if (!user) return
    // checkMarathonExists(user?.uid, '10-06-2001', '10-05-2002')
    // .then((e) => console.log(e, 'Heyyy'))
    // .catch(console.error)
  }, [])

  return (
    <Container>
      <CreateMarathon onClose={() => setOpen(false)} open={open} />
      <ColumnContainer sx={{ gap: '24px' }}>
        <CustomTypography variant="h4">Ongoing</CustomTypography>
        <MarathonCard type="add" />
      </ColumnContainer>
    </Container>
  )
}

const Container = styled('div')({
  width: '100%',
  height: '100%',
  backgroundColor: 'white',
  borderRadius: '24px'
})

const ColumnContainer = styled('div')({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
  padding: '24px'
})
