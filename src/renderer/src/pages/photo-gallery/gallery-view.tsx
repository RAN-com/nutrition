import { Modal, styled } from '@mui/material'
import { CustomerAttendance } from '@renderer/types/customers'

import React, { useRef } from 'react'
import { Carousel } from 'react-responsive-carousel'
import CustomIcon from '@renderer/components/icons'

type Props = {
  open: boolean
  onClose(): void
  idx?: number | null
  data: (Omit<CustomerAttendance, 'photo_url'> & {
    photo_url: string
  })[]
}
export default function GalleryView({ data, onClose, open, idx }: Props) {
  const carouselRef = useRef<Carousel>(null)

  const handleNext = () => carouselRef?.current?.onClickNext()
  const handlePrevious = () => carouselRef?.current?.onClickPrev()

  React.useEffect(() => {
    // Using typeof to properly check for null or undefined
    if (idx !== null && idx !== undefined) {
      carouselRef?.current?.changeItem(idx)
    }
  }, [idx]) // Add idx as a dependency to react when it changes

  return (
    <Modal
      open={open}
      onClose={onClose}
      slotProps={{
        root: {
          style: {
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#000'
          }
        }
      }}
    >
      <>
        <div
          style={{
            width: '100%',
            height: '50px',
            display: 'flex',
            flexDirection: 'row-reverse',
            padding: '12px 24px'
          }}
        >
          <CustomIcon name="LUCIDE_ICONS" icon="LuX" onClick={() => onClose()} color={'white'} />
        </div>
        <div style={{ width: '100%', position: 'relative', top: 0, height: 'calc(100% - 50px)' }}>
          <Arrows
            onClick={handlePrevious}
            sx={{
              top: '50%',
              left: '24px',
              transform: 'translate(50%, -50%)',
              padding: '8px',
              backgroundColor: '#000',
              borderRadius: '50%'
            }}
          >
            <CustomIcon
              stopPropagation={false}
              name="LUCIDE_ICONS"
              icon={'LuArrowLeft'}
              size={32}
              color={'white'}
            />
          </Arrows>
          <Arrows
            onClick={handleNext}
            sx={{
              top: '50%',
              right: '24px',
              transform: 'translate(-50%, -50%)',
              padding: '8px',
              backgroundColor: '#000',
              borderRadius: '50%'
            }}
          >
            <CustomIcon
              stopPropagation={false}
              name="LUCIDE_ICONS"
              icon={'LuArrowRight'}
              size={32}
              color={'white'}
            />
          </Arrows>
          <Carousel
            ref={carouselRef}
            showIndicators={true}
            showArrows={false}
            showStatus={true}
            autoFocus={true}
            autoPlay={true}
            infiniteLoop={true}
            interval={3000}
            dynamicHeight={true}
            swipeable={true}
            showThumbs={true}
            selectedItem={idx !== null && idx !== undefined ? idx : 0}
          >
            {data.map((e) => (
              <div>
                <img src={e.photo_url} alt={e.date} />
              </div>
            ))}
          </Carousel>
        </div>
      </>
    </Modal>
  )
}

const Arrows = styled('div')({
  position: 'absolute',
  zIndex: 100
})
