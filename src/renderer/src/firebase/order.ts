import {
  collection,
  addDoc,
  getDocs,
  query,
  limit as fsLimit,
  orderBy,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData
} from 'firebase/firestore'
import { OrderData } from '@renderer/types/product'
import { firestore } from '.'
import { errorToast, successToast } from '@renderer/utils/toast'

const lastDoc = async (uid: string) => {
  try {
    const productsRef = collection(firestore, `users/${uid}/orders`)
    const productQuery = query(productsRef, orderBy('order_on', 'desc'), fsLimit(1))
    const docsRef = await getDocs(productQuery)

    if (docsRef.size >= 1) {
      const data = docsRef.docs[0].data()
      console.log('Last product data:', data) // Debugging
      return data as OrderData
    }
    return null
  } catch (error) {
    console.error('Error fetching last document:', error) // Debugging
    throw error
  }
}
export const confirmOrder = async (uid: string, product: Omit<OrderData, 'orderId'>) => {
  try {
    let orderId = ''
    const lastId = await lastDoc(uid)
    if (lastId) {
      const tempPid = parseInt(
        lastId?.orderId?.split(`INV-CEN-${uid?.slice(0, 10).replace(/[^a-zA-Z ]/g, '')}`)[1]
      )
      orderId = `INV-CEN-${uid?.slice(0, 10).replace(/[^a-zA-Z ]/g, '')}${tempPid + 1}`
    } else {
      orderId = `INV-CEN-${uid?.slice(0, 10).replace(/[^a-zA-Z ]/g, '')}1`
    }
    const productRef = collection(firestore, `users/${uid}/orders`)
    const docRef = await addDoc(productRef, { ...product, orderId })
    successToast('Order added with id: ' + orderId)
    return docRef
  } catch (error) {
    errorToast('Error adding Order')
    console.log(error)
    throw error
  }
}
export const getPaginatedOrders = async (
  uid: string,
  limitSize: number,
  cursor: QueryDocumentSnapshot<DocumentData> | null
): Promise<{
  orders: OrderData[]
  total: number
  lastVisible: QueryDocumentSnapshot<DocumentData> | null
}> => {
  const ordersRef = collection(firestore, `users/${uid}/orders`)
  const baseQuery = query(ordersRef, orderBy('order_on', 'desc'))
  const paginatedQuery = cursor
    ? query(baseQuery, startAfter(cursor), fsLimit(limitSize))
    : query(baseQuery, fsLimit(limitSize))

  const [querySnapshot, totalSnapshot] = await Promise.all([
    getDocs(paginatedQuery),
    getDocs(ordersRef)
  ])

  return {
    orders: querySnapshot.docs.map((doc) => doc.data() as OrderData),
    total: totalSnapshot.size,
    lastVisible: querySnapshot.docs.at(-1) ?? null
  }
}

export const getAllProductsSize = async (uid: string) => {
  const productsRef = collection(firestore, `users/${uid}/products`)
  const docsRef = await getDocs(productsRef)
  return docsRef?.docs.length
}
