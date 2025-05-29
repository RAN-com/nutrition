import {
  Button,
  CircularProgress,
  Dialog,
  Menu,
  MenuItem,
  Modal,
  styled,
  Tooltip
} from '@mui/material'
import CustomIcon from '@renderer/components/icons'
import CustomTextInput from '@renderer/components/text-input'
import CustomTypography from '@renderer/components/typography'
import { createPost, updatePost } from '@renderer/firebase/posts'
import { deleteFile, uploadFiles } from '@renderer/lib/upload-img'
import { asyncGetUserPosts } from '@renderer/redux/features/user/posts'
import { useAppSelector, useAppDispatch } from '@renderer/redux/store/hook'
import { PostsResponse } from '@renderer/types/posts'
import { capitalizeSentence } from '@renderer/utils/functions'
import { errorToast } from '@renderer/utils/toast'
import { useFormik } from 'formik'
import moment from 'moment'
import { enqueueSnackbar, SnackbarKey, SnackbarProvider, closeSnackbar } from 'notistack'
import { useState } from 'react'
import * as yup from 'yup'

type Props = {
  edit?: PostsResponse
  open: boolean
  onExit(): void
  onSubmitted(postedId: string): void
  type: 'work' | 'nutritional-information'
}

const validationSchema = yup.object({
  title: yup
    .string()
    .required('Title is required')
    .max(100, 'Title must be at most 100 characters'),
  description: yup
    .string()
    .required('Description is required')
    .max(5000, 'Description must be at most 5000 characters'),
  files: yup
    .array()
    .of(
      yup.object().shape({
        type: yup
          .string()
          .oneOf(['image', 'video'], 'File type must be image or video')
          .required('File type is required'),
        url: yup
          .string()
          .matches(
            /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
            'Invalid URL format'
          )
          .required('File URL is required'),
        isThumbnail: yup.boolean().optional()
      })
    )
    .optional(),
  label: yup.string().optional().nullable().max(100, 'Link label must be at most 100 characters'),
  url: yup
    .string()
    .matches(/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/, 'Invalid URL format')
    .optional()
    .nullable()
    .max(2000, 'Link URL must be at most 2000 characters'),
  links: yup
    .array()
    .of(
      yup.object().shape({
        label: yup.string().required('Link label is required'),
        url: yup
          .string()
          .matches(
            /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
            'Invalid URL format'
          )
          .required('Link URL is required')
      })
    )
    .optional()
})

