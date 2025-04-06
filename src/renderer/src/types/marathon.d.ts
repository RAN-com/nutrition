export type MarathonData = {
  mid: string
  from_date: string
  to_date: string
  type: 'weight_loss' | 'weight_gain'
  customers: {
    cid: string
    name: string
    dob: string
    age: string
  }[]
  total_users: number
  created_on: string
  created_by: {
    uid: string
  }
  graph: {
    cid: string
    values: {
      weight_loss: number // in kgs
      day: number
      date: string
      weight: number
      height: number
    }[]
  }[]
  positions: {
    cid: string
    position: number // 1, 2, 3
    name: string
    weight_loss: number
    weight: number
    height: number
  }[]
  data: {
    day: number
    date: string
    total_entries: number
    remaining_entries: number
    records: {
      cid: string
      day: number
      date: string
      values: {
        weight_loss: number // in kgs
        weight: number
        height: number
      }
    }[]
  }[]

  updatedOn?: string
}

export type CreateMarathon = {
  customers: {
    cid: string
    name: string
    dob: string
    name: string
    age: string
  }[]
  type: 'weight_loss' | 'weight_gain'
  from_date: string
  to_date: string
}
