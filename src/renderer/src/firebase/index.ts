// Import the functions you need from the SDKs you need

import { CustomerResponse } from '@renderer/types/customers'
import { OrderData } from '@renderer/types/product'
import { CenterUser } from '@renderer/types/user'
import { errorToast, successToast } from '@renderer/utils/toast'
import { initializeApp } from 'firebase/app'
import { diff } from 'deep-diff'
import {
  createUserWithEmailAndPassword,
  getAuth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  User
} from 'firebase/auth'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  initializeFirestore,
  updateDoc,
  onSnapshot
} from 'firebase/firestore'
import { encryptData } from '@renderer/utils/crypto'
import moment from 'moment'

const firebaseConfig = {
  apiKey: 'AIzaSyCaElCmygA7RKHdn9xyx5bezzso_1xsVA8',
  authDomain: 'ran-dev-6f346.firebaseapp.com',
  projectId: 'ran-dev-6f346',
  storageBucket: 'ran-dev-6f346.firebasestorage.app',
  messagingSenderId: '161059016152',
  appId: '1:161059016152:web:de8f684ab5cf8a28a936ad',
  measurementId: 'G-TGH27VE51H'
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const firestore = initializeFirestore(app, {
  ignoreUndefinedProperties: true
})
export const createUser = async ({
  email,
  password
}: {
  email: string
  password: string
}): Promise<User | null> => {
  return await createUserWithEmailAndPassword(auth, email, password)
    .then((data) => {
      successToast('User Created Successfully')
      return data.user
    })
    .catch((err) => {
      errorToast(String(err?.message))
      return null
    })
}

export const firebaseSignIn = async ({
  email,
  password
}: {
  email: string
  password: string
}): Promise<User | null> => {
  return signInWithEmailAndPassword(auth, email, password)
    .then((data) => data.user)
    .catch(null)
}

export const refreshData = async (data: CenterUser) => {
  const docRef = doc(firestore, `users/${data?.uid}`)
  const docSnap = await getDoc(docRef)
  if (!docSnap?.exists()) {
    return { error: true, message: 'User Not Found', data: null }
  }

  const incomingData = docSnap?.data() as CenterUser
  const checkDiff = diff(data, incomingData)
  console.log(data, incomingData)

  console.log('checkDiff', checkDiff)

  if (checkDiff?.length !== 0) {
    return { error: false, message: 'Refreshed Data', data: incomingData }
  } else {
    return { error: false, message: 'No Changes Found', data: data }
  }
}

export const getUserDocument = async (uid: string) => {
  const docRef = doc(firestore, `users/${uid}`)
  const docSnap = await getDoc(docRef)
  if (!docSnap?.exists()) {
    return { error: true, message: 'User Document Not Found' }
  }

  const data = docSnap?.data() as unknown as CenterUser

  if (data) {
    return { error: false, message: 'User Found', data }
  }
  return { error: true, message: 'Not Found' }
}

export const sendResetLink = async ({ email }: { email: string }) => {
  return sendPasswordResetEmail(auth, email)
}

export const createUserDocument = async ({
  data,
  ...others
}: {
  data: User
  name: string
  city: string
  locality: string
}): Promise<{
  error: boolean
  message: string
}> => {
  const docRef = doc(firestore, `users/${data?.uid}`)
  const docSnap = await getDoc(docRef)
  if (docSnap?.exists()) {
    alert('User Already Exists')
    return { error: true, message: 'User Already Exists' }
  }

  await setDoc(docRef, {
    email: data?.email ?? null,
    uid: data?.uid ?? null,
    subscription: {
      type: 'FREE_TRAIL',
      subscribedOn: moment().format('YYYY-MM-DD'),
      valid_till: moment().add(1, 'week').format('YYYY-MM-DD'),
      // for free trail of 1 motth
      total_customers: 10,
      total_products: 10,
      total_staffs: 5,
      total_visitors: 10
    },
    ...others
  } as CenterUser)
  return { error: true, message: 'User Created' }
}

export const updateUserDocument = async ({ uid, ...data }: Partial<CenterUser>) => {
  const docRef = doc(firestore, `users/${uid}`)
  const docSnap = await getDoc(docRef)

  if (!docSnap?.exists()) {
    errorToast('User Not Available')
    return { error: true, message: 'User Not Available', data: null }
  }

  await updateDoc(docRef, {
    ...data
  })
  return { error: false, message: 'User Updated', data: await getUserDocument(uid as string) }
}

export const getTotalRevenue = async (uid: string) => {
  const customersRef = collection(firestore, `users/${uid}/customers`)
  const productsRef = collection(firestore, `users/${uid}/orders`)

  const productSnapshot = await getDocs(productsRef)
  const allProducts = productSnapshot.docs.map((doc) => doc.data() as OrderData)

  const allCustomersSnapshot = await getDocs(customersRef)
  const allCustomers = allCustomersSnapshot.docs.map((doc) => doc.data() as CustomerResponse)

  const customerRevenue = allCustomers.reduce((acc, obj) => acc + (obj?.amount_paid ?? 0), 0)
  const orderRevenue = allProducts.reduce((acc, obj) => acc + obj.total_price, 0)

  return {
    customer: customerRevenue,
    order: orderRevenue,
    total: customerRevenue + orderRevenue
  }
}

export const getAdminSubscription = async (uid: string) => {
  const docRef = doc(firestore, `users/${uid}`)
  const docSnap = await getDoc(docRef)
  if (!docSnap?.exists()) {
    return { error: true, message: 'User Not Found', data: null }
  }

  const data = docSnap?.data() as unknown as CenterUser

  if (data.subscription) {
    return { error: false, message: 'Subscription Found', data: data.subscription }
  } else {
    return { error: true, message: 'No Subscription Found', data: null }
  }
}

export const setAdminSubscription = async ({
  price,
  type,
  uid,
  validity
}: {
  uid: string
  validity: string
  price: number
  type: string
  limit: {
    customers: number
    products: number
    staffs: number
    visitors: number
  }
}) => {
  const docRef = doc(firestore, `users/${uid}`)
  const docSnap = await getDoc(docRef)

  if (!docSnap?.exists()) {
    return { error: true, message: 'User Not Found', data: null }
  }

  const data = docSnap?.data() as unknown as CenterUser

  if (data.subscription) {
    if (data.subscription.type === 'FREE_TRAIL') {
      await updateDoc(docRef, {
        subscription: {
          valid_till: validity,
          type,
          price,
          subscribedOn: moment().format('YYYY-MM-DD HH:mm:ss'),
          total_customers: 30,
          total_products: 200,
          total_staffs: 20,
          total_visitors: 30
        }
      })
      return {
        error: false,
        message: 'Subscription Created',
        data: {
          valid_till: validity,
          type,
          price,
          subscribedOn: moment().format('YYYY-MM-DD HH:mm:ss'),
          total_customers: 30,
          total_products: 100,
          total_staffs: 20,
          total_visitors: 30
        }
      }
    }
    if (moment(data.subscription.valid_till).isAfter(moment())) {
      return { error: true, message: 'Subscription Already Active', data: data.subscription }
    } else {
      await updateDoc(docRef, {
        subscription: {
          valid_till: validity,
          type,
          price,
          subscribedOn: moment().format('YYYY-MM-DD HH:mm:ss'),
          total_customers: 30,
          total_products: 100,
          total_staffs: 20,
          total_visitors: 30
        }
      })
      return {
        error: false,
        message: 'Subscription Updated',
        data: {
          valid_till: validity,
          type,
          price,
          subscribedOn: moment().format('YYYY-MM-DD HH:mm:ss'),
          total_customers: 30,
          total_products: 100,
          total_staffs: 20,
          total_visitors: 30
        }
      }
    }
  } else {
    await updateDoc(docRef, {
      subscription: {
        valid_till: validity,
        type,
        price,
        subscribedOn: moment().format('YYYY-MM-DD HH:mm:ss'),
        total_customers: 30,
        total_products: 100,
        total_staffs: 20,
        total_visitors: 30
      }
    })
    return {
      error: false,
      message: 'Subscription Created',
      data: {
        valid_till: validity,
        type,
        price,
        subscribedOn: moment().format('YYYY-MM-DD HH:mm:ss'),
        total_customers: 30,
        total_products: 100,
        total_staffs: 20,
        total_visitors: 30
      }
    }
  }
}

export const addAction = async (
  uid: string,
  action: 'add' | 'remove',
  key: 'total_customers' | 'total_products' | 'total_staffs' | 'total_visitors'
) => {
  const docRef = doc(firestore, `users/${uid}`)
  const docSnap = await getDoc(docRef)

  if (!docSnap?.exists()) {
    return { error: true, message: 'User Not Found', data: null }
  }

  const data = docSnap.data() as CenterUser
  if (!data.subscription) {
    errorToast("You don't have an valid subscription")
    return false
  }

  const { subscription } = data

  subscription[key] = action === 'add' ? subscription?.[key] - 1 : subscription?.[key] + 1

  await updateDoc(docRef, { subscription })
  return { error: false, message: 'Action performed successfully', data: subscription }
}

export const addTransaction = async (uid: string, ...data) => {
  // make it as a collectoin and add it to the firestore
  const id = encryptData(moment().format('YYYY-MM-DD-HH-mm-ss'))
  const docRef = doc(firestore, `users/${uid}/transactions/${id}`)
  await setDoc(docRef, { ...data, transactionId: id })
  return true
}

export const subscribeToUserData = (uid: string, callback: (data: CenterUser | null) => void) => {
  const docRef = doc(firestore, `users/${uid}`)
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as CenterUser)
    } else {
      callback(null)
    }
  })
}
