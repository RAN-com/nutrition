import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { CenterUserPricing } from '@renderer/types/user'
import pricingJSON from './data.json'
type INITIAL_STATE = {
  center_user: CenterUserPricing[]
  appointment: CenterUserPricing[]
  loading: boolean
}

const initialState: INITIAL_STATE = {
  center_user: pricingJSON?.filter((e) => e.type === 'subscription') as CenterUserPricing[],
  appointment: pricingJSON?.filter((e) => e.type === 'appointments') as CenterUserPricing[],
  loading: false
}

const name = 'pricing'

export const getUserPricing = createAsyncThunk(`${name}/getUserPricing`, async () => {
  return null
})

const pricingSlice = createSlice({
  name,
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(getUserPricing.pending, (state) => {
      state.loading = true
    })

    builder.addCase(getUserPricing.rejected, (state) => {
      state.loading = false
    })

    builder.addCase(getUserPricing.fulfilled, (state, action) => {
      if (action.payload) {
        state.appointment = []
        state.center_user = []
      }
      state.loading = false
    })
  }
})

export default pricingSlice.reducer
