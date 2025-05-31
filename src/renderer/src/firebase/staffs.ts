import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  setDoc,
  deleteDoc,
  writeBatch,
  arrayUnion
} from 'firebase/firestore'
import { firestore } from './'
import { StaffData, StaffAttendance } from '@renderer/types/staff'
import { errorToast, successToast } from '@renderer/utils/toast'
import { encryptData } from '@renderer/utils/crypto'
import { CustomerResponse } from '@renderer/types/customers'
import moment from 'moment'
import { checkCustomerValidForConversion, deleteCustomer, getPersonalRecords } from './customers'
import { RecordType } from '@renderer/types/record'

export const getStaff = async (uid: string, sid: string) => {
  try {
    const staffQuery = doc(firestore, `users/${uid}/staffs/${sid}`)
    const staffDoc = await getDoc(staffQuery)
    if (staffDoc.exists()) {
      return {
        message: 'Staff found',
        data: staffDoc.data() as StaffData,
        status: true
      }
    } else {
      return {
        message: 'Staff Not Found',
        data: null,
        status: false
      }
    }
  } catch (_error) {
    return {
      message: 'Staff Not Found',
      data: null,
      status: false
    }
  }
}

export const getStaffs = async (uid: string) => {
  try {
    const staffQuery = collection(firestore, `users/${uid}/staffs`)
    const staffRef = await getDocs(staffQuery)

    if (staffRef.docs.length >= 1) {
      return {
        message: 'Staffs Found',
        data: staffRef.docs.map((e) => e.data() as StaffData),
        status: true
      }
    } else {
      return {
        message: 'Staffs Not Found',
        data: [],
        status: false
      }
    }
  } catch (e) {
    console.log(e)
    return {
      message: 'Staffs Not Found',
      data: [],
      status: false
    }
  }
}

export const updateStaff = async (uid: string, sid: string, data: Partial<StaffData['data']>) => {
  try {
    const staffDocRef = doc(firestore, `users/${uid}/staffs/${sid}`)
    await updateDoc(staffDocRef, {
      data: data
    })
    return {
      message: 'Staff updated successfully',
      status: true
    }
  } catch (error) {
    console.error('Error updating staff:', error)
    return {
      message: 'Failed to update staff',
      status: false
    }
  }
}

export const getTotalStaffs = async (uid: string) => {
  const customersRef = collection(firestore, `users/${uid}/staffs`)
  const allCustomersSnapshot = await getDocs(customersRef)
  const allCustomers = allCustomersSnapshot.docs.map((doc) => doc.data() as StaffData)
  // Total staffs and pages
  return allCustomers.length
}

export const addStaff = async (
  data: Partial<StaffData['data']> & {
    available_limit: number
    records: RecordType[]
  }
) => {
  try {
    const uid = encryptData(data.phone as string)
    const totalStaffs = await getTotalStaffs(data.createdBy as string)
    if (totalStaffs >= data.available_limit) {
      errorToast('You have reached the limit of staffs')
      return { status: 'error', error: 'You have reached the limit of staffs' }
    }

    const docRef = doc(firestore, `users/${data.createdBy}/staffs/${uid}`)

    // Check if the staff already exists
    const staffDoc = await getDoc(docRef)
    if (staffDoc.exists()) {
      errorToast(`Staff with email ${data?.email} already exists.`)
      return { status: 'exists', data: staffDoc.data() }
    }

    const { records, ...others } = data
    // Add the new staff data
    await setDoc(docRef, {
      data: {
        ...others,
        createdOn: new Date().toISOString(),
        sid: uid
      },
      total_appointments_recorded: 0,
      total_customers_assigned: 0,
      total_visitors_assigned: 0,
      attendance: [],
      records: records
    } as StaffData)

    successToast(`Staff added successfully`)
    return { status: 'success', data: { ...data, sid: uid } }
  } catch (error) {
    console.error('Error adding staff:', error)
    return {
      message: 'Failed to add staff',
      data: [],
      status: false
    }
  }
}

export const deleteStaff = async (uid: string, sid: string) => {
  try {
    const staffDocRef = doc(firestore, `users/${uid}/staffs/${sid}`)
    await deleteDoc(staffDocRef)
    successToast('Staff deleted successfully')
    return {
      message: 'Staff deleted successfully',
      status: true
    }
  } catch (error) {
    console.error('Error deleting staff:', error)
    errorToast('Failed to delete staff')
    return {
      message: 'Failed to delete staff',
      status: false
    }
  }
}

export const updateStaffCount = async ({
  sid,
  type,
  uid
}: {
  uid: string
  sid: string
  type: 'customer' | 'appointments' | 'visitors'
}) => {
  try {
    const staffDocRef = doc(firestore, `users/${uid}/staffs/${sid}`)
    const data = (await getDoc(staffDocRef)).data() as StaffData
    const d =
      type === 'customer'
        ? {
            total_customers_assigned: data.total_customers_assigned + 1
          }
        : type === 'appointments'
          ? {
              total_appointments_recorded: data.total_appointments_recorded + 1
            }
          : type === 'visitors'
            ? {
                total_visitors_assigned: data.total_visitors_assigned + 1
              }
            : {}
    await updateDoc(staffDocRef, {
      ...d
    })

    return {
      message: 'Staff updated successfully',
      status: true
    }
  } catch (error) {
    console.error('Error updating staff:', error)
    return {
      message: 'Failed to update staff',
      status: false
    }
  }
}

