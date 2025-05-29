import { styled, Tooltip } from '@mui/material'
import { PostsResponse } from '@renderer/types/posts'
import moment from 'moment'
import { useNavigate } from 'react-router-dom'
import CustomTypography from '../typography'
import CustomIcon from '@renderer/components/icons'
import { useAppDispatch } from '@renderer/redux/store/hook'
import { resetCurrentPost } from '@renderer/redux/features/user/posts'
type Props = PostsResponse & {
  onMenuClick?: (event: React.MouseEvent<HTMLDivElement>) => void
}

export default function PostCard({
  type,
  id,
  files,
  title,
  createdAt,
  updatedAt,
  onMenuClick
}: Props) {
  const router = useNavigate()
  const postedOn = moment(createdAt || updatedAt).format('MMM DD, YYYY')
  const thumbnail = files.find((file) => file.isThumbnail && file.type === 'image')
  const dispatch = useAppDispatch()
  const handleNavigation = (to: string) => {
    dispatch(resetCurrentPost())
    router(to, { flushSync: true })
  }

  return (
    <>
      <Post onClick={() => handleNavigation(`/post-details/${type}/${id}`)} key={id}>
        {/* Using Link to navigate to the post details page */}
        <CustomIcon
          name="MATERIAL_DESIGN"
          icon="MdMoreVert"
          color={'white'}
          stopPropagation={true}
          size={16}
          sx={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            color: '#ffffff',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '50%',
            backgroundColor: '#3f005cd1',
            zIndex: 10,
            border: '2px solid #ffffff'
          }}
          onClick={onMenuClick}
        />
        <PostImage>
          <img src={thumbnail?.url} alt={title} />
        </PostImage>
        <PostContent>
          <Tooltip title={title} followCursor>
            <CustomTypography
              variant="h6"
              sx={{
                letterSpacing: '-0.02em',
                lineHeight: '100%',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {title}
            </CustomTypography>
          </Tooltip>
          <CustomTypography
            variant="body2"
            sx={{
              color: '#666',
              marginTop: '4px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {moment(postedOn).format('MMM DD, YYYY')}
          </CustomTypography>
        </PostContent>
      </Post>
    </>
  )
}

const Post = styled('div')({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '8px',
  overflow: 'hidden',
  backgroundColor: '#f7f7f7f8',
  cursor: 'pointer',
  position: 'relative',
  '&:hover': {
    boxShadow: '0px 0px 2px 0px #9c9c9c'
  }
})

const PostImage = styled('div')({
  width: '100%',
  aspectRatio: '2/2.5', // Movie poster typical aspect ratio
  display: 'flex',
  position: 'relative',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#4d4d4d',
  borderRadius: '8px',
  overflow: 'hidden',
  objectFit: 'cover',
  img: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  }
})

const PostContent = styled('div')({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  padding: '8px 8px 8px 8px',
  gap: '0px'
  // borderRadius: '4px'
})
