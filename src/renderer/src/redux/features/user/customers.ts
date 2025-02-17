import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
  getActiveSubscription,
  getAllMarathons,
  getAttendanceRecords,
  getCustomer,
  getCustomers,
  getPersonalRecords
} from '@renderer/firebase/customers'
import {
  AttendanceSubscription,
  CustomerAttendance,
  CustomerRecords,
  CustomerResponse,
  MarathonData
} from '@renderer/types/customers'
import { QueryDocumentSnapshot } from 'firebase/firestore'
import moment from 'moment'

type INITIAL_STATE = {
  customers: CustomerResponse[]
  total_customers_docs: number
  total_pages: number
  customers_loading: boolean
  attendance_fetch: {
    last: null | QueryDocumentSnapshot
    first: null | QueryDocumentSnapshot
  }
  selected_attendance_date: {
    date: string
    type: 'marked' | 'unmarked'
  } | null
  current_customer_loading: boolean
  current_customer:
    | {
        subscription: AttendanceSubscription | null
        data: CustomerResponse
        marathon: MarathonData[]
        attendance: {
          month: number
          year: number
          data: CustomerAttendance[]
        }[]
        records: {
          data: CustomerRecords[]
        }
      }
    | undefined
}

const initialState: INITIAL_STATE = {
  customers: [],
  attendance_fetch: {
    first: null,
    last: null
  },
  customers_loading: false,
  total_customers_docs: 0,
  total_pages: 1,
  current_customer: undefined,
  selected_attendance_date: null,
  current_customer_loading: false
}

const name = 'customers'

export const asyncGetCustomers = createAsyncThunk(
  `${name}/asyncGetCustomers`,
  async ({ uid, page = 1, limit = 50 }: { uid: string; page?: number; limit?: number }) => {
    return await getCustomers(uid, page, limit)
  }
)

export const asyncSetCurrentUser = createAsyncThunk(
  `${name}/asyncSetCurrentUser`,
  async ({ uid, cid }: { uid: string; cid: string }) => {
    try {
      if (uid.length === 0 || cid.length === 0) return null
      const [data, marathon, attendance, records, subscription] = await Promise.all([
        getCustomer(uid, cid), // Fetch customer data
        getAllMarathons({ uid, cid }), // Fetch all marathon records
        getAttendanceRecords({
          uid,
          cid,
          month: moment().month(),
          year: moment().year()
        }), // Fetch all attendance records,
        getPersonalRecords(uid, cid),
        getActiveSubscription(uid, cid)
      ])

      return {
        data: data?.data as CustomerResponse,
        marathon: marathon ?? [],
        attendance: attendance?.data.length === 0 ? [] : [attendance],
        records: records ?? [],
        subscription: subscription ?? null
      }
    } catch (err) {
      console.error(err)
      return null
    }
  }
)

export const asyncGetCustomerRecords = createAsyncThunk(
  `${name}/asyncGetCustomerRecords`,
  async ({ uid, cid }: { uid: string; cid: string }) => {
    return getPersonalRecords(uid, cid)
  }
)

export const asyncGetCurrentCustomerAttendance = createAsyncThunk(
  `${name}/asyncGetCurrentCustomerAttendance`,
  async ({ cid, month, year, uid }: { uid: string; cid: string; month: number; year: number }) => {
    try {
      const [attendance] = await Promise.all([getAttendanceRecords({ uid, cid, month, year })])
      return attendance
    } catch (err) {
      console.error(err)
      return null
    }
  }
)

export const asyncGetUserSubscription = createAsyncThunk(
  `${name}/asyncGetUserSubscription`,
  async ({ uid, cid }: { uid: string; cid: string }) => {
    return getActiveSubscription(uid, cid)
  }
)

const customerSlice = createSlice({
  name,
  initialState,
  reducers: {
    resetCurrentUser: (state) => {
      state.current_customer = initialState.current_customer
    },
    setCurrentAttendanceDate: (state, action) => {
      state.selected_attendance_date = action.payload
    }
  },
  extraReducers: (builders) => {
    builders.addCase(asyncGetCustomers.pending, (state) => {
      state.customers_loading = true
    })

    builders.addCase(asyncGetCustomers.rejected, (state) => {
      state.customers_loading = false
    })

    builders.addCase(asyncGetCustomers.fulfilled, (state, action) => {
      if (action.payload) {
        state.customers = action.payload?.customers
        state.total_customers_docs = action.payload.totalDocs
        state.total_pages = action.payload.totalPages
      }
      state.customers_loading = false
    })

    builders.addCase(asyncSetCurrentUser.pending, (state) => {
      state.current_customer_loading = true
    })

    builders.addCase(asyncSetCurrentUser.rejected, (state) => {
      state.current_customer_loading = false
    })

    builders.addCase(asyncSetCurrentUser.fulfilled, (state, action) => {
      if (action.payload) {
        const { data, marathon, attendance, records, subscription } = action.payload

        state.current_customer = {
          data,
          marathon,
          attendance:
            attendance?.map((e) => {
              if (
                state.current_customer?.attendance?.filter(
                  (a) => a.month === e.month && a.year === e.year
                )[0]
              ) {
                return {
                  month: e.month as number,
                  year: e.year as number,
                  data: e.data ?? []
                }
              }
              return {
                month: e.month as number,
                year: e.year as number,
                data: e.data ?? []
              }
            }) ?? [],
          records: {
            data: records
          },
          subscription
        }

        // state.current_customer = {
        //   ...action.payload,
        //   subscription: action.payload?.subscription,
        //   records: {
        //     data: action.payload.records
        //   },
        // attendance: {
        //   data: action.payload?.attendance?.data,
        //   total: action.payload?.attendance?.totalDocs
        // }
      }
      state.current_customer_loading = false
    })

    builders.addCase(asyncGetUserSubscription.pending, (state) => {
      state.customers_loading = true
    })

    builders.addCase(asyncGetUserSubscription.rejected, (state) => {
      state.customers_loading = false
    })

    builders.addCase(asyncGetUserSubscription.fulfilled, (state, action) => {
      if (state.current_customer) {
        state.current_customer = {
          ...state.current_customer,
          subscription: action.payload
        }
      }
    })

    builders.addCase(asyncGetCurrentCustomerAttendance.pending, (state) => {
      state.customers_loading = true
    })

    builders.addCase(asyncGetCurrentCustomerAttendance.rejected, (state) => {
      state.customers_loading = false
    })

    builders.addCase(asyncGetCurrentCustomerAttendance.fulfilled, (state, action) => {
      if (action.payload && state.current_customer) {
        if (
          state.current_customer.attendance?.filter(
            (e) => e.year === action.payload?.year && e.month === action.payload?.month
          )[0]
        ) {
          state.current_customer = {
            ...state.current_customer,
            attendance: state.current_customer.attendance.map((e) => {
              if (e.month !== action.payload?.month && e.year !== action.payload?.year) return e
              return {
                ...e,
                data: action.payload.data
              }
            })
          }
        } else {
          state.current_customer = {
            ...state.current_customer,
            attendance: [
              ...state.current_customer?.attendance,
              {
                month: action.payload?.month as number,
                data: action.payload.data,
                year: action.payload?.year as number
              }
            ]
          }
        }
      }
      state.customers_loading = false
    })

    builders.addCase(asyncGetCustomerRecords.fulfilled, (state, action) => {
      if (state.current_customer && action.payload) {
        state.current_customer = {
          ...state.current_customer,
          records: { data: action.payload }
        }
      }
    })
  }
})

export const { resetCurrentUser, setCurrentAttendanceDate } = customerSlice.actions

export default customerSlice.reducer