export const convertCustomerToStaff = async (uid: string, cid: string, limit: number) => {
  try {
    const customerRef = doc(firestore, `users/${uid}/customers/${cid}`)
    const customerSnap = await getDoc(customerRef)

    if (!customerSnap.exists()) {
      return {
        status: false,
        message: 'Not Found'
      }
    }

    // Get the visitor data
    const customerData = customerSnap.data() as CustomerResponse

    const data = customerData
    const checkExistingCid = encryptData(data.phone) as string
    const check = await getStaff(uid, checkExistingCid)

    if (!check?.status) {
      const checkUserRecord = await checkCustomerValidForConversion(uid, cid)

      if (checkUserRecord) {
        const records = await getPersonalRecords(uid, cid)

        const add = await addStaff({
          available_limit: limit,
          about: customerData?.medical_issues,
          address: customerData?.address,
          phone: customerData?.phone,
          photo_url: customerData?.photo_url,
          date_of_birth: customerData?.date_of_birth,
          createdBy: uid,
          sid: checkExistingCid,
          gender: customerData?.gender,
          name: customerData?.name,
          uid,
          createdOn: moment().toISOString(),
          email: customerData?.email,
          medical_issues: customerData?.medical_issues,
          records: records ?? []
        })

        if (add.status) {
          await deleteCustomer(uid, customerData?.cid)
          return add
        } else {
          return add
        }
      } else {
        return {
          status: false,
          data: null,
          message:
            'Customer may be new or might have an active subscription. Finish the attendance and try again.'
        }
      }
    }

    return {
      status: false,
      message: `Staff with this ${data.phone} number exists. Change the number of customer and try again`
    }
  } catch (error: any) {
    errorToast(error.message || 'An error occurred while converting the visitor')
    return { status: 'error', message: error.message }
  }
}

export const updateStaffAttendance = async (
  uid: string,
  attendanceData: StaffAttendance[]
): Promise<{ message: string; status: boolean }> => {
  try {
    const batch = writeBatch(firestore)
    // First get all staff data
    await Promise.all(
      attendanceData.map(async ({ sid, status, date }) => {
        const staffDocRef = doc(firestore, `users/${uid}/staffs/${sid}`)
        const staffDoc = await getDoc(staffDocRef)

        if (staffDoc.exists()) {
          const staffData = staffDoc.data() as StaffData
          const attendance = staffData.attendance || []

          // Check if an entry with the same date exists
          const existingIndex = attendance.findIndex((entry) => entry.date === date)

          if (existingIndex >= 0) {
            // Update existing entry
            attendance[existingIndex] = { status, date, sid }
            batch.update(staffDocRef, { attendance })
          } else {
            // Add new entry
            batch.update(staffDocRef, {
              attendance: arrayUnion({ status, date })
            })
          }
        }
      })
    )
    await batch.commit()
    successToast('Attendance updated successfully')
    return {
      message: 'Attendance updated successfully',
      status: true
    }
  } catch (error) {
    console.error('Error updating attendance:', error)
    errorToast('Failed to update attendance')
    return {
      message: 'Failed to update attendance',
      status: false
    }
  }
}

export const markStaffAttendance = async (uid: string, attendanceData: StaffAttendance[]) => {
  try {
    const batch = writeBatch(firestore)

    attendanceData.forEach(({ sid, status, date }) => {
      const staffDocRef = doc(firestore, `users/${uid}/staffs/${sid}`)
      batch.update(staffDocRef, {
        attendance: arrayUnion({
          status,
          date
        })
      })
    })

    await batch.commit()

    successToast('Attendance marked successfully')
    return {
      message: 'Attendance marked successfully',
      status: true
    }
  } catch (error) {
    console.error('Error marking attendance:', error)
    errorToast('Failed to mark attendance')
    return {
      message: 'Failed to mark attendance',
      status: false
    }
  }
}

export const deleteStaffAttendance = async (uid: string) => {
  try {
    const batch = writeBatch(firestore)
    const staffQuery = collection(firestore, `users/${uid}/staffs`)
    const staffSnapshot = await getDocs(staffQuery)

    staffSnapshot.forEach((doc) => {
      const staffDocRef = doc.ref
      batch.update(staffDocRef, {
        attendance: []
      })
    })

    await batch.commit()

    successToast('All staff attendance deleted successfully')
    return {
      message: 'All staff attendance deleted successfully',
      status: true
    }
  } catch (error) {
    console.error('Error deleting staff attendance:', error)
    errorToast('Failed to delete all staff attendance')
    return {
      message: 'Failed to delete all staff attendance',
      status: false
    }
  }
}
