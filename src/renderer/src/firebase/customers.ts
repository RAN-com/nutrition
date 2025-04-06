/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, collection } from 'firebase/firestore'
import { firestore } from '.'
import {
  MarathonData,
  CustomerResponse,
  CustomerAttendance,
  CustomerRecords,
  AttendanceSubscription
} from '@renderer/types/customers'
import { CreateCustomer } from '../types/customers'
import { errorToast, infoToast, successToast } from '@renderer/utils/toast'
import { encryptData } from '@renderer/utils/crypto'
import moment from 'moment'
import { updateStaffCount } from './staffs'
import { RecordType } from '@renderer/types/record'

export const getCustomer = async (uid: string, cid: string) => {
  try {
    // Reference to the specific customer document
    const customerDocRef = doc(firestore, `users/${uid}/customers/${cid}`)

    // Fetch the document
    const customerDocSnap = await getDoc(customerDocRef)

    // Check if the document exists
    if (customerDocSnap.exists()) {
      // Return the customer data
      return {
        status: 'success',
        data: customerDocSnap.data()
      }
    } else {
      // Handle the case where the customer does not exist
      return {
        status: 'not_found',
        message: `Customer with ID ${cid} not found for user ${uid}.`
      }
    }
  } catch (err) {
    console.error('Error fetching customer data:', err)
    return {
      status: 'error',
      error: 'An unknown error occurred.'
    }
  }
}

export const getTotalCustomer = async (uid: string) => {
  const customersRef = collection(firestore, `users/${uid}/customers`)
  const allCustomersSnapshot = await getDocs(customersRef)
  const allCustomers = allCustomersSnapshot.docs.map((doc) => doc.data() as CustomerResponse)
  // Total customers and pages
  return allCustomers.length
}

export const getCustomers = async (
  uid: string,
  pageNumber: number,
  limitPerPage: number
): Promise<{
  customers: CustomerResponse[]
  totalDocs: number
  totalPages: number
}> => {
  try {
    const customersRef = collection(firestore, `users/${uid}/customers`)
    const allCustomersSnapshot = await getDocs(customersRef)
    const allCustomers = allCustomersSnapshot.docs.map((doc) => doc.data() as CustomerResponse)
    console.log(allCustomers)
    // Total customers and pages
    const totalDocs = allCustomers.length
    const totalPages = Math.ceil(totalDocs / limitPerPage)

    // Paginate the customers
    const startIndex = (pageNumber - 1) * limitPerPage
    const paginatedCustomers = allCustomers.slice(startIndex, startIndex + limitPerPage)

    return { customers: paginatedCustomers, totalDocs, totalPages }
  } catch (error) {
    console.error('Failed to fetch customers:', error)
    return { customers: [], totalDocs: 0, totalPages: 0 }
  }
}

export const addCustomer = async ({
  created_by,
  email,
  ...others
}: CreateCustomer & {
  available_limit: number
}) => {
  try {
    // Use the email as the unique ID
    const cid = encryptData(others.phone)
    const totalCustomers = await getTotalCustomer(created_by.uid)
    if (totalCustomers >= others.available_limit) {
      errorToast('You have reached the limit of customers')
      return { status: 'error', error: 'You have reached the limit of customers' }
    }
    const docRef = doc(firestore, `users/${created_by.uid}/customers/${cid}`)

    // Check if the customer already exists
    const customerDoc = await getDoc(docRef)
    if (customerDoc.exists()) {
      errorToast(`Customer with phone ${others.phone} already exists.`)
      return { status: 'exists', data: others }
    }

    // Add the new customer data
    await setDoc(docRef, {
      ...others,
      created_by,
      cid,
      email,
      created_at: new Date().toISOString()
    })
    await updateStaffCount({
      uid: created_by.uid,
      sid: others.assigned_staff.sid,
      type: 'customer'
    })
    successToast(`Customer added successfully`)
    return { status: 'success', data: others }
  } catch (error) {
    errorToast('Failed to add customer' + JSON.stringify(error))
    return { status: 'error', error }
  }
}

export const deleteCustomer = async (created_by_uid: string, uid: string) => {
  try {
    const docRef = doc(firestore, `users/${created_by_uid}/customers/${uid}`)
    await deleteDoc(docRef)
    successToast(`Customer deleted successfully`)
    return { status: 'success', message: `Customer ${uid} deleted successfully` }
  } catch (error) {
    errorToast('Error deleting customer')
    return { status: 'error', error }
  }
}

