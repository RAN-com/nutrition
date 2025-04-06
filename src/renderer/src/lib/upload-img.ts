import { S3Client, ListObjectsV2Command, DeleteObjectCommand, _Error } from '@aws-sdk/client-s3'
import { generatePassword } from '@renderer/utils/functions'
import { Upload } from '@aws-sdk/lib-storage' // Import the Upload class

interface UploadResponse {
  Location: string
  Key: string
  Bucket: string
  ETag: string
}

interface ListResponse {
  Contents: { Key: string }[]
}

interface DeleteResponse {
  DeleteMarker: boolean
  VersionId?: string
}

// Create an instance of S3Client
const s3 = new S3Client({
  region: import.meta.env.VITE_VERCEL_AWS_BUCKET_REGION as string,
  credentials: {
    accessKeyId: import.meta.env.VITE_VERCEL_AWS_ACCESS_KEY_ID as string,
    secretAccessKey: import.meta.env.VITE_VERCEL_AWS_SECRET_ACCESS_KEY as string
  }
})

/**
 * Upload multiple files to S3 with the folder structure: property-media/{uid}/{filename}
 * @param {string} uid - The property ID for the folder path.
 * @param {File[]} files - The array of files to be uploaded.
 * @param {string[]} customFileNames - Optional custom file names array.
 * @returns {Promise<UploadResponse[]>} - Returns an array of upload results.
 */
export const uploadFiles = async (
  uid: string,
  files: File[],
  additionFolderName?: string[],
  replaceFileName?: string
): Promise<UploadResponse[]> => {
  const uploadPromises = files.map(async (file) => {
    const fileName = generatePassword()
    const folderPath = additionFolderName
      ? `${uid}/${additionFolderName?.join('/')}/${replaceFileName || fileName}`
      : `${uid}/${fileName}`

    const params = {
      Bucket: import.meta.env.VITE_VERCEL_AWS_BUCKET_ID,
      Key: folderPath,
      Body: file.stream(),
      ContentType: file.type
    }

    try {
      // Use the Upload class from @aws-sdk/lib-storage
      const upload = new Upload({
        client: s3,
        params
      })

      // Wait until the upload is complete
      await upload.done()

      return {
        Location: `https://${params.Bucket}.s3.amazonaws.com/${params.Key}`,
        Key: params.Key,
        Bucket: params.Bucket,
        ETag: '' // You can get ETag from response if needed
      }
    } catch (error) {
      console.error(`Error uploading file ${file.name}:`, error)
      if (error instanceof Error) {
        throw new Error(`Failed to upload file ${file.name}: ${error.message}`)
      } else {
        throw new Error(`Failed to upload file ${file.name}: Unknown error`)
      }
    }
  })

  return Promise.all(uploadPromises)
}

/**
 * List files in the folder: property-media/{uid}
 * @param {string} uid - The property ID to list files from.
 * @returns {Promise<ListResponse>} - Returns the list of objects in the folder.
 */
export const listFiles = async (uid: string): Promise<ListResponse> => {
  const params = {
    Bucket: import.meta.env.VITE_VERCEL_AWS_BUCKET_ID,
    Prefix: `property-media/${uid}/`
  }

  try {
    const command = new ListObjectsV2Command(params)
    const response = await s3.send(command)

    return {
      Contents: response.Contents?.map((item) => ({ Key: item.Key! })) || []
    }
  } catch (error) {
    console.error(`Error listing files for ${uid}:`, error)
    if (error instanceof Error) {
      throw new Error(`Failed to list files for ${uid}: ${error.message}`)
    } else {
      throw new Error(`Failed to list files for ${uid}: Unknown error`)
    }
  }
}

/**
 * Delete a file from S3.
 * @param {string} path - The path to the file to be deleted.
 * @returns {Promise<DeleteResponse>} - Returns a response object with delete info.
 */
export const deleteFile = async (path: string): Promise<DeleteResponse> => {
  const p = path.split(`.amazonaws.com`)[1]
  const params = {
    Bucket: import.meta.env.VITE_VERCEL_AWS_BUCKET_ID,
    Key: `${p}`
  }

  try {
    const command = new DeleteObjectCommand(params)
    const response = await s3.send(command)

    return {
      DeleteMarker: response.DeleteMarker ?? false, // Safeguard if undefined
      VersionId: response.VersionId
    }
  } catch (error) {
    console.error(`Error deleting file ${path}:`, error)
    if (error instanceof Error) {
      throw new Error(`Failed to delete file ${path}: ${error.message}`)
    } else {
      throw new Error(`Failed to delete file ${path}: Unknown error`)
    }
  }
}
