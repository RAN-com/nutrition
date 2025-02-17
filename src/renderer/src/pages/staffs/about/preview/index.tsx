import { useAppSelector } from '@renderer/redux/store/hook'
import HomePreview from './home'
import AboutPreview from './about'
import ServicesPreview from './services'
import PhotoGalleryPreview from './photo-gallery'
import VideoGalleryPreview from './video-gallery'

const PreviewScreen = () => {
  const current_edit = useAppSelector((s) => s.card.editor.current_navigation)
  return (
    <>
      {current_edit === 'personal_details' && <HomePreview />}
      {current_edit === 'about' && <AboutPreview />}
      {current_edit === 'services' && <ServicesPreview />}
      {current_edit === 'photo_gallery' && <PhotoGalleryPreview />}
      {current_edit === 'video_gallery' && <VideoGalleryPreview />}
    </>
  )
}

export default PreviewScreen
