import { Avatar, styled } from '@mui/material'
import CustomTypography from '@renderer/components/typography'
import { GalleryResponse } from '@renderer/types/customers'
import GalleryView from './gallery-view'
import React from 'react'

const generatePhotos = (attendance: GalleryResponse['attendance']) => {
  const photos = [] as (Omit<GalleryResponse['attendance'][number], 'photo_url'> & {
    photo_url: string
  })[]
  attendance.map((e) => {
    e.photo_url.map((p) => {
      photos.push({
        ...e,
        photo_url: p
      })
    })
  })

  return photos
}

export default function GalleryContent({
  attendance,
  customer,
  showInfo = true,
  flexWrap = false,
  showMore = true
}: GalleryResponse & { showInfo?: boolean; flexWrap?: boolean; showMore?: boolean }) {
  const photos = React.useMemo(() => {
    const gen = generatePhotos(attendance)
    return [...gen, ...gen, ...gen, ...gen]
  }, [attendance])
  const [idx, setIdx] = React.useState<number | null>(null)
  const [open, setOpen] = React.useState(false)

  const INITIAL_PHOTOS_COUNT = 4
  const hasMorePhotos = photos.length > INITIAL_PHOTOS_COUNT
  const displayedPhotos = photos.slice(0, INITIAL_PHOTOS_COUNT)

  const isDataAvailable =
    !!customer &&
    Array.isArray(photos) &&
    photos.length >= 1 &&
    photos.every((p) => !!p && !!p.photo_url)

  const handlePhotoClick = (index: number) => {
    setOpen(true)
    setIdx(index)
  }

  return isDataAvailable ? (
    <Column sx={{ padding: '12px', backgroundColor: '#eefff995' }}>
      {showInfo && (
        <Column>
          <Row sx={{ alignItems: 'center', gap: '12px' }}>
            <Row>
              <Avatar
                variant="rounded"
                sx={{ border: '1px solid' }}
                src={customer?.photo_url}
                alt={customer?.name}
              />
            </Row>
            <Column>
              <CustomTypography fontWeight={'bolds'} variant="h6" lineHeight={'100%'}>
                {customer?.name}
              </CustomTypography>
              <CustomTypography variant="body2" fontWeight={'light'}>
                {customer?.email || `+91${customer?.phone}` || 'No contact info'}
              </CustomTypography>
            </Column>
          </Row>
        </Column>
      )}
      <Row
        sx={{
          overflowX: flexWrap ? 'none' : 'auto',
          flexWrap: flexWrap ? 'wrap' : 'nowrap',
          gap: '12px',
          padding: '12px 0px 12px 0px',
          flexDirection: 'row'
        }}
      >
        {displayedPhotos.map((photo, index) => (
          <Image key={`photo-${index}-${photo.date}`} onClick={() => handlePhotoClick(index)}>
            <img src={photo.photo_url} alt={photo.date} />
          </Image>
        ))}

        {showMore && hasMorePhotos && (
          <ShowMoreBox onClick={() => handlePhotoClick(INITIAL_PHOTOS_COUNT)}>
            <CustomTypography variant="h6" color="primary">
              +{photos.length - INITIAL_PHOTOS_COUNT}
            </CustomTypography>
            <CustomTypography variant="body2" color="primary">
              Show More
            </CustomTypography>
          </ShowMoreBox>
        )}
      </Row>
      <GalleryView open={open} onClose={() => setOpen(false)} data={photos} idx={idx} />
    </Column>
  ) : null
}
const ShowMoreBox = styled('div')(({ theme }) => ({
  height: '140px',
  minWidth: '140px',
  maxHeight: '140px',
  cursor: 'pointer',
  aspectRatio: '1/1',
  overflow: 'hidden',
  borderRadius: '12px',
  backgroundColor: 'rgba(0, 0, 0, 0.04)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid',
  borderColor: theme.palette.divider,
  transition: 'background-color 0.3s',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.08)'
  }
}))

const Column = styled('div')({
  width: 'auto',
  height: 'auto',
  display: 'flex',
  flexDirection: 'column'
})

const Row = styled('div')({
  width: 'auto',
  height: 'auto',
  display: 'flex',
  flexDirection: 'row'
})

const Image = styled('div')({
  height: '140px',
  minWidth: '140px',
  maxHeight: '140px',
  cursor: 'pointer',
  aspectRatio: '1/1',
  overflow: 'hidden',
  borderRadius: '12px',
  backgroundColor: '#6e6e6e1c',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid',
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    backgroundColor: '#00000035'
  }
})
