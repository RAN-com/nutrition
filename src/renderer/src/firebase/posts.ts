import { collection, deleteDoc, doc, getDoc, getDocs, setDoc } from 'firebase/firestore'
import { firestore } from '.'
import { CreatePostDetails, PostsResponse } from '@renderer/types/posts'
import { encryptData } from '@renderer/utils/crypto'
import moment from 'moment'
import { enqueueSnackbar } from 'notistack'
import { deleteFile } from '@renderer/lib/upload-img'

export const getAllPosts = async (uid: string, type: 'work' | 'nutritional-information') => {
  const postRef = collection(firestore, `${type}/${uid}/posts`)
  const postSnap = await getDocs(postRef)

  if (postSnap.empty) {
    return []
  }
  if (!postSnap.docs) {
    return []
  }
  return postSnap.docs.map((doc) => {
    const data = doc.data() as PostsResponse
    return {
      ...data,
      id: doc.id
    }
  }) as PostsResponse[]
}

export const getPostById = async (
  uid: string,
  postId: string,
  type: 'work' | 'nutritional-information'
) => {
  const postRef = doc(firestore, `${type}/${uid}/posts/${postId}`)
  const postSnap = await getDoc(postRef)

  if (postSnap.exists()) {
    return postSnap.data() as PostsResponse
  } else {
    return null
  }
}

export const createPost = async (
  uid: string,
  type: 'work' | 'nutritional-information',
  data: CreatePostDetails
) => {
  try {
    const id = encryptData(uid + type + moment().toString())
    const postRef = doc(firestore, `${type}/${uid}/posts/${id}`)

    if (!data.files || data.files.length === 0) {
      enqueueSnackbar('Post must have at least one file', {
        variant: 'error',
        autoHideDuration: 3000
      })
      return null
    }

    if (!data.files.some((file) => file.isThumbnail)) {
      // If no thumbnail is set, set the first file as the thumbnail
      data.files[0].isThumbnail = true
    }

    if (!data.title || !data.description) {
      enqueueSnackbar('Post must have a title and description', {
        variant: 'error',
        autoHideDuration: 3000
      })
      return null
    }

    if (!data.files.every((file) => file.type === 'image' || file.type === 'video')) {
      enqueueSnackbar('Post files must be of type image or video', {
        variant: 'error',
        autoHideDuration: 3000
      })
      return null
    }

    if (data.links && !data.links.every((link) => link.label && link.url)) {
      enqueueSnackbar('All links must have a label and a URL', {
        variant: 'error',
        autoHideDuration: 3000
      })
      return null
    }

    if (!postRef) {
      enqueueSnackbar('Post reference is not valid', {
        variant: 'error',
        autoHideDuration: 3000
      })
      return null
    }

    await setDoc(
      postRef,
      {
        ...data,
        createdAt: moment().toISOString(),
        updatedAt: moment().toISOString()
      },
      { merge: true }
    )

    enqueueSnackbar('Post created successfully', {
      variant: 'success',
      autoHideDuration: 3000
    })

    return postRef.id
  } catch (error) {
    enqueueSnackbar(
      `Error creating post: ${error instanceof Error ? error.message : 'Unknown error'}`,
      {
        variant: 'error',
        autoHideDuration: 3000
      }
    )
    return null
  }
}

export const updatePost = async (
  uid: string,
  postId: string,
  type: 'work' | 'nutritional-information',
  data: CreatePostDetails
) => {
  try {
    const postRef = doc(firestore, `${type}/${uid}/posts/${postId}`)

    if (!postRef) {
      enqueueSnackbar('Post reference is not valid', {
        variant: 'error',
        autoHideDuration: 3000
      })
      return null
    }

    await setDoc(
      postRef,
      {
        ...data,
        updatedAt: moment().toISOString()
      },
      { merge: true }
    )

    enqueueSnackbar('Post updated successfully', {
      variant: 'success',
      autoHideDuration: 3000
    })

    return postRef.id
  } catch (error) {
    enqueueSnackbar(
      `Error updating post: ${error instanceof Error ? error.message : 'Unknown error'}`,
      {
        variant: 'error',
        autoHideDuration: 3000
      }
    )
    return null
  }
}

export const deletePost = async (
  uid: string,
  postId: string,
  type: 'work' | 'nutritional-information'
) => {
  try {
    const post = await getPostById(uid, postId, type)
    if (!post) {
      enqueueSnackbar('Post not found', {
        variant: 'error',
        autoHideDuration: 3000
      })
      return null
    }

    const postRef = doc(firestore, `${type}/${uid}/posts/${postId}`)

    if (!postRef) {
      enqueueSnackbar('Post reference is not valid', {
        variant: 'error',
        autoHideDuration: 3000
      })
      return null
    }

    const files = post?.files

    if (files && files.length > 0) {
      // Here you would typically delete the files from your storage
      // For example, if you're using Firebase Storage, you would delete each file
      // This is a placeholder for the actual file deletion logic
      console.log('Files to delete:', files)
      const del = await Promise.all(
        files.map(async (file) => {
          await deleteFile(file.url)
          return true
        })
      )

      if (del.length === 0) {
        enqueueSnackbar('No files to delete', {
          variant: 'info',
          autoHideDuration: 3000
        })
      }
      enqueueSnackbar('UPloaded Files deleted successfully', {
        variant: 'success',
        autoHideDuration: 3000
      })
    }

    await deleteDoc(postRef)

    enqueueSnackbar('Post deleted successfully', {
      variant: 'success',
      autoHideDuration: 3000
    })

    return postId
  } catch (error) {
    enqueueSnackbar(
      `Error deleting post: ${error instanceof Error ? error.message : 'Unknown error'}`,
      {
        variant: 'error',
        autoHideDuration: 3000
      }
    )
    return null
  }
}
