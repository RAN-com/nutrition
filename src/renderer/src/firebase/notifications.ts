import { getDoc, doc, onSnapshot, setDoc } from 'firebase/firestore'
import { firestore } from './'
import { CreateNotification, Notification } from '@renderer/types/notification'
import { encryptData } from '@renderer/utils/crypto'
import moment from 'moment'

export const listenToNotifications = (
  uid: string,
  callback: (notifications: Notification[]) => void
) => {
  const nDoc = doc(firestore, `notifications/${uid}`)

  const unsubscribe = onSnapshot(nDoc, (snapshot) => {
    if (snapshot.exists()) {
      const docs = snapshot.data()?.notifications as unknown as Notification[]
      callback(docs || [])
    } else {
      callback([])
    }
  })

  return unsubscribe
}

export const sendNotification = async (uid: string, data?: CreateNotification) => {
  const nDoc = doc(firestore, `notifications/${uid}`)
  try {
    const template = {
      message: 'Hey this is test',
      title: 'TEST NOTIFICATION',
      type: 'update',
      ...data,
      read: false,
      timestamp: moment().toISOString(),
      id: encryptData(moment().format())
    } as Notification
    const docSnapshot = await getDoc(nDoc)
    let notifications: Notification[] = []

    if (docSnapshot.exists()) {
      notifications = docSnapshot.data()?.notifications as Notification[]
    }

    notifications.push(template)

    await setDoc(nDoc, { notifications })
  } catch (error) {
    console.error('Error sending notification:', error)
  }
}

export const readNotification = async (
  uid: string,
  notificationId: string,
  readStatus: boolean = true
) => {
  const nDoc = doc(firestore, `notifications/${uid}`)
  try {
    const docSnapshot = await getDoc(nDoc)
    if (docSnapshot.exists()) {
      const notifications = docSnapshot.data()?.notifications as Notification[]
      const updatedNotifications = notifications.map((notification) =>
        notification.id === notificationId ? { ...notification, read: readStatus } : notification
      )
      await setDoc(nDoc, { notifications: updatedNotifications })
    }
  } catch (error) {
    console.error('Error marking notification as read:', error)
  }
}

export const deleteNotification = async (uid: string, notificationId: string) => {
  const nDoc = doc(firestore, `notifications/${uid}`)
  try {
    const docSnapshot = await getDoc(nDoc)
    if (docSnapshot.exists()) {
      const notifications = docSnapshot.data()?.notifications as Notification[]
      const updatedNotifications = notifications.filter(
        (notification) => notification.id !== notificationId
      )
      await setDoc(nDoc, { notifications: updatedNotifications })
    }
  } catch (error) {
    console.error('Error deleting notification:', error)
  }
}

export const deleteAllNotification = async (uid: string) => {
  const nDoc = doc(firestore, `notifications/${uid}`)
  try {
    await setDoc(nDoc, { notifications: [] })
  } catch (error) {
    console.error('Error deleting all notifications:', error)
  }
}

export const markAllAsRead = async (uid: string) => {
  try {
    const nDoc = doc(firestore, `notifications/${uid}`)
    const docSnapshot = await getDoc(nDoc)
    if (docSnapshot.exists()) {
      const notifications = docSnapshot.data()?.notifications as Notification[]
      const updatedNotifications = notifications.map((notification) => ({
        ...notification,
        read: true
      }))
      await setDoc(nDoc, { notifications: updatedNotifications })
    }
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
  }
}
