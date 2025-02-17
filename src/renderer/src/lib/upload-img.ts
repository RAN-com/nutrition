import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
  _Error
} from '@aws-sdk/client-s3'
import { generatePassword } from '@renderer/utils/functions'

// Configure the S3 client
const s3 = new S3Client({
  region: import.meta.env.VITE_VERCEL_AWS_BUCKET_REGION as string, // Specify your region
  credentials: {
    accessKeyId: import.meta.env.VITE_VERCEL_AWS_ACCESS_KEY_ID as string,
    secretAccessKey: import.meta.env.VITE_VERCEL_AWS_SECRET_ACCESS_KEY as string
  }
})

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
  additionFolderName?: string[]
): Promise<UploadResponse[]> => {
  const uploadPromises = files.map(async (file) => {
    const fileName = generatePassword()
    const folderPath = additionFolderName
      ? `${uid}/${additionFolderName?.join('/')}/${fileName}`
      : `${uid}/${fileName}`

    const params = {
      Bucket: import.meta.env.VITE_VERCEL_AWS_BUCKET_ID,
      Key: folderPath,
      Body: file,
      ContentType: file.type
    }

    const command = new PutObjectCommand(params)
    const response = await s3.send(command)

    return {
      Location: `https://${params.Bucket}.s3.amazonaws.com/${params.Key}`,
      Key: params.Key,
      Bucket: params.Bucket,
      ETag: response.ETag!
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

  const command = new ListObjectsV2Command(params)
  const response = await s3.send(command)

  return {
    Contents: response.Contents?.map((item) => ({ Key: item.Key! })) || []
  }
}

export const deleteFile = async (path: string): Promise<DeleteResponse> => {
  const params = {
    Bucket: import.meta.env.VITE_VERCEL_AWS_BUCKET_ID,
    Key: `${path}`
  }

  const command = new DeleteObjectCommand(params)
  const response = await s3.send(command)

  return {
    DeleteMarker: response.DeleteMarker!,
    VersionId: response.VersionId
  }
}
