import { Box, CircularProgress, styled } from '@mui/material'
import PageHeader from '@renderer/components/header/pageHeader'
import CustomTypography from '@renderer/components/typography'
import { listenToAllAttendance } from '@renderer/firebase/customers'
import { setGalleryData, setLoading } from '@renderer/redux/features/user/photo-gallery'
import { useAppSelector, useAppDispatch } from '@renderer/redux/store/hook'
import React from 'react'
import GalleryContent from './content'

export default function PhotoGallery() {
  const dispatch = useAppDispatch()
  const user = useAppSelector((s) => s.auth.user)
  const { data, loading } = useAppSelector((s) => s.gallery)

  React.useEffect(() => {
    dispatch(setLoading(true))
    const unsubscribe = listenToAllAttendance(user?.uid as string, (records) => {
      dispatch(setGalleryData(records))
      dispatch(setLoading(false))
    })

    return () => unsubscribe()
  }, [user])

  const isDataAvailable = data.some((entry) =>
    entry.attendance.some((a) => a.photo_url && a.photo_url.length >= 1)
  )

  console.log(isDataAvailable)

  return (
    <Container
      sx={{
        height: 'calc(100%)',
        maxHeight: 'calc(100%)',
        overflow: 'auto',
        position: 'relative',
        top: 0,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        gap: '12px'
      }}
    >
      <PageHeader
        sx={{
          position: 'sticky',
          top: 0,
          background: 'white',
          backgroundColor: '#ffffff99',
          backdropFilter: 'blur(10px)'
        }}
        start={
          <div>
            <CustomTypography variant={'h6'}>Photo Gallery</CustomTypography>
          </div>
        }
      />
      {loading && <CircularProgress variant="indeterminate" />}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'white',
          padding: '16px',
          borderRadius: '12px',
          height: isDataAvailable ? 'auto' : '200px'
        }}
      >
        {isDataAvailable ? data.map((rec) => <GalleryContent {...rec} />) : <></>}
      </Box>
    </Container>
  )
}

const Container = styled('div')({
  width: '100%',
  transition: 'all .3s'
})
