/* eslint-disable @typescript-eslint/explicit-function-return-type */
import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  arrayUnion
} from 'firebase/firestore'
import { firestore } from '.'

import { VisitorData, VisitorCreate } from '../types/visitor'
import { errorToast, successToast } from '@renderer/utils/toast'
import { encryptData } from '@renderer/utils/crypto'
import { updateStaffCount } from './staffs'

export const getVisitor = async (uid: string, vid: string) => {
  try {
    // Reference to the specific visitor document
    const visitorDocRef = doc(firestore, `users/${uid}/visitors/${vid}`)

    // Fetch the document
    const visitorDocSnap = await getDoc(visitorDocRef)

    // Check if the document exists
    if (visitorDocSnap.exists()) {
      // Return the visitor data
      return {
        status: 'success',
        data: visitorDocSnap.data()
      }
    } else {
      // Handle the case where the visitor does not exist
      return {
        status: 'not_found',
        message: `Visitor with ID ${vid} not found for user ${uid}.`
      }
    }
  } catch (err) {
    console.error('Error fetching visitor data:', err)
    return {
      status: 'error',
      error: 'An unknown error occurred.'
    }
  }
}

export const getTotalVisitor = async (uid: string) => {
  const visitorsRef = collection(firestore, `users/${uid}/visitors`)
  const allVisitorsSnapshot = await getDocs(visitorsRef)
  const allVisitors = allVisitorsSnapshot.docs.map((doc) => doc.data() as VisitorData)
  // Total visitors and pages
  return allVisitors.length
}

export const getVisitors = async (
  uid: string,
  pageNumber: number,
  limitPerPage: number
): Promise<{
  visitors: VisitorData[]
  totalDocs: number
  totalPages: number
}> => {
  try {
    const visitorsRef = collection(firestore, `users/${uid}/visitors`)
    const allVisitorsSnapshot = await getDocs(visitorsRef)
    const allVisitors = allVisitorsSnapshot.docs.map((doc) => doc.data() as VisitorData)
    console.log(allVisitors)
    // Total visitors and pages
    const totalDocs = allVisitors.length
    const totalPages = Math.ceil(totalDocs / limitPerPage)

    // Paginate the visitors
    const startIndex = (pageNumber - 1) * limitPerPage
    const paginatedVisitors = allVisitors.slice(startIndex, startIndex + limitPerPage)

    return { visitors: paginatedVisitors, totalDocs, totalPages }
  } catch (error) {
    console.error('Failed to fetch visitors:', error)
    return { visitors: [], totalDocs: 0, totalPages: 0 }
  }
}

export const addVisitor = async ({
  created_by,
  created_on,
  address,
  name,
  photo_url,
  phone,
  date_of_birth,
  email,
  gender,
  assigned_staff
}: VisitorCreate) => {
  try {
    // Validate email and phone
    if (!email || !phone) {
      errorToast('Email and phone are required.')
      return { status: 'error', message: 'Missing email or phone' }
    }

    // Generate unique visitor ID
    const vid = (encryptData(`${email}${phone}`) ?? '')?.split('/').join('')
    const docRef = doc(firestore, `users/${created_by}/visitors/${vid}`)

    // Check if the visitor already exists
    const visitorDoc = await getDoc(docRef)
    if (visitorDoc.exists()) {
      errorToast('Visitor with this email or phone already exists.')
      return { status: 'exists' }
    }

    // Add the new visitor data
    await setDoc(docRef, {
      data: {
        email,
        created_by,
        created_on,
        address,
        name,
        photo_url,
        phone,
        date_of_birth,
        vid,
        gender
      },
      records: [] // Initialize records array
    })

    await updateStaffCount({
      uid: created_by,
      sid: assigned_staff?.sid as string,
      type: 'visitors'
    })

    successToast('Visitor added successfully.')
    return { status: 'success' }
  } catch (error: unknown) {
    const errorMessage = (error as Error).message || 'Unknown error'
    errorToast(`Failed to add visitor: ${errorMessage}`)
    return { status: 'error', error: errorMessage }
  }
}

