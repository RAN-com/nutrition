import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  runTransaction,
  setDoc,
  updateDoc
} from 'firebase/firestore'
import { firestore } from './'
import { CreateMarathon, MarathonData } from '@renderer/types/marathon'
import { encryptData } from '@renderer/utils/crypto'
import moment from 'moment'
import { deleteDoc } from 'firebase/firestore'
import { errorToast, successToast } from '@renderer/utils/toast'
import { capitalizeSentence } from '@renderer/utils/functions'

// functions to create marathon template data
export const checkMarathonExists = async (uid: string, from_date: string, to_date: string) => {
  const docRef = doc(firestore, `${uid}/marathon/${from_date}_${to_date}/data`)
  const ref = await getDoc(docRef)

  if (ref.exists()) {
    return ref.data() as MarathonData
  }

  return null
}

export const listenToMarathons = (uid: string, callback: (marathon: MarathonData[]) => void) => {
  const marathonCollection = collection(firestore, `users/${uid}/marathon`)

  const unsubscribe = onSnapshot(marathonCollection, (snapshot) => {
    if (!snapshot.empty) {
      const marathon: MarathonData[] = snapshot.docs.map((doc) => doc.data() as MarathonData)
      callback(marathon)
    } else {
      callback([])
    }
  })

  return unsubscribe
}

export const listenToSingleMarathon = (
  uid: string,
  mid: string,
  callback: (marathon: MarathonData | null) => void
) => {
  const marathonDoc = doc(firestore, `users/${uid}/marathon/${mid}`)

  const unsubscribe = onSnapshot(marathonDoc, (snapshot) => {
    if (!snapshot.exists()) {
      callback(null)
    } else {
      callback(snapshot.data() as unknown as MarathonData)
    }
  })

  return unsubscribe
}

export const getMarathons = async (uid: string) => {
  const marathonCollection = collection(firestore, `users/${uid}/marathon`)
  const marathonRef = await getDocs(marathonCollection)

  if (!marathonRef.empty) {
    const marathons: MarathonData[] = marathonRef.docs.map((doc) => doc.data() as MarathonData)

    return {
      status: true,
      data: marathons,
      message: 'Marathons retrieved successfully'
    }
  }

  return {
    status: false,
    data: null,
    message: 'No marathons found'
  }
}

const format = (m: string) => moment(m).format('DD_MM_YYYY')

export const createMarathon = async (uid: string, data: CreateMarathon) => {
  try {
    if (moment(data.to_date).diff(moment(data.from_date).get('days'), 'days', true) < 6) {
      return {
        status: false,
        message: 'Enter a valid date'
      }
    }
    const colId = encryptData(`${format(data.from_date)}_${format(data.to_date)}_${data?.type}`)
    const docRef = doc(firestore, `users/${uid}/marathon/${colId}`)
    const ref = await getDoc(docRef)
    const d = ref.data() as MarathonData

    if (ref.exists() && d.state !== 'CANCELLED' && d.state !== 'FINISHED') {
      return {
        status: false,
        message: capitalizeSentence(d.type) + ' Marathon Already Exists on provided date',
        data: null
      }
    }

    const template: MarathonData = {
      mid: colId as string,
      created_by: {
        uid
      },
      state: 'UPCOMING',
      created_on: moment().toString(),
      customers: data.customers,
      data: [],
      from_date: data.from_date,
      to_date: data.to_date,
      graph: {},
      positions: [],
      total_users: data.customers.length,
      type: data.type
    }

    await setDoc(
      docRef,
      {
        ...template
      },
      { merge: true }
    )

    return {
      status: true,
      message: 'Marathon Created',
      data: template
    }
  } catch (err) {
    const e = err as unknown as Error
    return {
      status: false,
      message: `${e?.message}`,
      data: null
    }
  }
}

