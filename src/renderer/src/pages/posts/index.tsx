import { Fade, Menu, MenuItem, Modal, styled } from '@mui/material'
import { useParams } from 'react-router-dom'
import CreatePost from './create-post'
import { useEffect, useState } from 'react'
import PostCard from '@renderer/components/card/posts'
import { useAppSelector, useAppDispatch } from '@renderer/redux/store/hook'
import { asyncGetUserPosts } from '@renderer/redux/features/user/posts'
import CustomTypography from '@renderer/components/typography'
import noData from '@renderer/assets/no-data.png'
import CustomIcon from '@renderer/components/icons'
import { PostsResponse } from '@renderer/types/posts'
import { deletePost } from '@renderer/firebase/posts'

export default function Posts() {
  const dispatch = useAppDispatch()
  const data = useAppSelector((s) => s.post.posts)
  const loading = useAppSelector((s) => s.post.loading)
  const user = useAppSelector((s) => s.auth.user?.uid as string)
  const { type, id } = useParams() as {
    type: 'work' | 'nutritional-information'
    id: string
  }
  if (!type) {
    throw Error('Expected Type. No value found')
  }

  useEffect(() => {
    if (!type) {
      throw Error('Expected Type. No value found')
    }

    dispatch(
      asyncGetUserPosts({
        uid: user,
        type
      })
    )

    console.log(`Scroll Top: ${type}`)
    // When the component mounts or the type changes,
    // scroll to the top of the container
    const container = document.querySelector('.container-layout')
    if (!container) {
      throw Error('Container not found', { cause: 'No element with class .layout' })
    }
    container.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }, [type])

  const [_deletePost, setDeletePost] = useState(false)
  const [edit, setEdit] = useState<PostsResponse | undefined>()
  const [menu, setMenu] = useState<{
    currentTarget: HTMLDivElement
    data: PostsResponse
  } | null>(null)

  return (
    <>
      <Container
        className="container-layout"
        sx={{
          overflowY: !!id ? 'hidden' : 'auto'
        }}
      >
        <CreatePost
          handleClear={() => {
            setEdit(undefined)
            setMenu(null)
          }}
          edit={edit}
        />
        <Modal open={_deletePost} onClose={() => setDeletePost(false)}>
          <></>
        </Modal>
        <Fade in={!id || loading}>
          <PostContainer
            style={
              data?.[type]?.length === 0
                ? {
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }
                : undefined
            }
          >
            {data?.[type]?.length === 0 && (
              <>
                <img
                  src={noData}
                  alt={'No data found'}
                  style={{
                    maxWidth: '400px',
                    objectFit: 'contain',
                    backgroundColor: 'transparent'
                  }}
                />
                <CustomTypography variant="h4" sx={{ color: '#666' }}>
                  No posts found
                </CustomTypography>
                <CustomTypography variant="body1" sx={{ color: '#999' }}>
                  Click on the " Share Post " button to get started.
                </CustomTypography>
              </>
            )}
            {data?.[type]?.map((d, idx) => (
              <PostCard
                {...d}
                type={type as 'work'}
                key={idx}
                onMenuClick={(event) =>
                  setMenu({
                    currentTarget: event.currentTarget,
                    data: d
                  })
                }
              />
            ))}
          </PostContainer>
        </Fade>
        <Menu
          anchorEl={menu?.currentTarget}
          open={!!menu}
          onClose={() => setMenu(null)}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right'
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right'
          }}
          sx={{
            '& .MuiPaper-root': {
              borderRadius: '8px',
              boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.1)',
              minWidth: '150px'
            }
          }}
        >
          {/* edit, delete option */}
          <MenuItem
            onClick={() => {
              setEdit(menu?.data)
              setMenu(null)
            }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <CustomIcon name="MATERIAL_DESIGN" icon="MdEdit" size={18} />
            Edit Post
          </MenuItem>
          <MenuItem
            onClick={async () => {
              setDeletePost(true)
              const data = Object.assign({}, menu?.data)
              setEdit(undefined)
              setMenu(null)
              if (!data) return
              if (!data.id) {
                console.error('Post ID is missing for deletion')
                return
              }
              if (!user) {
                console.error('User ID is missing for deletion')
                return
              }

              await deletePost(user, menu?.data.id as string, type)
              setDeletePost(false)
              dispatch(
                asyncGetUserPosts({
                  uid: user,
                  type
                })
              )
            }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#d32f2f'
            }}
          >
            <CustomIcon name="MATERIAL_DESIGN" color={'#d32f2f'} icon="MdDelete" size={18} />
            Delete Post
          </MenuItem>
        </Menu>
      </Container>
    </>
  )
}

const Container = styled('div')({
  width: '100%',
  height: '100%',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: 'white',
  borderRadius: '8px',
  position: 'relative',
  top: 0
})

const PostContainer = styled('div')({
  width: '100%',
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: '16px',
  padding: '0px 24px',
  paddingTop: '16px',
  borderRadius: '8px',
  '& img': {
    width: '100%',
    aspectRatio: '2/2.5', // Movie poster typical aspect ratio
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
    overflow: 'hidden'
  }
})
