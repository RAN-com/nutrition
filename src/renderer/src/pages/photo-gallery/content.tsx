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
  const photos = generatePhotos(attendance)

  const [idx, setIdx] = React.useState<number | null>(null)
  const [open, setOpen] = React.useState(false)

  return (
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
              <CustomTypography fontWeight={'medium'} variant="h6">
                {customer?.name}
              </CustomTypography>
              <CustomTypography variant="body2" fontWeight={'light'}>
                {customer?.gender}
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
        {photos.map((e, i) =>
          showMore && i < 7 ? (
            <Image
              onClick={() => {
                setOpen(true)
                setIdx(i)
              }}
            >
              <img src={e.photo_url} alt={e.date} />
            </Image>
          ) : (
            <Image
              onClick={() => {
                setOpen(true)
                setIdx(i)
              }}
            >
              <img src={e.photo_url} alt={e.date} />
            </Image>
          )
        )}
        {showMore && photos.length > 7 && (
          <Image
            onClick={() => {
              setIdx(7)
              setOpen(true)
            }}
          >
            <CustomTypography>See More</CustomTypography>
          </Image>
        )}
      </Row>
      <GalleryView open={open} onClose={() => setOpen(false)} data={photos} idx={idx} />
    </Column>
  )
}

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
  height: '240px',
  minWidth: '240px',
  maxHeight: '240px',
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
