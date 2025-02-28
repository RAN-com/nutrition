import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { firestore } from '.'
import { CardCreateData, CardData } from '@renderer/types/card'
import { errorToast, successToast } from '@renderer/utils/toast'
import moment from 'moment'
import { uploadFiles } from '@renderer/lib/upload-img'

export const getCardDetail = async (sid: string) => {
  const cardQuery = doc(firestore, `cards/${sid}`)
  const cardRef = await getDoc(cardQuery)
  if (cardRef.exists()) {
    return {
      status: true,
      message: 'Details Found',
      data: cardRef.data() as CardData
    }
  }

  return {
    status: false,
    message: 'Detials Not Found',
    data: null
  }
}

const uploadMedia = async (sid: string, data: CardCreateData) => {
  let { photo_gallery = [], video_gallery = [], services = [], ...others } = data

  // Generic function to process and upload media
  const processGallery = async (gallery?: { url: string | File; description?: string }[]) => {
    if (!gallery || gallery.length < 1) return gallery ?? []

    const filesToUpload = gallery
      ?.map((e, idx) => (typeof e.url !== 'string' ? { ...e, idx } : null))
      ?.filter(Boolean) as { url: File; idx: number }[]

    if (filesToUpload.length > 0) {
      console.log('Uploading media...')
      const uploadResponses = await uploadFiles(
        sid,
        filesToUpload.map((e) => e.url)
      )

      uploadResponses.forEach(({ Location }, i) => {
        const { idx } = filesToUpload[i]
        let g = [...(gallery ?? [])]
        g[idx] = { url: Location } // Replace with uploaded URL
        gallery = g
      })

      console.log('Upload complete:', uploadResponses)
    }

    return gallery
  }

  // Process photo_gallery and video_gallery
  photo_gallery = (await processGallery(photo_gallery)) || []
  video_gallery = (await processGallery(video_gallery)) || []

  // Process services safely
  services = services ?? [] // Ensure it's an array
  const servicesToUpload = services
    ?.map((s, idx) => (typeof s.photo_url !== 'string' ? { ...s, idx } : null))
    ?.filter(Boolean) as { photo_url: File; idx: number }[]

  if (servicesToUpload.length > 0) {
    console.log('Uploading service photos...')
    const uploadResponses = await uploadFiles(
      sid,
      servicesToUpload.map((s) => s.photo_url)
    )

    uploadResponses.forEach(({ Location }, i) => {
      const { idx } = servicesToUpload[i]

      // Create a shallow copy of services to avoid mutating the original array
      let g = [...(services ?? [])]

      // Create a new object for the service to avoid mutating a readonly object
      g[idx] = {
        ...g[idx], // Spread the existing properties
        photo_url: Location // Update the photo_url
      }

      // Update the services array with the modified object
      services = g
    })

    console.log('Service uploads complete:', uploadResponses)
  }

  return { ...others, photo_gallery, video_gallery, services }
}

export const addOrUpdateCardDetails = async (sid: string, data: CardCreateData) => {
  const cardQuery = doc(firestore, `cards/${sid}`)
  const cardRef = await getDoc(cardQuery)
  if (cardRef.exists()) {
    errorToast('Card Already Exists. Updating the card now')
    const upload = await uploadMedia(sid, data)
    await updateDoc(cardQuery, {
      ...upload,
      aid: sid,
      updatedOn: moment().format('DD-MM-YYYY'),
      createdFor: sid
    })
    return {
      message: 'Card Data Updated',
      status: true,
      data: cardRef.data()
    }
  } else {
    const upload = await uploadMedia(sid, data)
    await setDoc(cardQuery, {
      ...upload,
      aid: sid,
      createdFor: sid,
      createdOn: moment().format('DD-MM-YYYY')
    })

    successToast('Updated Successfully')
    const getData = await getDoc(cardQuery)
    return {
      message: 'Card Details Added',
      status: true,
      data: getData.data()
    }
  }
}

export const updateCardStatus = async (sid: string, canShow: boolean) => {
  const cardQuery = doc(firestore, `cards/${sid}`)
  const cardRef = await getDoc(cardQuery)

  if (!cardRef?.exists()) {
    return {
      message: 'Create Card First and try again',
      status: false,
      data: null
    }
  }

  await updateDoc(cardQuery, {
    status: canShow
  })

  return {
    message: 'Card Status Updated Successfully',
    data: cardRef?.data(),
    status: true
  }
}

export const updateCardValidity = async (sid: string, valid_till: string) => {
  const cardQuery = doc(firestore, `domains/${sid}`)
  const cardRef = await getDoc(cardQuery)

  if (!cardRef?.exists()) {
    await setDoc(
      cardQuery,
      {
        subscription: {
          valid_till
        }
      },
      { merge: true }
    )
  } else {
    await updateDoc(cardQuery, {
      'subscription.valid_till': valid_till
    })
  }

  return {
    data: cardRef?.data(),
    message: 'Card validity updated',
    status: true
  }
}
