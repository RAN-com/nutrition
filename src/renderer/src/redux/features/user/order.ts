import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { getPaginatedOrders } from '@renderer/firebase/order'
import { RootState } from '@renderer/redux/store'
import { OrderData } from '@renderer/types/product'

type INITIAL_STATE = {
  orders: OrderData[]
  total_orders: number
  page: number
  limit: number
  loading: boolean
}

const initialState: INITIAL_STATE = {
  limit: 5,
  orders: [],
  total_orders: 0,
  page: 1,
  loading: false
}

const name = 'orders'

export const asyncGetOrders = createAsyncThunk(
  `${name}/asyncGetOrders`,
  async ({ uid }: { uid: string }, { getState }) => {
    const state = (getState() as RootState).orders
    return getPaginatedOrders(uid, state.page, state.limit)
  }
)

const orderSlice = createSlice({
  name,
  initialState,
  reducers: {
    setOrderPageLimit: (state, action: PayloadAction<number>) => {
      state.limit = action.payload
    },
    setOrderPage: (state, action) => {
      state.page = action.payload
    }
  },
  extraReducers: (builders) => {
    builders.addCase(asyncGetOrders.pending, (state) => {
      state.loading = true
    })

    builders.addCase(asyncGetOrders.rejected, (state) => {
      state.loading = false
    })

    builders.addCase(asyncGetOrders.fulfilled, (state, action) => {
      if (action.payload) {
        state.orders = action.payload.orders
        state.total_orders = action.payload.total
      }
      state.loading = false
    })
  }
})

export const { setOrderPage, setOrderPageLimit } = orderSlice.actions

export default orderSlice.reducer
