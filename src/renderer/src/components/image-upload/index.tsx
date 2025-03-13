import { styled } from '@mui/material'
import React from 'react'
import CustomIcon from '../icons'

type Props = {
  uploaded_urls?: (File | string)[] // Array of uploaded image URLs
  onChange?(e: React.ChangeEvent<HTMLInputElement>): void // On change handler for file input
  onClear?(index: number): void // On clear specific image handler
  label?: React.ReactNode // Label for the upload area
  multiple?: boolean
}

const ImageUpload = ({
  label,
  onChange,
  uploaded_urls = [],
  onClear,
  multiple = true
}: Props): React.ReactNode => {
  // Handle the change in file input (multiple files)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      if (onChange) {
        onChange(e) // Propagate the change event if provided
      }
    }
  }

  // Handle image removal
  const handleClearImage = (index: number) => {
    if (onClear) {
      onClear(index) // Pass the index of the image being removed to the parent
    }
  }

  return (
    <>
      {label && <div>{label}</div>}
      <Container>
        {uploaded_urls.map((image, index) => (
          <div key={index} className="image-container">
            <img
              src={typeof image === 'string' ? image : URL.createObjectURL(image)}
              alt={`uploaded_image_${index}`}
            />
            <div className="content">
              <CustomIcon
                onClick={() => handleClearImage(index)}
                name={'LUCIDE_ICONS'}
                icon={'LuTrash'}
                color={'white'}
                size={18}
                sx={{
                  padding: '8px',
                  backgroundColor: '#ff0000aa',
                  borderRadius: '4px'
                }}
              />
            </div>
          </div>
        ))}
        {uploaded_urls?.length >= 1 ? (
          multiple ? (
            <div className="upload">
              <CustomIcon name={'LUCIDE_ICONS'} icon={'LuPlus'} color={'grey'} />
              <input type="file" multiple onChange={handleFileChange} accept="image/*" />
            </div>
          ) : null
        ) : (
          <div className="upload">
            <CustomIcon name={'LUCIDE_ICONS'} icon={'LuPlus'} color={'grey'} />
            <input type="file" multiple onChange={handleFileChange} accept="image/*" />
          </div>
        )}
      </Container>
    </>
  )
}

export default ImageUpload

// Styled component for the container
const Container = styled('div')({
  width: '100%',
  height: 'max-content',
  display: 'flex',
  flexDirection: 'row',
  maxWidth: '100%',
  padding: '12px 12px 12px 12px',
  backgroundColor: '#F6F6F7',
  margin: '12px 0px',
  gap: '12px',
  overflowX: 'auto',
  '& img': {
    width: '80px',
    height: '80px',
    objectFit: 'cover',
    border: '1px solid #262626',
    borderRadius: '12px'
  },
  position: 'relative',
  top: 0,
  '.upload': {
    width: '80px',
    height: '80px',
    minWidth: '80px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px dashed',
    '& input': {
      width: '100%',
      height: '100%',
      position: 'absolute',
      top: 0,
      left: 0,
      zIndex: 1,
      opacity: 0
    }
  },

  // '& .uploaded-images': {
  //   display: 'flex',
  //   flexDirection: 'row',
  //   gap: '12px',
  //   minWidth: '80px',
  //   flexWrap: 'wrap',
  // }
  '& .image-container': {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    overflow: 'hidden',
    '.content': {
      width: '100%',
      borderRadius: '12px',
      height: '100%',
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      opacity: 0,
      '&:hover': {
        opacity: 1,
        backgroundColor: '#ff0000aa'
      }
    }
  },

  '& input[type="file"]': {
    display: 'block',
    width: '100%',
    padding: '12px',
    backgroundColor: '#FFF',
    border: '1px solid #262626',
    borderRadius: '4px',
    cursor: 'pointer'
  }
})
