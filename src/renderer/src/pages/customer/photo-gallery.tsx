import { useAppSelector } from '@renderer/redux/store/hook'
import GalleryContent from '../photo-gallery/content'

export default function CustomerPhotoGallery() {
  const current = useAppSelector((s) => s.customer.current_customer)
  const data = current?.attendance?.flatMap((e) => e.data) || []
  return (
    current?.attendance && (
      <GalleryContent
        showInfo={false}
        attendance={data}
        showMore={false}
        flexWrap={true}
        customer={current?.data}
      />
    )
  )
}