export const updateInitMarathon = async (data: MarathonData) => {
  try {
    if (moment(data.from_date).isBefore(moment())) {
      return {
        status: false,
        message: 'You cannot edit the data one day before marathon. Either you can delete it',
        data: null
      }
    }

    const docRef = doc(firestore, `users/${data.created_by.uid}/marathon/${data.mid}`)
    const ref = await getDoc(docRef)

    if (!ref.exists()) {
      return {
        status: false,
        message: "Marathon data Doesn't Exists",
        data: null
      }
    }

    const template: MarathonData = {
      ...data,
      total_users: data.customers.length
    }

    await updateDoc(docRef, { ...template })

    return {
      status: true,
      message: 'Marathon Updated Successfully',
      data: template
    }
  } catch (err) {
    const e = err as unknown as Error
    return {
      status: false,
      message: `${e?.message}`,
      data: null
    }
  }
}

export const deleteMarathon = async (uid: string, mid: string) => {
  try {
    // There might be other paths also like results, user, so delete the mid collection itself
    const marathonDoc = doc(firestore, `users/${uid}/marathon/${mid}`)
    const ref = await getDoc(marathonDoc)
    if (ref.exists()) {
      await deleteDoc(marathonDoc)
      return {
        status: true,
        message: 'Marathon Deleted Successfully'
      }
    }

    return {
      status: false,
      message: "Marathon doesn't exists"
    }
  } catch (err) {
    const e = err as unknown as Error
    return {
      status: false,
      message: `${e?.message}`,
      data: null
    }
  }
}

export const getMarathon = async (uid: string) => {
  const marathonDoc = collection(firestore, `users/${uid}/marathon`)
  const marathonRef = await getDocs(marathonDoc)
  if (!marathonRef?.empty) {
    const previous = [] as MarathonData[]
    const ongoing = [] as MarathonData[]
    const future = [] as MarathonData[]

    marathonRef.docs.forEach((doc) => {
      const marathon = doc.data() as MarathonData
      const now = moment()

      if (moment(marathon.to_date).isBefore(now)) {
        previous.push(marathon)
      } else if (moment(marathon.from_date).isAfter(now)) {
        future.push(marathon)
      } else {
        ongoing.push(marathon)
      }
    })

    return {
      status: true,
      data: {
        previous,
        ongoing,
        future
      },
      message: 'Marathon data found'
    }
  }

  return {
    data: null,
    status: false,
    message: 'Marathon Data not found'
  }
}

type UpdateCustomerValues = {
  weight: number
  height: number
}

// Helper function to get initial weight
const getInitialWeight = (
  customer: MarathonData['customers'][number],
  graph: MarathonData['graph']
): number | undefined => {
  const customerGraph = graph[customer.cid]
  if (customerGraph && customerGraph.values.length > 0) {
    // Find the entry with the minimum day
    let initialEntry = customerGraph.values[0]
    for (const entry of customerGraph.values) {
      if (entry.day < initialEntry.day) {
        initialEntry = entry
      }
    }
    return initialEntry.weight
  }
  return undefined
}

