import {
  doc,
  updateDoc,
  collection,
  addDoc,
  deleteDoc,
  getDocs,
  query,
  limit,
  orderBy,
  where
} from 'firebase/firestore'
import { firestore } from '.'
import { errorToast, successToast } from '@renderer/utils/toast'
import { ProductData } from '@renderer/types/product'
export const lastDoc = async (uid: string) => {
  try {
    const productsRef = collection(firestore, `users/${uid}/products`)
    const productQuery = query(productsRef, orderBy('added_on', 'desc'), limit(1))
    const docsRef = await getDocs(productQuery)

    if (docsRef.size >= 1) {
      const data = docsRef.docs[0].data()
      console.log('Last product data:', data) // Debugging
      return data as ProductData
    }
    return null
  } catch (error) {
    console.error('Error fetching last document:', error) // Debugging
    throw error
  }
}

export const getPaginatedProducts = async (
  uid: string,
  page: number,
  limitSize: number
): Promise<{
  products: ProductData[]
  total: number
}> => {
  try {
    const productsRef = collection(firestore, `users/${uid}/products`)

    const offset = (page - 1) * limitSize

    const productQuery = query(productsRef, orderBy('added_on', 'desc'), limit(offset + limitSize))
    const querySnapshot = await getDocs(productQuery)

    const totalSnapshot = await getDocs(productsRef) // Fetch total count
    const total = totalSnapshot.size

    const paginatedDocs = querySnapshot.docs.slice(offset, offset + limitSize)
    console.log('Paginated docs:', paginatedDocs) // Debugging

    return {
      total,
      products: paginatedDocs.map((doc) => doc.data() as ProductData)
    }
  } catch (error) {
    console.error('Error fetching paginated products:', error) // Debugging
    throw error
  }
}

export const addProduct = async (uid: string, product: Omit<ProductData, 'pid'>) => {
  try {
    let pid = ''
    const lastId = await lastDoc(uid)
    if (lastId) {
      const tempPid = parseInt(lastId?.pid.split('PRODUCT-')[1])
      pid = `PRODUCT-${tempPid + 1}`
    } else {
      pid = `PRODUCT-1`
    }
    const productRef = collection(firestore, `users/${uid}/products`)
    const docRef = await addDoc(productRef, { ...product, pid })
    successToast('Product added with id: ' + pid)
    return docRef
  } catch (error) {
    errorToast('Error adding product:')
    throw error
  }
}

export const updateProduct = async (
  uid: string,
  pid: string, // Product ID stored as a field in Firestore
  updatedProduct: ProductData,
  showToast = true
) => {
  try {
    const productsRef = collection(firestore, `users/${uid}/products`)
    const productQuery = query(productsRef, where('pid', '==', pid))

    const querySnapshot = await getDocs(productQuery)

    if (!querySnapshot.empty) {
      // Assuming pid is unique, so we take the first matching document
      const docToUpdate = querySnapshot.docs[0]
      const productRef = doc(firestore, `users/${uid}/products/${docToUpdate.id}`)

      // Prepare the data for update
      const updatedData = {
        ...updatedProduct,
        updated_on: new Date().getTime() // Optional: Track the update time
      }

      await updateDoc(productRef, updatedData)
      showToast && successToast('Product updated successfully')
    } else {
      showToast && errorToast('No product found with the specified Product ID')
    }
  } catch (error) {
    errorToast('Error updating product:')
    console.error('Error updating product:', error)
    throw error
  }
}

export const deleteProduct = async (uid: string, productId: string) => {
  try {
    const productRef = doc(firestore, `users/${uid}/products/${productId}`)
    await deleteDoc(productRef)
    successToast('Product deleted successfully')
  } catch (error) {
    errorToast('Error deleting product')
    throw error
  }
}