export const updateCustomer = async (
  created_by_uid: string,
  uid: string,
  updates: Partial<Omit<CreateCustomer, 'created_by'>>
) => {
  try {
    const docRef = doc(firestore, `users/${created_by_uid}/customers/${uid}`)
    const customerDocSnap = await getDoc(docRef)

    if (!customerDocSnap.exists()) {
      throw new Error(`Customer::${uid} not found.`)
    }

    // Update the customer data
    await updateDoc(docRef, updates)
    successToast(`Customer  ${uid} updated successfully`)
    return { status: 'success', message: `Customer ${uid} updated successfully` }
  } catch (error) {
    console.error('Error updating customer:', error)
    errorToast('Error updating customer')
    return { status: 'error', error }
  }
}

// Marathon
export const initMarathonDoc = async ({
  uid,
  email
}: {
  uid: string
  email: string
}): Promise<boolean> => {
  try {
    // Generate today's date as a unique start date
    const startDate = new Date().toISOString().split('T')[0] // 'YYYY-MM-DD' format

    // Reference to the Firestore document
    const docRef = doc(firestore, `customers/${uid}/marathon/${startDate}`)

    // Initialize a new document with default values
    await setDoc(docRef, {
      startDate,
      email,
      date: new Date().toISOString(),
      notes: [],
      attendance: 'PRESENT',
      weight: 0 // Default weight, can be updated later
    })

    console.log(`Marathon document created with start date: ${startDate}`)
    return true
  } catch (error) {
    console.error('Error creating marathon document:', error)
    return false
  }
}

export const addOrUpdateMarathon = async ({
  uid,
  cid,
  marathonData
}: {
  uid: string
  cid: string
  marathonData: MarathonData
}) => {
  try {
    const docRef = doc(firestore, `customers/${uid}/${cid}/marathon`)
    const marathonSnap = await getDoc(docRef)

    if (!marathonSnap.exists()) {
      await setDoc(docRef, { marathons: [marathonData] })
    } else {
      const data = marathonSnap.data()
      const updatedMarathons = data.marathons.map((marathon: MarathonData) =>
        marathon.created_on === marathonData.created_on
          ? { ...marathon, ...marathonData }
          : marathon
      )

      if (!updatedMarathons.find((m: MarathonData) => m.created_on === marathonData.created_on)) {
        updatedMarathons.push(marathonData)
      }

      await updateDoc(docRef, { marathons: updatedMarathons })
    }

    console.log('Marathon record updated successfully')
  } catch (error) {
    console.error('Error updating marathon:', error)
    throw error
  }
}

export const getAllMarathons = async ({
  uid,
  cid
}: {
  uid: string
  cid: string
}): Promise<MarathonData[] | null> => {
  try {
    const docRef = doc(firestore, `customers/${uid}/${cid}/marathon`)
    const marathonSnap = await getDoc(docRef)

    if (!marathonSnap.exists()) return null

    const data = marathonSnap.data()
    return data.marathons as MarathonData[]
  } catch (error) {
    console.error('Error fetching marathons:', error)
    throw error
  }
}

export const updateAttendance = async ({
  uid,
  cid,
  attendanceData
}: {
  uid: string
  cid: string
  attendanceData: CustomerAttendance
}) => {
  try {
    // Ensure date is provided
    if (!attendanceData.date) {
      throw new Error('Date is required for the attendance record.')
    }

    const docRef = doc(firestore, `customers/${uid}/attendance/${cid}`)
    const attendanceSnap = await getDoc(docRef)

    if (!attendanceSnap.exists()) {
      errorToast('Attendance record does not exist.')
      return
    }

    const data = attendanceSnap.data() as { records: CustomerAttendance[] }
    const updatedRecords = data.records.map((record: CustomerAttendance) =>
      record.date === attendanceData.date && record.mark_status !== attendanceData?.mark_status
        ? { ...record, ...attendanceData }
        : record
    )

    await updateDoc(docRef, { records: updatedRecords })

    successToast('Attendance record updated successfully')
  } catch (error) {
    errorToast('Error updating attendance')
    throw error
  }
}

export const addAttendance = async ({
  uid,
  cid,
  attendanceData
}: {
  uid: string
  cid: string
  attendanceData: CustomerAttendance
}) => {
  try {
    // Ensure date is provided, else throw error
    if (!attendanceData.date) {
      throw new Error('Date is required for the attendance record.')
    }

    const subscription = await getActiveSubscription(uid, cid)

    if (!subscription) {
      errorToast('This user does not have an active subscription')
      return
    }

    if (subscription?.daysLeft === 0) {
      errorToast('Subscription has expired')
      return
    }

    // Reference to the attendance document
    const docRef = doc(firestore, `customers/${uid}/attendance/${cid}`)
    const attendanceSnap = await getDoc(docRef)

    const reduced = await reduceDaysLeft(uid, cid)
    if (reduced === null) {
      errorToast('Subscription has expired')
      return
    }

    const data = attendanceSnap.data() as {
      records: CustomerAttendance[]
      subscription: AttendanceSubscription[]
    }

    const updatedRecords = data?.records ? [...data.records, attendanceData] : [attendanceData]

    if (!data?.records) {
      await setDoc(docRef, { records: updatedRecords })
    } else {
      await updateDoc(docRef, { records: updatedRecords })
    }

    successToast('Attendance record added successfully for the user')
  } catch (error) {
    errorToast('Error adding attendance record')
    console.error('Error adding attendance record:', error)
    throw error
  }
}

