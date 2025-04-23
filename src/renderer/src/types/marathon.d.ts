export type Customer = {
  cid: string
  name: string
  dob: string
  age: number // Changed to number for easier calculations
}

export type MarathonData = {
  mid: string
  from_date: string
  to_date: string
  state: 'UPCOMING' | 'ONGOING' | 'FINISHED' | 'CANCELLED'
  type: 'weight_loss' | 'weight_gain'
  customers: Customer[]
  total_users: number
  created_on: string
  created_by: {
    uid: string
  }
  graph: Record<
    string,
    {
      values: {
        weightLossOrWeightGain: number // in kgs
        day: number
        date: string
        weight: number
        height: number
      }[]
    }
  > // Using Record for easier lookup by cid
  positions: {
    cid: string
    position: number // 1, 2, 3
    name: string
    weightLossOrWeightGain: number
    weight: number
    height: number
  }[]
  data: {
    day: number
    date: string
    total_entries: number
    remaining_entries: number
    records: Record<
      string,
      {
        day: number
        date: string
        values: {
          weightLossOrWeightGain: number // in kgs
          weight: number
          height: number
        }
      }
    > // Using Record for easier lookup by cid
  }[]
  updatedOn?: string
}

export type CreateMarathon = {
  customers: Customer[] // Assuming age might be calculated server-side
  type: 'weight_loss' | 'weight_gain'
  from_date: string
  to_date: string
}
