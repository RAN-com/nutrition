import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getAllAttendance } from '@renderer/firebase/customers'
import { GalleryResponse } from '@renderer/types/customers'

type INITIAL_STATE = {
  data: GalleryResponse[]
  loading: boolean
}

const initialState: INITIAL_STATE = {
  data: [],
  loading: false
}

const name = 'gallery'

export const asyncGetGalleryData = createAsyncThunk(
  `${name}/asyncGetGalleryData`,
  async (uid: string) => getAllAttendance(uid)
)

const gallerySlice = createSlice({
  name,
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setGalleryData: (state, action) => {
      state.data = action.payload
    }
  },
  extraReducers: (builders) => {
    builders.addCase(asyncGetGalleryData.pending, (state) => {
      state.loading = true
    })

    builders.addCase(asyncGetGalleryData.rejected, (state) => {
      state.loading = false
    })

    builders.addCase(asyncGetGalleryData.fulfilled, (state, action) => {
      state.data = action.payload || []
      state.loading = false
    })
  }
})

export const { setGalleryData, setLoading } = gallerySlice.actions

export default gallerySlice.reducer
