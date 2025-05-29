import { Button, Fade, Modal, styled } from '@mui/material'
import CustomTypography from '@renderer/components/typography'
import { useNavigate, useParams } from 'react-router-dom'
import DetailsHeader from './header'
import DetailsContent from './content'
import { useAppSelector, useAppDispatch } from '@renderer/redux/store/hook'
import { asyncGetCurrentPost, resetCurrentPost } from '@renderer/redux/features/user/posts'
import React from 'react'

export default function PostDetails() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const uid = useAppSelector((state) => state.auth.user?.uid as string)
  const loading = useAppSelector((state) => state.post.currentPostLoading)
  const params = useParams()
  const type = params?.type
  const postId = params?.id

  if (!type || !postId) {
    throw Error('Expected Type or Post ID. No value found')
  }

  React.useEffect(() => {
    if (!type || !postId) {
      dispatch(resetCurrentPost())
      throw Error('Expected Type or Post ID. No value found', {
        cause: 'Type or Post ID not passed in URL parameters'
      })
    }

    dispatch(resetCurrentPost())
    dispatch(asyncGetCurrentPost({ uid, type: type as 'work' | 'nutritional-information', postId }))
    // Scroll to the top of the container when the component mounts or type/postId changes
    const container = document.querySelector('.container-layout')
    if (!container) {
      throw Error('Container not found', { cause: 'No element with class .container-layout' })
    }
    container.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
    // Reset the current post when the component mounts or type/postId changes
  }, [type, postId])

  return (
    !!postId && (
      <Fade in={!!postId}>
        <Container className="container-layout">
          {loading && (
            <Modal
              open={loading}
              onClose={() => {}}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <CustomTypography variant="h6">Loading...</CustomTypography>
            </Modal>
          )}
          <Row
            sx={{
              position: 'sticky',
              top: 0,
              zIndex: 10,
              paddingTop: '12px',
              backgroundColor: '#ffffffaa',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Button
              onClick={() => {
                dispatch(resetCurrentPost())
                navigate(`/posts/${type}`, {
                  replace: true,
                  state: { from: `/post-details/${type}/${postId}` }
                })
              }}
              disableElevation
              disableRipple
              disableFocusRipple
              disableTouchRipple
              startIcon={<CustomTypography variant="h6">←</CustomTypography>}
            >
              <CustomTypography variant="body1">Back</CustomTypography>
            </Button>
          </Row>
          <DetailsHeader />
          <DetailsContent />
        </Container>
      </Fade>
    )
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
  top: 0,
  padding: '12px 16px',
  paddingTop: '0px'
})

const Row = styled('div')({
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '16px'
})
