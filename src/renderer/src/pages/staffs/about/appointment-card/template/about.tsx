import { styled } from '@mui/material'
import { useAppSelector, useAppDispatch } from '@renderer/redux/store/hook'
import React from 'react'
import { INSTRUCTION_TOOLS } from './tools/editorjs.js'
import { EditorCore } from '@react-editor-js/core'
import EditorJS, { API } from '@editorjs/editorjs'
import { setCardDetails } from '@renderer/redux/features/user/card.js'
import CustomTypography from '@renderer/components/typography/index.js'
import { grey } from '@mui/material/colors'

const ReactEditor = styled('div')({
  margin: '0px auto',
  '&': {
    width: '90%',
    '*': {
      fontFamily: 'Lato'
    }
  },
  '& .codex-editor__redactor': {
    width: '100%',
    paddingBottom: '0px !important'
  }
})

const AboutTemplate = () => {
  const about = useAppSelector((s) => s.card.editor.data?.['about'])
  const editorRef = React.useRef<EditorCore | null>(null)
  const dispatch = useAppDispatch()
  const handleSave = React.useCallback(async () => {
    if (editorRef.current) {
      const savedData = await editorRef.current?.save()
      dispatch(
        setCardDetails({
          id: 'about',
          value: savedData
        })
      )
    }
  }, [editorRef])

  const handleInitialize = React.useCallback(
    async (instance: EditorCore) => {
      // Do something with the editor instance if needed
      if (about) await instance.render(about)

      editorRef.current = instance
    },
    [about]
  )

  React.useEffect(() => {
    const editorConfig = {
      holder: 'editorjs-react-component',
      tools: INSTRUCTION_TOOLS,
      data: about,
      onChange: async (api: API) => {
        // console.log({ ...about, ...(await api.saver.save()) });
        dispatch(
          setCardDetails({
            id: 'about',
            value: await api.saver.save()
          })
        )
        console.log(await api.saver.save())
      },
      autofocus: true,
      placeholder: 'Write something...',
      hideToolbar: false,
      onReady: () => console.log('Start'),
      onInitialize: handleInitialize,
      defaultValue: about
    }

    const ele = document.querySelector('#editorjs-react-component .codex-editor')
    if (ele) return
    const editor = new EditorJS(editorConfig)
    editor.isReady
      .then(() => {
        editor.on('onRemove', (blockId) => {
          const block = editor.blocks.getBlockByIndex(blockId)
          console.log('Block with ID ' + blockId + ' was removed')
          console.log('Block content: ' + block)
        })
      })
      .catch((err) => console.log(err))
    window.addEventListener('keydown', (e) => handleKey(e))
    return () => window.removeEventListener('keydown', (e) => handleKey(e))
  }, [])

  const handleKey = async (event: KeyboardEvent) => {
    if (event.ctrlKey && (event.key === 's' || event.key === 'S')) {
      event.preventDefault()
      await handleSave()
    }
  }
  return (
    <Container className="template_about scrollbar">
      <CustomTypography
        paddingBottom={'12px'}
        variant={'h4'}
        width={'100%'}
        marginBottom={'12px'}
        borderBottom={`1px solid ${grey['300']}`}
        sx={{
          backgroundColor: 'white',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          paddingTop: '12px'
        }}
      >
        About
      </CustomTypography>
      <ReactEditor
        id={'editorjs-react-component'}
        sx={{
          '&': {
            width: `100%`
          }
        }}
      />
    </Container>
  )
}

export default AboutTemplate

const Container = styled('div')({
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  padding: '0 24px',
  paddingBottom: '12px',
  overflowY: 'auto'
})
