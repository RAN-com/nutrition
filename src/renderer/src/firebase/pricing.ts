import { deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore'
import { firestore } from '.'
import { CreateAdminPayment, CreateCardPaymentProps } from '@renderer/types/payment'
import moment from 'moment'
import { encryptData } from '@renderer/utils/crypto'

export const getAdminPayment = async (uid: string) => {
  const orderDoc = doc(firestore, `orders/${uid}`)
  const orderRef = await getDoc(orderDoc)

  if (orderRef?.exists()) {
    return orderRef.data() as unknown as CreateAdminPayment
  }

  return null
}

export const getCardPayment = async (uid: string, sid: string) => {
  const orderDoc = doc(firestore, `orders/${uid}-${sid}`)
  const orderRef = await getDoc(orderDoc)

  if (orderRef?.exists()) {
    return orderRef.data() as unknown as CreateCardPaymentProps
  }

  return null
}

export const createAdminPayment = async ({ uid, ...data }: CreateAdminPayment) => {
  const orderDoc = doc(firestore, `orders/${uid}`)
  const orderRef = await getDoc(orderDoc)

  if (orderRef?.exists()) {
    const data = orderRef?.data() as unknown as CreateAdminPayment
    if (moment(data?.valid_till).isAfter(moment())) {
      return {
        status: true,
        message: 'Already Exists',
        data: orderRef.data() as unknown as CreateAdminPayment
      }
    }

    return {
      status: false,
      message: 'Previous Order Expired',
      data: null
    }
  }

  await setDoc(
    orderDoc,
    {
      ...data,
      uid,
      oid: encryptData(moment().toString()),
      valid_till: moment().add(15, 'minutes').toString(),
      paid: null // if false, payment not done, if true payment done
    },
    { merge: true }
  )

  return {
    status: true,
    message: 'Order Created',
    data: await getAdminPayment(uid)
  }
}

export const createCardPayment = async ({ uid, sid, ...data }: CreateCardPaymentProps) => {
  const orderDoc = doc(firestore, `orders/${uid}-${sid}`)
  const orderRef = await getDoc(orderDoc)

  if (orderRef?.exists()) {
    const data = orderRef?.data() as unknown as CreateCardPaymentProps
    if (moment(data?.valid_till).isAfter(moment())) {
      return {
        status: true,
        message: 'Already Exists',
        data: orderRef.data() as unknown as CreateCardPaymentProps
      }
    }

    return {
      status: false,
      message: 'Previous Order Expired',
      data: null
    }
  }

  await setDoc(
    orderDoc,
    {
      ...data,
      uid,
      oid: encryptData(moment().toString()),
      valid_till: moment().add(15, 'minutes').toString(),
      paid: null, // if false, payment not done, if true payment done
      sid
    },
    { merge: true }
  )

  return {
    status: true,
    message: 'Order Created',
    data: await getCardPayment(uid, sid as string)
  }
}

export const deleteOrder = async (documentId: string) => {
  const orderDoc = doc(firestore, `orders/${documentId}`)
  const orderRef = await getDoc(orderDoc)

  if (orderRef?.exists()) {
    await deleteDoc(orderDoc)
    return {
      status: true,
      message: `ORDER ID::${documentId} deleted successfully`,
      data: null
    }
  }
  return {
    status: false,
    message: 'No Pending Orders',
    data: null
  }
}

type PaymentStatus = 'pending' | 'success' | 'failure'

const updateOrderStatus = async (path: string, status: PaymentStatus) => {
  const orderDoc = doc(firestore, path)
  const orderRef = await getDoc(orderDoc)

  if (!orderRef.exists()) {
    return {
      status: false,
      message: 'Order Not Found',
      data: null
    }
  }

  const orderData = orderRef.data() as { valid_till: string }
  if (moment(orderData.valid_till).isBefore(moment())) {
    await setDoc(orderDoc, { paid: 'failure' }, { merge: true })
    return {
      status: false,
      message: 'Order Expired, marked as failed',
      data: null
    }
  }

  await setDoc(orderDoc, { paid: status }, { merge: true })
  return {
    status: true,
    message: `Order updated to ${status}`,
    data: (await getDoc(orderDoc)).data()
  }
}

export const makePendingAdminOrder = async (uid: string) => {
  return updateOrderStatus(`orders/${uid}`, 'pending')
}

export const makePendingCardOrder = async (uid: string, sid: string) => {
  return updateOrderStatus(`orders/${uid}-${sid}`, 'pending')
}

export const makeSuccessAdminOrder = async (uid: string) => {
  return updateOrderStatus(`orders/${uid}`, 'success')
}

export const makeSuccessCardOrder = async (uid: string, sid: string) => {
  return updateOrderStatus(`orders/${uid}-${sid}`, 'success')
}

export const makeFailureAdminOrder = async (uid: string) => {
  return updateOrderStatus(`orders/${uid}`, 'failure')
}

export const makeFailureCardOrder = async (uid: string, sid: string) => {
  return updateOrderStatus(`orders/${uid}-${sid}`, 'failure')
}