export async function updateCustomerMarathonData(
  uid: string,
  mid: string,
  cid: string,
  day: number,
  date: string,
  values: UpdateCustomerValues
) {
  const marathonDocRef = doc(firestore, `users/${uid}/marathon/${mid}`)
  try {
    await runTransaction(firestore, async (transaction) => {
      const docSnap = await transaction.get(marathonDocRef)
      if (!docSnap.exists()) {
        throw new Error(`Marathon document with mid: ${mid} not found.`)
      }

      const marathonData = docSnap.data() as MarathonData
      // --- Update graph and data ---
      const customer = marathonData.customers.find((c) => c.cid === cid)
      const initialWeight = customer ? getInitialWeight(customer, marathonData.graph) : undefined
      const weightLossOrWeightGain =
        initialWeight !== undefined
          ? marathonData.type === 'weight_loss'
            ? initialWeight - values.weight
            : values.weight - initialWeight
          : 0

      const dayDataIndex = marathonData.data.findIndex((d) => d.day === day && d.date === date)
      if (dayDataIndex !== -1) {
        marathonData.data[dayDataIndex].records[cid] = {
          day: day,
          date: date,
          values: {
            weightLossOrWeightGain: weightLossOrWeightGain,
            weight: values.weight,
            height: values.height
          }
        }

        // Update graph
        if (marathonData.graph[cid]) {
          const existingValueIndex = marathonData.graph[cid].values.findIndex(
            (v) => v.day === day && v.date === date
          )
          if (existingValueIndex !== -1) {
            marathonData.graph[cid].values[existingValueIndex] = {
              weightLossOrWeightGain: weightLossOrWeightGain,
              day: day,
              date: date,
              weight: values.weight,
              height: values.height
            }
          } else {
            marathonData.graph[cid].values.push({
              weightLossOrWeightGain: weightLossOrWeightGain,
              day: day,
              date: date,
              weight: values.weight,
              height: values.height
            })
            marathonData.graph[cid].values.sort((a, b) => a.day - b.day)
          }
        } else {
          marathonData.graph = {
            ...marathonData.graph,
            [cid]: {
              values: [
                {
                  weightLossOrWeightGain: weightLossOrWeightGain,
                  day: day,
                  date: date,
                  weight: values.weight,
                  height: values.height
                }
              ]
            }
          }
        }

        marathonData.data[dayDataIndex].total_entries = Object.keys(
          marathonData.data[dayDataIndex].records
        ).length
        marathonData.data[dayDataIndex].remaining_entries =
          marathonData.total_users - marathonData.data[dayDataIndex].total_entries
      } else {
        marathonData.data.push({
          day: day,
          date: date,
          total_entries: 1,
          remaining_entries: marathonData.total_users - 1,
          records: {
            [cid]: {
              day: day,
              date: date,
              values: {
                weightLossOrWeightGain: weightLossOrWeightGain,
                weight: values.weight,
                height: values.height
              }
            }
          }
        })
        marathonData.data.sort((a, b) => a.day - b.day)

        //update graph
        marathonData.graph = {
          ...marathonData.graph,
          [cid]: {
            values: [
              {
                weightLossOrWeightGain: weightLossOrWeightGain,
                day: day,
                date: date,
                weight: values.weight,
                height: values.height
              }
            ]
          }
        }
      }

      // --- Update positions ---
      const latestWeightLossOrGain: {
        cid: string
        weightLossOrWeightGain: number
        weight: number
        height: number
        name: string
      }[] = []
      // Iterate through all customers to include those without entries
      for (const customer of marathonData.customers) {
        const customerGraph = marathonData.graph[customer.cid]
        const latestEntry = customerGraph
          ? [...customerGraph.values].sort((a, b) => b.day - a.day)[0]
          : undefined
        const initialWeight = customer ? getInitialWeight(customer, marathonData.graph) : undefined

        const weightLoss = latestEntry
          ? marathonData.type === 'weight_loss'
            ? initialWeight
              ? initialWeight - latestEntry.weight
              : 0
            : initialWeight
              ? latestEntry.weight - initialWeight
              : 0
          : 0
        latestWeightLossOrGain.push({
          cid: customer.cid,
          weightLossOrWeightGain: weightLoss,
          weight: latestEntry?.weight || 0, // Use 0 if no entry
          height: latestEntry?.height || 0, // Use 0 if no entry
          name: customer.name
        })
      }

      latestWeightLossOrGain.sort((a, b) => b.weightLossOrWeightGain - a.weightLossOrWeightGain)
      marathonData.positions = latestWeightLossOrGain.map((item, index) => ({
        cid: item.cid,
        position: index + 1,
        name: item.name,
        weightLossOrWeightGain: item.weightLossOrWeightGain,
        weight: item.weight,
        height: item.height
      }))

      marathonData.updatedOn = new Date().toISOString()

      transaction.update(marathonDocRef, {
        graph: marathonData.graph,
        state: 'ONGOING',
        data: marathonData.data,
        positions: marathonData.positions,
        updatedOn: marathonData.updatedOn
      })
    })

    successToast('Customer data updated successfully.')
    return true
  } catch (error: any) {
    console.error('Error updating customer marathon data:', error)
    errorToast(error.message || 'Failed to update customer data.')
    return false
  }
}