export const updateVisitor = async (
  created_by_uid: string,
  uid: string,
  data: VisitorData['data']
) => {
  try {
    const docRef = doc(firestore, `users/${created_by_uid}/visitors/${uid}`)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      throw new Error('Visitor document does not exist.')
    }

    // Update Firestore document
    await updateDoc(docRef, {
      data: {
        ...data
      }
    })

    successToast(`Visitor updated successfully`)
    return { status: 'success', message: `Visitor ${uid} updated successfully` }
  } catch (error) {
    errorToast('Error updating visitor')
    return { status: 'error', error }
  }
}

export const deleteVisitor = async (created_by_uid: string, uid: string) => {
  try {
    const docRef = doc(firestore, `users/${created_by_uid}/visitors/${uid}`)
    await deleteDoc(docRef)

    successToast(`Visitor deleted successfully`)
    return { status: 'success', message: `Visitor ${uid} deleted successfully` }
  } catch (error) {
    errorToast('Error deleting visitor')
    return { status: 'error', error }
  }
}
export const addVisitorRecord = async ({
  uid,
  vid,
  ...data
}: VisitorData['records'][number] & { uid: string; vid: string }) => {
  try {
    const docRef = doc(firestore, `users/${uid}/visitors/${vid}`)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      throw new Error('Visitor document does not exist.')
    }

    // Update Firestore document
    await updateDoc(docRef, {
      records: arrayUnion({
        ...data // Ensure this is a unique object, or Firestore won't add it
      })
    })

    successToast(`Visitor record added successfully`)
    return { status: 'success', message: `Record added to visitor` }
  } catch (error: any) {
    errorToast(error.message || 'An error occurred while adding the record')
    return { status: 'error', message: error.message }
  }
}

export const updateVisitorRecord = async ({
  uid,
  vid,
  ...data
}: VisitorData['records'][number] & { uid: string; vid: string }) => {
  try {
    const docRef = doc(firestore, `users/${uid}/visitors/${vid}`)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      throw new Error('Visitor document does not exist.')
    }

    // Update Firestore document
    await updateDoc(docRef, {
      records: arrayUnion({
        ...data // Ensure this is a unique object, or Firestore won't add it
      })
    })

    successToast(`Visitor record added successfully`)
    return { status: 'success', message: `Record added to visitor` }
  } catch (error: any) {
    errorToast(error.message || 'An error occurred while adding the record')
    return { status: 'error', message: error.message }
  }
}

export const convertVisitorToCustomer = async (uid: string, vid: string) => {
  try {
    const visitorDocRef = doc(firestore, `users/${uid}/visitors/${vid}`)
    const visitorDocSnap = await getDoc(visitorDocRef)

    if (!visitorDocSnap.exists()) {
      throw new Error('Visitor document does not exist.')
    }

    // Get the visitor data
    const visitorData = visitorDocSnap.data() as VisitorData

    const { data } = visitorData

    // Add the visitor data to the customers collection
    const customersRef = collection(firestore, `users/${uid}/customers`)
    const docs = await getDocs(customersRef)
    const cid = encryptData(data.email) as string
    const docRef = doc(firestore, `users/${uid}/customers/${cid}`)

    const exists = docs.docs.filter((doc) => encryptData(doc.data().email) === data.email)

    if (exists.length >= 1) {
      errorToast('Customer with this email or phone already exists.')
      return { status: 'exists' }
    }

    // Add the new customer data
    await setDoc(docRef, {
      ...data,
      cid
    })

    // Delete the visitor data
    await deleteDoc(visitorDocRef)
    successToast('Visitor converted to customer successfully.')
    return { status: 'success' }
  } catch (error: any) {
    errorToast(error.message || 'An error occurred while converting the visitor')
    return { status: 'error', message: error.message }
  }
}

export const staffAssignedVisitors = async (uid: string, sid: string) => {
  try {
    const visitorsRef = collection(firestore, `users/${uid}/visitors`)
    const allVisitorsSnapshot = await getDocs(visitorsRef)
    const allVisitors = allVisitorsSnapshot.docs.map((doc) => doc.data() as VisitorData)
    if (!allVisitors) {
      return []
    }

    return allVisitors.filter((e) => e?.data?.assigned_staff?.sid === sid)
  } catch (err) {
    return []
  }
}