export const getAttendanceRecords = async ({
  uid,
  cid,
  month, // Month in format: 1 (January), 2 (February), ..., 12 (December)
  year // The year in YYYY format
}: {
  uid: string
  cid: string
  month: number
  year: number
}) => {
  try {
    // Reference to the attendance document
    const docRef = doc(firestore, `customers/${uid}/attendance/${cid}`)
    const attendanceSnap = await getDoc(docRef)

    if (!attendanceSnap.exists()) {
      return {
        totalDocs: 0,
        data: []
      }
    }

    // Extract the attendance array from the document
    const data = attendanceSnap.data()
    const allRecords = (data.records || []) as CustomerAttendance[]

    // Filter records that fall within the month
    const filteredRecords = allRecords.filter((record) => {
      const recordDate = moment(record.date) // Assuming the date is in string format (e.g., "2024-12-05")
      return recordDate.month() === month && recordDate.year() === year
    })

    return {
      month,
      year,
      data: filteredRecords
    }
  } catch (error) {
    console.error(error)
    return {
      month,
      year,
      data: []
    }
  }
}

export const addCustomerRecord = async ({
  uid,
  cid,
  data
}: {
  uid: string
  cid: string
  data: Partial<RecordType>
}) => {
  try {
    // Firestore document reference (single document for all records)
    const recordsRef = doc(firestore, `customers/${uid}/records/${cid}`)

    // Fetch the current records
    const existingDoc = await getDoc(recordsRef)

    const oneWeekAgo = new Date().getTime() - 7 * 24 * 60 * 60 * 1000
    const oneWeekMoment = moment(oneWeekAgo)

    // Initialize an empty array if no records exist
    const currentRecords = existingDoc.exists()
      ? (existingDoc.data().records as CustomerRecords[]) || []
      : []

    if (currentRecords.length > 0) {
      const lastRecord = currentRecords[currentRecords.length - 1]
      const lastRecordDate = moment(lastRecord?.recorded_on).isAfter(oneWeekMoment)
      if (lastRecordDate) {
        errorToast('A record for this customer has already been added within the past week.')
        return
      }
    }
    // Calculate the timestamp for one week ago
    // Check if there's already a record for the same `cid` within the last week

    // Add the new record to the array
    const newRecord = {
      ...data,
      cid,
      recorded_on: moment().format('YYYY-MM-DD'), // Timestamp
      recorded_by: uid
    } as RecordType

    // Update the Firestore document with the new record
    await setDoc(recordsRef, { records: [...currentRecords, newRecord] }, { merge: true })

    return newRecord // Return the newly added record
  } catch (error) {
    console.error('Error adding customer record:', error)
    throw new Error('Failed to add customer record')
  }
}

export const getPersonalRecords = async (uid: string, cid: string) => {
  try {
    // Firestore document reference for the customer's record
    const recordRef = doc(firestore, `customers/${uid}/records/${cid}`)

    // Fetch the document
    const docSnapshot = await getDoc(recordRef)

    // Check if the document exists
    if (!docSnapshot.exists()) {
      console.error('No such document found')
      return []
    }

    // Extract the data (assuming the data field contains an array of records)
    const data = docSnapshot.data()?.records as RecordType[]

    if (!data) {
      console.error('No customer records found in the document')
      return []
    }

    return data // Return the list of customer records
  } catch (error) {
    return []
  }
}

export const getActiveSubscription = async (uid: string, cid: string) => {
  try {
    // Firestore document reference for the customer's record
    const recordRef = doc(firestore, `customers/${uid}/subscription/${cid}`)

    // Fetch the document
    const docSnapshot = await getDoc(recordRef)

    // Check if the document exists
    if (!docSnapshot.exists()) {
      console.error('No such document found')
      return null
    }

    // Extract the data (assuming the data field contains an array of records)
    const data = docSnapshot.data()?.subscription as AttendanceSubscription[]
    if (!data || !data.filter((e) => e.isActive && e.daysLeft > 0)[0]) {
      console.error('No customer records found in the document')
      return null
    }

    return data.filter((e) => e.isActive && e.daysLeft > 0)[0] // Return the list of customer records
  } catch (error) {
    return null
  }
}

