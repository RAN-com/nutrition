import { styled } from '@mui/material'
import PreviewScreen from '../../preview'
import HomeTemplate from './home'
import AboutTemplate from './about'
import { useAppSelector, useAppDispatch } from '@renderer/redux/store/hook'
import React from 'react'
import { setCurrentNavigation, setInitTheme } from '@renderer/redux/features/user/card'
import ServiceTemplate from './services'
import PhotoGallery from './photo-gallery'
import VideoGallery from './video-gallery'
import ContactTemplate from './contact'

const AppointmentTemplate = () => {
  const current_page = useAppSelector((s) => s.card.editor.current_navigation)
  const theme = useAppSelector((s) => s.card.editor.data?.['personal_details']?.['card_theme'])

  const dispatch = useAppDispatch()
  const width = 420
  const height = 760

  React.useEffect(() => {
    if (!current_page) {
      dispatch(setCurrentNavigation('personal_details'))
    }
    if (!theme) {
      dispatch(setInitTheme())
    }
  }, [])

  React.useEffect(() => {
    if (!theme) {
      dispatch(setInitTheme())
    }
  }, [theme])

  return (
    <Container>
      <InnerContainer
        className="scrollbar"
        sx={{
          width: '100%',
          maxWidth: `${width}px`,
          height: '100%',
          maxHeight: `${height}px`,
          borderRadius: '12px',
          overflowY: 'hidden',
          margin: 'auto 0',
          padding: '0px'
        }}
      >
        {current_page === 'personal_details' && <HomeTemplate />}
        {current_page === 'about' && <AboutTemplate />}
        {current_page === 'services' && <ServiceTemplate />}
        {current_page === 'photo_gallery' && <PhotoGallery />}
        {current_page === 'video_gallery' && <VideoGallery />}
        {current_page === 'contact' && <ContactTemplate />}
      </InnerContainer>
      <div
        style={{
          height: '100%',
          width: '100%',
          maxWidth: '480px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}
      >
        <InnerContainer
          sx={{
            width: '100%',
            maxWidth: `${width}px`,
            height: '100%',
            maxHeight: `${height}px`,
            borderRadius: '18px',
            overflowY: 'auto',
            margin: 'auto',
            padding: '0px',
            backgroundColor: theme?.background_color,
            border: `2px solid ${theme?.accent_color}`
          }}
          className="scrollbar"
        >
          <PreviewScreen />
        </InnerContainer>
      </div>
    </Container>
  )
}

export default AppointmentTemplate

const Container = styled('div')({
  width: '100%',
  height: '100%',
  backgroundColor: '#f1f1f1',
  gridColumn: '2',
  gridRow: '2',
  display: 'flex',
  justifyContent: 'center',
  borderRadius: '12px',
  padding: '12px 0px',
  overflowY: 'auto',
  gap: '32px',
  '.dimensions': {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem'
  }
})

const InnerContainer = styled('div')({
  width: '100%',
  maxWidth: '420px',
  backgroundColor: 'white'
})
