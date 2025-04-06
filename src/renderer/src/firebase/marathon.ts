import { collection, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore'
import { firestore } from './'
import { CreateMarathon, MarathonData } from '@renderer/types/marathon'
import { encryptData } from '@renderer/utils/crypto'
import moment from 'moment'
import { deleteDoc } from 'firebase/firestore'

// functions to create marathon template data
export const checkMarathonExists = async (uid: string, from_date: string, to_date: string) => {
  const docRef = doc(firestore, `${uid}/marathon/${from_date}_${to_date}/data`)
  const ref = await getDoc(docRef)

  if (ref.exists()) {
    return ref.data() as MarathonData
  }

  return null
}

export const createMarathon = async (uid: string, data: CreateMarathon) => {
  try {
    const colId = encryptData(`${data.from_date}_${data.to_date}`)
    const docRef = doc(firestore, `marathon-${uid}/${colId}`)
    const ref = await getDoc(docRef)

    if (ref.exists()) {
      return {
        status: false,
        message: 'Marathon Already Exists',
        data: null
      }
    }

    const template: MarathonData = {
      mid: colId as string,
      created_by: {
        uid
      },
      created_on: moment().toISOString(),
      customers: data.customers,
      data: [],
      from_date: data.from_date,
      to_date: data.to_date,
      graph: [],
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
    if (moment(data.from_date).isBefore(moment().add(1, 'day'))) {
      return {
        status: false,
        message: 'The current day should be at least 1 days before the marathon date',
        data: null
      }
    }

    const docRef = doc(firestore, `marathon-${data.created_by.uid}/${data.mid}`)
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
    const marathonDoc = doc(firestore, `marathon-${uid}/${mid}`)
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
  const marathonDoc = collection(firestore, `marathon-${uid}`)
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

export const updateCustomerData = async (
  mid: string,
  cid: string,
  day: number,
  date: string,
  values: { weight_loss: number; weight: number; height: number }
) => {
  try {
    const marathonDoc = doc(firestore, `marathon/${mid}`)
    const ref = await getDoc(marathonDoc)

    if (!ref.exists()) {
      return {
        status: false,
        message: "Marathon data doesn't exist",
        data: null
      }
    }

    const marathonData = ref.data() as MarathonData

    // Find or create `dayData`
    let dayData = marathonData.data.find((d) => d.day === day)
    if (!dayData) {
      dayData = { day, date, total_entries: 0, remaining_entries: 0, records: [] }
      marathonData.data.push(dayData)
    }

    // Update or insert new record
    const existingRecord = dayData.records.find((record) => record.cid === cid)
    if (existingRecord) {
      existingRecord.values = values
    } else {
      dayData.records.push({ cid, day, date, values })
    }

    // Update `total_entries` & `remaining_entries`
    dayData.total_entries = dayData.records.length
    dayData.remaining_entries = Math.max(0, marathonData.total_users - dayData.total_entries)

    // Update Graph Data
    let graphEntry = marathonData.graph.find((g) => g.cid === cid)
    if (!graphEntry) {
      graphEntry = { cid, values: [] }
      marathonData.graph.push(graphEntry)
    }

    const graphValue = graphEntry.values.find((v) => v.day === day)
    if (graphValue) {
      Object.assign(graphValue, values)
    } else {
      graphEntry.values.push({ day, date, ...values })
    }

    // Compute Positions
    const weightLossMap = marathonData.graph.map((g) => ({
      cid: g.cid,
      weight_loss: g.values.reduce((sum, v) => sum + v.weight_loss, 0),
      weight: g.values[g.values.length - 1]?.weight || 0,
      height: g.values[g.values.length - 1]?.height || 0
    }))

    weightLossMap.sort((a, b) =>
      marathonData.type === 'weight_loss' ? b.weight_loss - a.weight_loss : b.weight - a.weight
    )

    marathonData.positions = weightLossMap.map((entry, index) => ({
      cid: entry.cid,
      position: index + 1,
      name: '', // Placeholder for name
      weight_loss: entry.weight_loss,
      weight: entry.weight,
      height: entry.height
    }))

    // Update only changed fields in Firestore
    await updateDoc(marathonDoc, {
      data: marathonData.data,
      graph: marathonData.graph,
      positions: marathonData.positions,
      updatedOn: new Date().toISOString()
    })

    return {
      status: true,
      message: 'Customer data updated successfully',
      data: marathonData
    }
  } catch (err) {
    return {
      status: false,
      message: (err as Error).message,
      data: null
    }
  }
}
