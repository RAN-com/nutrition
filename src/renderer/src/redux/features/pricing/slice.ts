import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { CenterUserPricing } from '@renderer/types/user'
import pricingJSON from './data.json'
import { CreateAdminPayment, CreateCardPaymentProps } from '@renderer/types/payment'
import { getAdminPayment, getCardPayment } from '@renderer/firebase/pricing'
type INITIAL_STATE = {
  center_user: CenterUserPricing[]
  appointment: CenterUserPricing[]
  loading: boolean
  pending_order: CreateAdminPayment | CreateCardPaymentProps | null
}

const initialState: INITIAL_STATE = {
  center_user: pricingJSON?.filter((e) => e.type === 'subscription') as CenterUserPricing[],
  appointment: pricingJSON?.filter((e) => e.type === 'appointments') as CenterUserPricing[],
  loading: false,
  pending_order: null
}

const name = 'pricing'

export const getUserPricing = createAsyncThunk(`${name}/getUserPricing`, async () => {
  return null
})

export const getPendingOrders = createAsyncThunk(
  `${name}/getPendingOrders`,
  async ({ uid, sid }: { uid: string; sid?: string }) => {
    return Promise.all([getAdminPayment(uid), sid ? getCardPayment(uid, sid) : null])
  }
)

const pricingSlice = createSlice({
  name,
  initialState,
  reducers: {
    setOrderPendingData: (state, action: PayloadAction<INITIAL_STATE['pending_order']>) => {
      state.pending_order = action.payload
    }
  },
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

    builder.addCase(getPendingOrders.pending, (state) => {
      state.loading = true
    })

    builder.addCase(getPendingOrders.rejected, (state) => {
      state.loading = false
    })

    builder.addCase(getPendingOrders.fulfilled, (state, action) => {
      if (action.payload) {
        const [admin, card] = action.payload
        if (admin || card) {
          state.pending_order = admin || card
        } else {
          state.pending_order = null
        }
      }
      state.loading = false
    })
  }
})

export const { setOrderPendingData } = pricingSlice.actions

export default pricingSlice.reducer
