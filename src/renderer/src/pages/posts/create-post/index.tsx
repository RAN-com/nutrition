import { Avatar, Fade, styled } from '@mui/material'
import CustomTextInput from '@renderer/components/text-input'
import { useAppSelector } from '@renderer/redux/store/hook'
import { capitalizeSentence } from '@renderer/utils/functions'
import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import CreatePostModal from './modal'
import CustomTypography from '@renderer/components/typography'
import { PostsResponse } from '@renderer/types/posts'

type Props = {
  edit?: PostsResponse
  handleClear?: () => void
}

export default function CreatePost({ edit, handleClear }: Props) {
  const { type, id } = useParams()
  const user = useAppSelector((s) => s.auth.user?.photo_url)

  const [showModal, setShowModal] = useState(false)

  const handleModal = (state: boolean) => {
    setShowModal(state)
  }

  if (!type) {
    throw Error('No type found', { cause: "Type haven't been passed" })
  }

  React.useEffect(() => {
    if (!edit) return
    handleModal(true)
  }, [edit])

  return (
    <Fade in={!id}>
      <Container id={'create-post'}>
        <Row
          style={{
            paddingTop: '4px',
            paddingBottom: '24px'
          }}
        >
          <CustomTypography variant="h5">
            {type?.split('-').map(capitalizeSentence).join(' ')}
          </CustomTypography>
        </Row>
        <Row>
          <Avatar
            src={user}
            alt={user ? 'User Avatar' : 'Default Avatar'}
            sx={{ width: '60px', height: '60px' }}
          />
          <Mask onClick={() => handleModal(true)}>
            <CustomTextInput
              formProps={{
                sx: {
                  border: 'none',
                  outline: 'none'
                }
              }}
              input={{
                sx: {
                  '.MuiInputBase-root': {
                    outline: 'none',
                    borderRadius: '100px',
                    paddingLeft: '12px',
                    border: 'none',
                    position: 'relative',
                    top: 0,
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      zIndex: 10,
                      cursor: 'pointer'
                    }
                  }
                },
                contentEditable: false,
                placeholder: `Share ${type?.split('-').map(capitalizeSentence).join(' ')}`
              }}
            />
          </Mask>
        </Row>
        <CreatePostModal
          edit={edit}
          type={type as 'work' | 'nutritional-information'}
          open={showModal}
          onExit={() => {
            handleModal(false)
            handleClear?.()
          }}
          onSubmitted={console.log}
        />
      </Container>
    </Fade>
  )
}

const Container = styled('div')({
  width: '100%',
  position: 'sticky',
  top: 0,
  padding: '12px 24px',

  paddingBottom: '18px',
  borderBottom: '1px solid #e0e0e0',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  backgroundColor: '#ffffffdd',
  backdropFilter: 'blur(10px)',
  zIndex: 10
})

const Row = styled('div')({
  width: '100%',
  height: 'auto',
  display: 'flex',
  flexDirection: 'row',
  gap: '16px'
})

const Mask = styled('div')({
  width: '100%',
  height: 'max-content',
  position: 'relative',
  top: 0,
  zIndex: 11,
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 10,
    cursor: 'pointer'
  }
})
