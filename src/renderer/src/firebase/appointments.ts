import { doc, getDoc } from 'firebase/firestore'
import { firestore } from '.'
import { updateStaff } from './staffs'
import { StaffData } from '@renderer/types/staff'
import { errorToast } from '@renderer/utils/toast'
import { getDomainData } from './domain'

export const setSubDomainToStaff = async (staff: StaffData['data'], domain: string) => {
  const check = await getDomainData(domain)
  if (check?.staff_id === staff?.sid) {
    await updateStaff(staff.createdBy, staff.sid, {
      ...staff,
      assigned_subdomain: domain
    })
    console.log('Staff Domain Updated')
  } else {
    errorToast('Domain not found. Try again')
  }
}

export const getAppointmentsBySid = async (sid: string) => {
  try {
    const appRef = doc(firestore, `appointments/${sid}`)
    const docSnap = await getDoc(appRef)

    if (!docSnap.exists()) {
      return { success: false, message: 'No appointments found', data: [] }
    }

    return { success: true, data: docSnap.data().records ?? [] }
  } catch (error) {
    console.error('Error fetching appointments:', error)
    return { success: false, message: 'Error fetching appointments' }
  }
}
