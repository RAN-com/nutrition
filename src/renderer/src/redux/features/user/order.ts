// redux/features/orders/orderSlice.ts

import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { getPaginatedOrders } from '@renderer/firebase/order'
import { RootState } from '@renderer/redux/store'
import { OrderData } from '@renderer/types/product'
import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore'

interface OrdersState {
  orders: OrderData[]
  total_orders: number
  limit: number
  loading: boolean
  cursorStack: QueryDocumentSnapshot<DocumentData>[] // ← for back support
  lastVisible: QueryDocumentSnapshot<DocumentData> | null
  currentPage: number
}

const initialState: OrdersState = {
  orders: [],
  total_orders: 0,
  limit: 20,
  loading: false,
  cursorStack: [],
  lastVisible: null,
  currentPage: 1
}

export const asyncGetOrders = createAsyncThunk(
  'orders/asyncGetOrders',
  async ({ uid, direction }: { uid: string; direction?: 'next' | 'prev' }, { getState }) => {
    const state = (getState() as RootState).orders

    const cursor =
      direction === 'next'
        ? (state.cursorStack.at(state.currentPage - 1) ?? null)
        : (state.cursorStack.at(state.currentPage - 3) ?? null)

    const result = await getPaginatedOrders(uid, state.limit, cursor)

    return { ...result, direction }
  }
)

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    resetOrders: (state) => {
      state.orders = []
      state.total_orders = 0
      state.lastVisible = null
      state.cursorStack = []
      state.currentPage = 1
    },
    setOrderLimit: (state, action: PayloadAction<number>) => {
      state.limit = action.payload
    }
  },
  extraReducers: (builder) => {
    builder.addCase(asyncGetOrders.pending, (state) => {
      state.loading = true
    })
    builder.addCase(asyncGetOrders.fulfilled, (state, action) => {
      const { orders, total, lastVisible, direction } = action.payload

      state.orders = orders
      state.total_orders = total
      state.lastVisible = lastVisible

      if (direction === 'next') {
        state.cursorStack.push(lastVisible!)
        state.currentPage += 1
      } else if (direction === 'prev') {
        state.cursorStack.pop()
        state.currentPage = Math.max(1, state.currentPage - 1)
      }

      state.loading = false
    })
    builder.addCase(asyncGetOrders.rejected, (state) => {
      state.loading = false
    })
  }
})

export const { resetOrders, setOrderLimit } = orderSlice.actions
export default orderSlice.reducer
