import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { getDomainData } from '@renderer/firebase/domain'
import { getStaff, getStaffs, getTotalStaffs } from '@renderer/firebase/staffs'
import { DomainData } from '@renderer/types/card'

import { StaffData } from '@renderer/types/staff'

type INITIAL_STATE = {
  staffs: StaffData[]
  total_staff_count: number
  total_pages: number
  staffs_loading: boolean
  current_staff: StaffData | null
  current_staff_domain: DomainData | null
  domain_loading: boolean
}

const initialState: INITIAL_STATE = {
  staffs: [],
  current_staff: null,
  staffs_loading: false,
  total_staff_count: 0,
  total_pages: 1,
  current_staff_domain: null,
  domain_loading: false
}

const name = 'staffs'

export const asyncGetStaffs = createAsyncThunk(
  `${name}/asyncGetStaffs`,
  async ({ uid }: { uid: string }) => {
    return await getStaffs(uid)
  }
)

export const asyncGetCurrentStaffDomainData = createAsyncThunk(
  `${name}/asyncGetCurrentStaffDomainData`,
  async ({ domain }: { domain: string }) => {
    if (!domain) return null
    return await getDomainData(domain)
  }
)

export const asyncSetCurrentStaff = createAsyncThunk(
  `${name}/asyncSetCurrentStaff`,
  async ({ uid, vid }: { uid: string; vid: string }) => {
    return await getStaff(uid, vid)
  }
)

export const asyncSetTotalStaff = createAsyncThunk(
  `${name}/asyncSetTotalStaff`,
  async ({ uid }: { uid: string }) => {
    return await getTotalStaffs(uid)
  }
)

const staffSlice = createSlice({
  name,
  initialState,
  reducers: {
    incrementStaffPage: (state) => {
      state.total_pages = state.total_pages + 1
    },
    decrementStaffPage: (state) => {
      state.total_pages = state.total_pages > 1 ? state.total_pages - 1 : 1
    },
    setCurrentStaff: (state, action: PayloadAction<string | StaffData>) => {
      if (typeof action.payload === 'string') {
        state.current_staff = state.staffs.filter((e) => e.data.sid === action.payload)[0] ?? null
      } else {
        state.current_staff = action.payload
      }
    }
  },
  extraReducers: (builders) => {
    builders.addCase(asyncGetStaffs.pending, (state) => {
      state.staffs_loading = true
    })

    builders.addCase(asyncGetStaffs.rejected, (state) => {
      state.staffs_loading = false
    })

    builders.addCase(asyncGetStaffs.fulfilled, (state, action) => {
      if (action.payload) {
        state.staffs = action.payload?.data ?? []
        state.total_staff_count = action.payload.data?.length ?? 0
        state.total_pages = action.payload.data?.length ?? 0
      }
      state.staffs_loading = false
    })

    builders.addCase(asyncGetCurrentStaffDomainData.pending, (state) => {
      state.staffs_loading = true
    })

    builders.addCase(asyncGetCurrentStaffDomainData.rejected, (state) => {
      state.staffs_loading = false
    })

    builders.addCase(asyncGetCurrentStaffDomainData.fulfilled, (state, action) => {
      if (action.payload) {
        state.current_staff_domain = action.payload
      } else {
        state.current_staff_domain = null
      }
      state.staffs_loading = false
    })

    builders.addCase(asyncSetTotalStaff.fulfilled, (state, action) => {
      if (action.payload) {
        state.total_staff_count = action.payload
      }
    })

    builders.addCase(asyncSetCurrentStaff.pending, (state) => {
      state.staffs_loading = true
    })

    builders.addCase(asyncSetCurrentStaff.rejected, (state) => {
      state.staffs_loading = false
    })

    builders.addCase(asyncSetCurrentStaff.fulfilled, (state, action) => {
      if (action.payload && action.payload?.data) {
        state.current_staff = action.payload?.data as StaffData
      }
      state.staffs_loading = false
    })
  }
})

export const { decrementStaffPage, incrementStaffPage, setCurrentStaff } = staffSlice.actions

export default staffSlice.reducer
