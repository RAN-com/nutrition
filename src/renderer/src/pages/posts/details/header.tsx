import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { styled } from '@mui/material'
import CustomIcon from '@renderer/components/icons'
import { Swiper, SwiperRef, SwiperSlide } from 'swiper/react'
import { useRef, useState, useEffect} from 'react'
import { useAppSelector } from '@renderer/redux/store/hook'
import { PostsResponse } from '@renderer/types/posts'

export default function DetailsHeader() {
  const swiperRef = useRef<SwiperRef>(null)
  const post = useAppSelector((state) => state.post?.currentPost!)
  const loading = useAppSelector((state) => state.post?.currentPostLoading)
  const total = post?.files?.length // This should be the total number of slides you have
  const [preview, setPreview] = useState<PostsResponse['files'][number]>(post?.files[0])
  const [activeIdx, setActiveIndex] = useState(0)

  useEffect(() => {
    if(post && !loading) {
      setPreview(post?.files[0]);
    }
  },[post, loading])

  const handlePrev = () => {
    if (swiperRef.current?.swiper) {
      if (activeIdx === 0) {
        // If the current index is the first slide, loop to the last slide
        swiperRef.current.swiper.slideTo(total - 1)
        setActiveIndex(total - 1)
        setPreview(post?.files?.[total - 1])
        return
      }

      swiperRef.current.swiper.slideTo(activeIdx - 1)
      // Update the active slide index after navigation
      setActiveIndex(activeIdx - 1)
      if (activeIdx - 1 < 0) {
        // If the active index is less than 0, reset to the last slide
        setActiveIndex(total - 1)
        setPreview(post?.files?.[total - 1])
        return
      }
      setPreview(post?.files?.[activeIdx - 1])
      setActiveIndex(activeIdx - 1)
      return
    }
  }

  const handleNext = () => {
    // this should loop throught the thumbnails
    if (swiperRef.current?.swiper) {
      if (activeIdx === post?.files?.length - 1) {
        // If the current index is the last slide, loop to the first slide
        swiperRef.current.swiper.slideTo(0)
        setActiveIndex(0)
        setPreview(post?.files?.[0])
        return
      }

      swiperRef.current.swiper.slideTo(activeIdx + 1)
      // Update the active slide index after navigation
      const activeIndex = activeIdx + 1
      if (activeIndex >= total) {
        // If the active index exceeds the total, reset to 0
        setActiveIndex(0)
        setPreview(post?.files?.[0])
        return
      }
      setActiveIndex(activeIndex)
      setPreview(post?.files?.[activeIndex])
      return
    }
  }

  const handleSlideChange = (index: number) => {
    // Update the active slide index when a thumbnail is clicked
    setActiveIndex(index)
    if (swiperRef.current?.swiper) {
      setPreview(post?.files?.[index])
      swiperRef.current.swiper.slideTo(index)
    }
  }

  return (
    <Container>
      {loading ? (
        <Preview>
          <img
            src="https://via.placeholder.com/640x360.png?text=Loading..."
            alt="Loading"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              borderRadius: '8px'
            }}
          />
        </Preview>
      ) : (
        <>
          <Preview>
            {preview?.type?.includes('image') ? (
              <img
                src={preview?.url}
                alt={`Preview ${preview?.type}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  borderRadius: '8px'
                }}
              />
            ) : (
              preview?.type?.includes('video') && (
                <video
                  src={preview?.url}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '8px'
                  }}
                  controls={true}
                  muted
                  loop={false}
                  autoPlay={true}
                />
              )
            )}
          </Preview>
          <ThumbnailContainer>
            <CustomIcon
              name="MATERIAL_DESIGN"
              icon="MdArrowBack"
              size={24}
              color="#000000aa"
              onClick={handlePrev}
            />
            <Swiper
              ref={swiperRef}
              direction="horizontal"
              style={{
                width: '100%'
              }}
              spaceBetween={12}
              slidesPerView={'auto'}
              loop={false}
              className="swiper-container"
            >
              {post?.files?.map((_, idx) => (
                <SwiperSlide
                  style={{
                    width: 'max-content',
                    height: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(4px)'
                  }}
                >
                  <Thumbnail
                    onClick={() => {
                      handleSlideChange(idx)
                    }}
                    sx={{
                      borderRadius: '12px',
                      overflow: 'hidden',
                      borderWidth: '4px',
                      borderStyle: 'solid',
                      borderColor: activeIdx === idx ? '#7200cf' : 'transparent',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor:
                          activeIdx === idx ? 'rgba(114, 0, 207, 0.2)' : 'transparent',
                        zIndex: 10
                      }
                    }}
                  >
                    {_.type === 'image' && (
                      <img
                        src={_.url || _.url}
                        alt={`Thumbnail ${idx}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: '8px'
                        }}
                      />
                    )}
                    {_.type === 'video' && (
                      <>
                        <video
                          src={_.url}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: '8px'
                          }}
                          controls={false}
                          muted
                          loop={false}
                          autoPlay={false}
                        />
                        <CustomIcon
                          sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            zIndex: 20
                          }}
                          stopPropagation={false}
                          name="MATERIAL_DESIGN"
                          icon="MdVideoFile"
                          size={48}
                          color="#000000aa"
                        />
                      </>
                    )}
                  </Thumbnail>
                </SwiperSlide>
              ))}
            </Swiper>
            <CustomIcon
              name="MATERIAL_DESIGN"
              icon="MdArrowForward"
              size={24}
              color="#000000aa"
              onClick={handleNext}
            />
          </ThumbnailContainer>
        </>
      )}
    </Container>
  )
}

const Container = styled('div')({
  width: '100%',
  backgroundColor: 'white',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  padding: '12px 0px'
})

const Preview = styled('div')({
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  padding: '2px',
  borderRadius: '8px',
  backgroundColor: '#0e0d0df8',
  boxShadow: '0px 0px 2px 0px #9c9c9c',
  aspectRatio: '16/9',
  'img, video': {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    borderRadius: '8px',
    aspectRatio: '16/9'
  }
})

const ThumbnailContainer = styled('div')({
  width: '100%',
  display: 'grid',
  gridTemplateColumns: 'auto 1fr auto',
  alignContent: 'center',
  alignItems: 'center',
  '.CustomIconContainer': {
    padding: '4px',
    backgroundColor: '#f0f0f0',
    borderRadius: '50%'
  },
  gap: '12px'
})

const Thumbnail = styled('div')({
  width: '140px',
  height: '100%',
  aspectRatio: '16/9',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  maxWidth: '140px',
  cursor: 'pointer',
  position: 'relative',
  top: 0
})