export const reduceDaysLeft = async (uid: string, cid: string) => {
  const recordRef = doc(firestore, `customers/${uid}/subscription/${cid}`)
  const docSnapshot = await getDoc(recordRef)

  if (!docSnapshot.exists()) {
    console.error('No such document found')
    return null
  }

  const data = docSnapshot.data()?.subscription as AttendanceSubscription[]

  if (!data || !data.filter((e) => e.isActive && e.daysLeft > 0)[0]) {
    console.error('No customer records found in the document')
    return null
  }

  const activeSubscription = data.filter((e) => e.isActive && e.daysLeft > 0)[0]

  const updatedData = data.map((e) =>
    e.id === activeSubscription.id
      ? {
          ...e,
          isActive: e.daysLeft > 1,
          daysLeft: e.daysLeft - 1
        }
      : e
  )

  await updateDoc(recordRef, { subscription: updatedData })

  return updatedData.filter((e) => e.isActive && e.daysLeft > 0)[0]
}

export const setSubscriptionToUser = async ({
  uid,
  cid,
  price,
  totalDays,
  amountPaid
}: {
  uid: string
  cid: string
  totalDays: number
  price: number
  amountPaid: number
}) => {
  try {
    // Firestore document reference (single document for all records)
    const recordsRef = doc(firestore, `customers/${uid}/subscription/${cid}`)

    // Fetch the current records
    const existingDoc = await getDoc(recordsRef)

    // Initialize an empty array if no records exist
    const currentRecords = existingDoc.exists()
      ? (existingDoc.data().subscription as AttendanceSubscription[]) || []
      : []

    // Check if there's already a record for the same `cid` within the last week
    const recentRecord = currentRecords?.[currentRecords?.length - 1]

    if (recentRecord?.isActive && recentRecord?.daysLeft > 0) {
      infoToast(
        'An active subscription available for this user. You can add subscription after ' +
          recentRecord?.daysLeft +
          ' days'
      )
      return
    }

    const id = encryptData(moment().format('YYYY-MM-DD-HH-mm-ss'))
    // Add the new record to the array
    const newRecord = {
      boughtOn: moment().format('YYYY-MM-DD HH:mm:ss'),
      cid,
      uid,
      price,
      daysLeft: totalDays,
      isActive: true,
      totalDays,
      id: id,
      amountPaid
    } as AttendanceSubscription

    // Update the Firestore document with the new record
    await setDoc(recordsRef, { subscription: [...currentRecords, newRecord] }, { merge: true })

    successToast('Subscription added successfully')
    return newRecord // Return the newly added record
  } catch (error) {
    console.error('Error adding customer record:', error)
    throw new Error('Failed to add subscription')
  }
}

export const payDueAmount = async ({
  cid,
  dueAmount,
  uid
}: {
  uid: string
  cid: string
  dueAmount: number
}) => {
  try {
    const recordRef = doc(firestore, `customers/${uid}/subscription/${cid}`)
    const docSnapshot = await getDoc(recordRef)

    if (!docSnapshot.exists()) {
      errorToast('No subscription record found for this user.')
      return
    }

    const data = docSnapshot.data()?.subscription as AttendanceSubscription[]

    if (!data || !data.filter((e) => e.isActive && e.daysLeft > 0)[0]) {
      errorToast('No active subscription found for this user.')
      return
    }

    const activeSubscription = data.filter((e) => e.isActive && e.daysLeft > 0)[0]

    const updatedData = data.map((e) =>
      e.id === activeSubscription.id
        ? {
            ...e,
            amountPaid: e.amountPaid + dueAmount
          }
        : e
    )

    await updateDoc(recordRef, { subscription: updatedData })

    successToast('Due amount paid successfully.')
    return updatedData.filter((e) => e.isActive && e.daysLeft > 0)[0]
  } catch (error) {
    console.error('Error paying due amount:', error)
    errorToast('Failed to pay due amount.')
    throw error
  }
}

export const staffAssignedCustomers = async (uid: string, sid: string) => {
  try {
    const customersRef = collection(firestore, `users/${uid}/customers`)
    const allCustomersSnapshot = await getDocs(customersRef)
    const allCustomers = allCustomersSnapshot.docs.map((doc) => doc.data() as CustomerResponse)
    if (!allCustomers) {
      return []
    }

    return allCustomers.filter((e) => e.assigned_staff?.sid === sid)
  } catch (err) {
    return []
  }
}
