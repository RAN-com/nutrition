import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { getVisitor, getVisitors } from '@renderer/firebase/visitor'

import { VisitorData } from '@renderer/types/visitor'

type INITIAL_STATE = {
  visitors: VisitorData[]
  total_visitor_count: number
  total_pages: number
  visitors_loading: boolean
  current_visitor: VisitorData | null
}

const initialState: INITIAL_STATE = {
  visitors: [],
  current_visitor: null,
  visitors_loading: false,
  total_visitor_count: 0,
  total_pages: 1
}

const name = 'visitors'

export const asyncGetVisitors = createAsyncThunk(
  `${name}/asyncGetVisitors`,
  async ({ uid, page = 1, limit = 100 }: { uid: string; page?: number; limit?: number }) => {
    return await getVisitors(uid, page, limit)
  }
)

export const asyncSetCurrentVisitor = createAsyncThunk(
  `${name}/asyncSetCurrentVisitor`,
  async ({ uid, vid }: { uid: string; vid: string }) => {
    return await getVisitor(uid, vid)
  }
)

const visitorSlice = createSlice({
  name,
  initialState,
  reducers: {
    incrementVisitorPage: (state) => {
      state.total_pages = state.total_pages + 1
    },
    decrementVisitorPage: (state) => {
      state.total_pages = state.total_pages > 1 ? state.total_pages - 1 : 1
    },
    setCurrentVisitor: (state, action: PayloadAction<string>) => {
      state.current_visitor = state.visitors.filter((e) => e.data.vid === action.payload)[0] ?? null
    }
  },
  extraReducers: (builders) => {
    builders.addCase(asyncGetVisitors.pending, (state) => {
      state.visitors_loading = true
    })

    builders.addCase(asyncGetVisitors.rejected, (state) => {
      state.visitors_loading = false
    })

    builders.addCase(asyncGetVisitors.fulfilled, (state, action) => {
      if (action.payload) {
        state.visitors = action.payload?.visitors
        state.total_visitor_count = action.payload.totalDocs
        state.total_pages = action.payload.totalPages
      }
      state.visitors_loading = false
    })

    builders.addCase(asyncSetCurrentVisitor.pending, (state) => {
      state.visitors_loading = true
    })

    builders.addCase(asyncSetCurrentVisitor.rejected, (state) => {
      state.visitors_loading = false
    })

    builders.addCase(asyncSetCurrentVisitor.fulfilled, (state, action) => {
      if (action.payload && action.payload?.data) {
        state.current_visitor = action.payload?.data as VisitorData
      }
      state.visitors_loading = false
    })
  }
})

export const { decrementVisitorPage, incrementVisitorPage, setCurrentVisitor } =
  visitorSlice.actions

export default visitorSlice.reducer