export async function markMarathonFinished(uid: string, mid: string) {
  const marathonDocRef = doc(firestore, `users/${uid}/marathon/${mid}`)

  try {
    await runTransaction(firestore, async (transaction) => {
      const docSnap = await transaction.get(marathonDocRef)
      if (!docSnap.exists()) {
        errorToast('Marathon data not found. You may have already deleted it.')
        throw new Error(`Marathon document with mid: ${mid} not found.`)
      }

      const marathonData = docSnap.data() as MarathonData

      let newState = 'FINISHED'

      // if (today > toDate) {
      //   newState = 'FINISHED'
      // }

      // --- Calculate final positions ---
      const latestWeightLossOrGain: {
        cid: string
        weightLossOrWeightGain: number
        weight: number
        height: number
        name: string
      }[] = []
      for (const customer of marathonData.customers) {
        const customerGraph = marathonData.graph[customer.cid]
        const latestEntry = customerGraph
          ? [...customerGraph.values].sort((a, b) => b.day - a.day)[0]
          : undefined
        const initialWeight = customer ? getInitialWeight(customer, marathonData.graph) : undefined
        const weightLoss = latestEntry
          ? marathonData.type === 'weight_loss'
            ? initialWeight
              ? initialWeight - latestEntry.weight
              : 0
            : initialWeight
              ? latestEntry.weight - initialWeight
              : 0
          : 0
        latestWeightLossOrGain.push({
          cid: customer.cid,
          weightLossOrWeightGain: weightLoss,
          weight: latestEntry?.weight || 0,
          height: latestEntry?.height || 0,
          name: customer.name
        })
      }

      latestWeightLossOrGain.sort((a, b) => b.weightLossOrWeightGain - a.weightLossOrWeightGain)
      const finalPositions = latestWeightLossOrGain.map((item, index) => ({
        cid: item.cid,
        position: index + 1,
        name: item.name,
        weightLossOrWeightGain: item.weightLossOrWeightGain,
        weight: item.weight,
        height: item.height
      }))

      // --- Finalize graph and data (optional, depending on your needs) ---
      // Here, you might want to ensure that the graph and data reflect the *final* state
      // of the marathon.  This might involve pruning any incomplete data or
      // calculating final summary values.
      // For now, we'll just sort the graph data by day for consistency.  You can add
      // more sophisticated logic here if needed.
      for (const cid in marathonData.graph) {
        marathonData.graph[cid].values.sort((a, b) => a.day - b.day)
      }

      // Update the marathon document with the final data
      await transaction.update(marathonDocRef, {
        state: newState,
        positions: finalPositions,
        graph: marathonData.graph, // Include the potentially modified graph
        data: marathonData.data,
        updatedOn: new Date().toISOString()
      })
    })
    successToast(`Marathon with id: ${mid} has been successfully marked as FINISHED.`)
    return true
  } catch (error: any) {
    console.error('Error marking marathon as finished:', error)
    errorToast(error.message || 'Failed to mark marathon as finished.')
    return false
  }
}

export async function markMarathonCancelled(uid: string, mid: string) {
  const marathonDocRef = doc(firestore, `users/${uid}/marathon/${mid}`)

  try {
    await runTransaction(firestore, async (transaction) => {
      const docSnap = await transaction.get(marathonDocRef)
      if (!docSnap.exists()) {
        throw new Error(`Marathon document with mid: ${mid} not found.`)
      }

      const marathonData = docSnap.data() as MarathonData

      // Reset relevant data fields
      const resetPositions = marathonData.customers.map((c) => ({
        cid: c.cid,
        position: 0, // Or any appropriate default value
        name: c.name,
        weightLossOrWeightGain: 0,
        weight: 0,
        height: 0
      }))
      const resetGraph = {} // Or an initial empty state that matches your MarathonData type
      const resetData = [] // Or an initial empty state

      await transaction.update(marathonDocRef, {
        state: 'CANCELLED',
        positions: resetPositions,
        graph: resetGraph,
        data: resetData,
        updatedOn: new Date().toLocaleDateString()
      })
    })
    successToast(`Marathon with id: ${mid} has been successfully marked as CANCELLED`)
    return true
  } catch (error: any) {
    console.error('Error marking marathon as cancelled:', error)
    errorToast(error.message || 'Failed to mark marathon as cancelled.')
    return false
  }
}