export default function CreatePostModal({ onExit, onSubmitted, open, type, edit }: Props) {
  const [loading, setLoading] = useState(false)

  const [isUploading, setIsUploading] = useState(false)
  const dispatch = useAppDispatch()
  const [filesUploading, setFilesUploading] = useState(0)
  const [deleting, setDeleting] = useState<null | string>(null)

  const user = useAppSelector((s) => s.auth.user?.uid)
  const formik = useFormik({
    enableReinitialize: !!edit,
    initialValues: {
      title: edit?.title || '',
      description: edit?.description || '',
      label: '',
      url: '',
      files: edit?.files || ([] as PostsResponse['files']),
      links: edit?.links || ([] as PostsResponse['links'])
    },
    validationSchema,
    onSubmit: async ({ files, description, title, links }) => {
      try {
        setLoading(true)
        let postedId: string | null
        if (!edit) {
          postedId = await createPost(user as string, type, {
            description,
            files,
            title,
            links,
            createdAt: moment().toISOString()
          })
          onSubmitted(postedId as string)
          onExit()
          formik.resetForm()
        } else {
          postedId = await updatePost(user as string, edit?.id, type, {
            description,
            files,
            title,
            links,
            updatedAt: moment().toISOString()
          })
        }
        onSubmitted(postedId as string)
        dispatch(asyncGetUserPosts({ uid: user as string, type }))
        formik.resetForm()
        onExit()
      } catch (error) {
        console.error('Error creating post:', error)
        errorToast(`Failed to create post: ${error}`)
      } finally {
        setLoading(false)
      }
    }
  })

  console.log(edit)

  const [anchorEl, setAnchorEl] = useState<{
    element: HTMLElement | null
    data: PostsResponse['files'][number]
  } | null>(null)

  const handleSetAsThumbnail = (
    file: PostsResponse['files'][number] | null | undefined,
    isActive: boolean
  ) => {
    console.log(file, isActive)
    if (!file) {
      enqueueSnackbar('No file selected to set as thumbnail', {
        variant: 'error',
        autoHideDuration: 2000
      })
      return
    }

    // Create a deep copy of the array with new object references
    const values = formik.values.files.map((f) => ({ ...f }))
    console.log(values)
    const idx = values.findIndex((e) => !!e.isThumbnail)
    if (idx !== -1) {
      values[idx].isThumbnail = false
    }

    const fileIdx = values.findIndex((e) => e.url.includes(file.url))

    if (fileIdx !== -1) {
      if (values[fileIdx]?.type === 'video') {
        enqueueSnackbar('Cannot set video as thumbnail', {
          variant: 'error',
          autoHideDuration: 2000
        })
        return
      }
      values[fileIdx].isThumbnail = !isActive
    }

    formik.setFieldValue('files', values)
  }

  const handleDeleteFile = async (file: PostsResponse['files'][number] | null | undefined) => {
    if (!file) {
      errorToast('No file selected to delete')
      return
    }

    try {
      setDeleting(file.url)
      await deleteFile(file.url)
      formik.setFieldValue(
        'files',
        formik.values.files.filter((f) => f.url !== file.url)
      )
      enqueueSnackbar('File deleted successfully', { variant: 'success' })
    } catch (error) {
      errorToast(`Failed to delete file: ${error}`)
      console.error('File deletion error:', error)
    } finally {
      setDeleting(null)
      setAnchorEl(null)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsUploading(true)
      const files = event.target.files
      if (!files || files.length === 0) {
        enqueueSnackbar('No files selected', { variant: 'error' })
        return
      }
      if (files.length > 5) {
        enqueueSnackbar('You can upload a maximum of 5 files', { variant: 'error' })
        event.target.value = '' // Clear the input
        return
      }
      setFilesUploading(files.length)
      const newFiles = await Promise.all(
        Array.from(files).map(async (file) => {
          const fileType = file.type.startsWith('video/') ? 'video' : 'image'
          try {
            const url = await uploadFiles(user as string, [file], ['posts', type])
            return { type: fileType, url: url[0].Location, isThumbnail: false }
          } catch (error) {
            errorToast(`Failed to upload ${file.name}: ${error}`)
            return null
          }
        })
      ).then((results) => results.filter((result) => result !== null))

      formik.setFieldValue('files', [...formik.values.files, ...newFiles])
      event.target.value = '' // Clear the input

      if (newFiles.length > 0) {
        enqueueSnackbar(`${newFiles.length} file(s) uploaded successfully`, { variant: 'success' })
      }
    } catch (error) {
      errorToast(`Upload failed: ${error}`)
      console.error('File upload error:', error)
    } finally {
      setIsUploading(false)
      setFilesUploading(0)
    }
  }

  const handleLinkChange = (field: 'label' | 'url', value: string) => {
    formik.setFieldValue(`${field}`, value)
  }
  const handleAddLink = () => {
    if (!formik.values.label || !formik.values.url) {
      enqueueSnackbar('Both link title and URL are required', {
        autoHideDuration: 1000,
        variant: 'error'
      })
      return
    }
    formik.setFieldValue('links', [
      ...(formik.values.links || []),
      { label: formik.values.label, url: formik.values.url }
    ])
    formik.setFieldValue('label', '')
    formik.setFieldValue('url', '')
  }

  console.log(formik.errors?.links)

  let snackbar: SnackbarKey | null = null
  const handleExit = () => {
    if (snackbar) return
    if (formik.dirty) {
      snackbar = enqueueSnackbar('You have unsaved changes. Are you sure you want to exit?', {
        preventDuplicate: true,
        className: 'exit_snackbar',
        variant: 'error',
        action: () => (
          <>
            <Button
              onClick={() => {
                onExit()
                formik.resetForm()
                snackbar = null
              }}
              color="inherit"
            >
              Yes
            </Button>
            <Button
              color={'inherit'}
              onClick={() => {
                if (snackbar) closeSnackbar(snackbar)
                snackbar = null
              }}
            >
              Cancel
            </Button>
          </>
        )
      })
    } else {
      onExit()
      formik.resetForm()
      snackbar = null
    }
  }

  const isThumbnailSet = formik.values.files?.filter((e) => e.isThumbnail).length === 1
  // Check if URL and label are valid when adding links
  const isValidUrl = (() => {
    // If both fields are empty, no validation needed
    if (formik.values.label.length === 0 && formik.values.url.length === 0) {
      return false
    }

    // If one field is filled but other is empty, it's invalid
    if (
      (formik.values.label.length > 0 && formik.values.url.length === 0) ||
      (formik.values.label.length === 0 && formik.values.url.length > 0)
    ) {
      return true
    }

    // If both fields are filled, check for validation errors
    if (formik.values.label.length > 0 && formik.values.url.length > 0) {
      return !!formik.errors.url || !!formik.errors.label
    }

    return false
  })()
  return (
    <Dialog
      open={open}
      onClose={handleExit}
      maxWidth="xs"
      slotProps={{
        paper: {
          sx: {
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            padding: '12px 24px',
            paddingBottom: '24px',
            justifyContent: 'space-between'
          }
        }
      }}
    >
      <Modal open={loading}>
        <CircularProgress />
      </Modal>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <CustomTypography variant="h6" style={{ marginBottom: '8px' }}>
          {edit ? 'Update' : 'Add'} {type.split('-').map(capitalizeSentence).join(' ')}
        </CustomTypography>
        <CustomTextInput
          input={{
            value: formik.values.title,
            onChange: formik.handleChange,
            name: 'title',
            label: 'Title',
            error: formik.touched.title && Boolean(formik.errors.title),
            helperText: formik.touched.title ? formik.errors.title : '',
            placeholder: `Enter title here...`,
            style: { fontSize: '1rem', fontWeight: 500 }
          }}
        />
        <CustomTextInput
          input={{
            multiline: true,
            value: formik.values.description,
            onChange: formik.handleChange,
            label: 'Description',
            name: 'description',
            error: formik.touched.description && Boolean(formik.errors.description),
            helperText: formik.touched.description ? formik.errors.description : '',
            rows: 8,
            placeholder: `Enter description here...`,
            style: { fontSize: '1rem', fontWeight: 400, minHeight: '100px' }
          }}
        />
        <CustomTypography variant="subtitle1" style={{ marginTop: '16px' }}>
          Attach Files&nbsp;
          <br />
          {'\n'}
          <CustomTypography variant="body2" style={{}}>
            ( Set Thumbnail after uploading )
          </CustomTypography>
        </CustomTypography>
        <div
          style={{
            width: '100%',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            flexDirection: 'row'
          }}
        >
          {isUploading && (
            <ButtonCard>
              <CircularProgress variant="indeterminate" />
              <CustomTypography textAlign={'center'}>
                Uploading {filesUploading} {filesUploading > 1 ? 'files' : 'file'}
              </CustomTypography>
            </ButtonCard>
          )}
          {formik.values.files.map((e) => (
            <ButtonCard
              sx={{
                padding: '0px',
                '& img, & video': {
                  width: '100%',
                  height: '100%'
                }
              }}
            >
              {e.type === 'image' ? (
                <img
                  src={e.url}
                  alt="Post file"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '8px'
                  }}
                />
              ) : e.type === 'video' ? (
                <video src={e.url} muted autoPlay={false} controls />
              ) : (
                'File type not supported'
              )}

              <div className="icon">
                {deleting === e.url ? (
                  <CircularProgress variant="indeterminate" size={18} />
                ) : (
                  <>
                    {e.isThumbnail && (
                      <Tooltip title={'Thumbnail image'} followCursor>
                        <span>
                          <CustomIcon
                            name="LUCIDE_ICONS"
                            icon="LuGalleryThumbnails"
                            sx={{
                              padding: '4px',
                              backgroundColor: '#6de9ffaa',
                              backdropFilter: 'blur(10px)',
                              borderRadius: '8px'
                            }}
                            color="#005353"
                            onClick={(evt) => {
                              setAnchorEl({
                                element: evt.currentTarget,
                                data: e
                              })
                            }}
                          />
                        </span>
                      </Tooltip>
                    )}
                    <CustomIcon
                      name="MATERIAL_DESIGN"
                      icon="MdMoreVert"
                      sx={{
                        padding: '4px',
                        backgroundColor: '#ffffffaa',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '8px'
                      }}
                      color="black"
                      onClick={(evt) => {
                        setAnchorEl({
                          element: evt.currentTarget,
                          data: e
                        })
                      }}
                    />
                  </>
                )}
              </div>
            </ButtonCard>
          ))}
          <ButtonCard>
            <input
              type="file"
              multiple={true}
              max={5}
              accept="image/*, video/*"
              style={{
                opacity: 0,
                position: 'absolute',
                width: '100%',
                height: '100%',
                cursor: 'pointer',
                zIndex: 10
              }}
              onChange={handleFileUpload}
            />
            <CustomIcon
              name="LUCIDE_ICONS"
              icon="LuImagePlus"
              color="#000"
              stopPropagation={false}
              size={24}
              style={{ marginBottom: '8px' }}
            />
            <CustomTypography>Add Image / Video</CustomTypography>
          </ButtonCard>
        </div>
        <CustomTypography variant="subtitle1" style={{ marginTop: '16px' }}>
          Add Links (Optional)
        </CustomTypography>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <CustomTextInput
            input={{
              label: 'Link Title',
              size: 'small',
              placeholder: 'Enter link title here...',
              value: formik.values.label,
              onChange: (e) => {
                handleLinkChange('label', e.target.value)
              },
              error: formik.touched.links && Boolean(formik.errors.links),
              helperText: formik.touched.links ? formik.errors.links : ''
            }}
          />
          <CustomTextInput
            input={{
              label: 'Link URL',
              placeholder: 'Enter link URL here...',
              value: formik.values.url,
              size: 'small',
              onChange: (e) => {
                handleLinkChange('url', e.target.value)
              },
              slotProps: {
                input: {
                  endAdornment: (
                    <Button
                      variant="text"
                      color="primary"
                      sx={{ height: 'max-content' }}
                      onClick={handleAddLink}
                      disabled={isValidUrl}
                      style={{ alignSelf: 'center' }}
                    >
                      <CustomTypography>Add</CustomTypography>
                    </Button>
                  )
                }
              },
              error: formik.touched.links && Boolean(formik.errors.links),
              helperText: formik.touched.links ? formik.errors.links : ''
            }}
          />
        </div>
        {formik.values.links && formik.values.links.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
            {formik.values.links.map((link, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CustomTypography variant="body2" style={{ flex: 1 }}>
                  {link.label}: {link.url}
                </CustomTypography>
                <CustomIcon
                  name="MATERIAL_DESIGN"
                  icon="MdDelete"
                  color="error"
                  onClick={() => {
                    formik.setFieldValue(
                      'links',
                      formik.values.links?.filter((_, i) => i !== index)
                    )
                  }}
                  style={{ cursor: 'pointer' }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row-reverse',
          gap: '8px',
          paddingTop: '24px'
        }}
      >
        <Button
          variant="contained"
          color="primary"
          type="submit"
          onClick={formik.submitForm}
          sx={{ marginRight: '8px' }}
          disabled={
            isUploading ||
            formik.isSubmitting ||
            !formik.isValid ||
            Object.keys(formik.errors).length !== 0 ||
            !isThumbnailSet
          }
        >
          <CustomTypography>{edit ? 'Update Post' : `Create Post`}</CustomTypography>
        </Button>
        <Button onClick={handleExit} variant="outlined">
          <CustomTypography>Cancel</CustomTypography>
        </Button>
      </div>
      <SnackbarProvider />
      <Menu
        anchorEl={anchorEl?.element}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        slotProps={{
          paper: {
            sx: {
              width: '200px',
              paddingTop: '0px',
              borderRadius: '8px'
            }
          }
        }}
      >
        <MenuItem
          onClick={() => {
            handleSetAsThumbnail(anchorEl?.data, Boolean(anchorEl?.data?.isThumbnail))
            setAnchorEl(null)
          }}
        >
          {anchorEl?.data?.isThumbnail ? 'Remove thumbnail' : 'Set as Thumbnail'}
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleDeleteFile(anchorEl?.data)
            setAnchorEl(null)
          }}
        >
          Delete
        </MenuItem>
      </Menu>
    </Dialog>
  )
}

const ButtonCard = styled('div')({
  width: '200px',
  aspectRatio: '2/2.5',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '12px',
  borderRadius: '8px',
  backgroundColor: '#f0f0f0',
  cursor: 'pointer',
  position: 'relative',
  top: 0,
  '.icon': {
    position: 'absolute',
    top: '12px',
    right: '8px',
    display: 'flex',
    flexDirection: 'row',
    gap: '4px'
  },
  '&:hover': {
    backgroundColor: '#e0e0e0'
  }
})
