import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { getPaginatedProducts } from '@renderer/firebase/product'
import { RootState } from '@renderer/redux/store'
import { ProductData } from '@renderer/types/product'

type INITIAL_STATE = {
  edit?: ProductData
  data: {
    page: number
    limit: number
    total: number
    size: number
    products: ProductData[]
  }
  cart: {
    products: { detail: ProductData; quantity: number }[]
  }
  loading: boolean
}

const initialState: INITIAL_STATE = {
  data: {
    page: 1,
    limit: 5,
    products: [],
    size: 0,
    total: 0
  },
  cart: {
    products: []
  },
  loading: false
}

const name = 'product'

export const asyncGetProducts = createAsyncThunk(
  `${name}/asyncGetProducts`,
  async ({ uid }: { uid: string }, { getState }) => {
    const state = getState() as RootState
    try {
      const products = await getPaginatedProducts(
        uid,
        state.product.data.page,
        state.product.data.limit
      )
      return products
    } catch (err) {
      console.log(err)
      return null
    }
  }
)

const productSlice = createSlice({
  name,
  initialState,
  reducers: {
    setQuantity: (
      state,
      action: PayloadAction<{ id: string; quantity: number; type: 'add' | 'remove' }>
    ) => {
      const productId = action.payload.id
      const quantity = action.payload.quantity
      const productIndex = state.cart.products.findIndex((e) => e.detail?.pid === productId)

      if (action.payload.type === 'remove') {
        // Decrement the quantity of the existing product
        if (productIndex !== -1) {
          const product = state.cart.products[productIndex]

          // Decrement the quantity
          const newQuantity = product.quantity - quantity

          // Update the stock in the products list
          state.data.products = state.data.products.map((e) => {
            if (e.pid === productId) {
              return {
                ...e,
                in_stock: e.in_stock + quantity // Increase stock since we're removing from cart
              }
            } else {
              return e
            }
          })

          // If the new quantity is 0 or less, remove the product from cart
          if (newQuantity <= 0) {
            state.cart.products = state.cart.products.filter((e) => e.detail?.pid !== productId)
          } else {
            // Otherwise, just update the quantity in the cart
            state.cart.products[productIndex].quantity = newQuantity
          }
        }
      } else if (action.payload.type === 'add') {
        // Increment the quantity of the existing product
        if (productIndex !== -1) {
          // Decrease stock when adding to the cart
          state.data.products = state.data.products.map((e) => {
            if (e.pid === productId) {
              if (e.in_stock >= quantity) {
                const num = e.in_stock - quantity
                state.cart.products[productIndex].quantity += quantity
                return {
                  ...e,
                  in_stock: num // Decrease stock when adding to cart
                }
              } else return e
            } else {
              return e
            }
          })

          // Increase the quantity in the cart
        }
      }
    },

    addToCart: (state, action: PayloadAction<ProductData>) => {
      state.data.products = state.data.products.map((e) => {
        if (e.pid === action.payload.pid) {
          return {
            ...e,
            in_stock: e.in_stock - 1
          }
        } else {
          return e
        }
      })
      state.cart.products = [
        ...state.cart.products,
        { detail: action.payload, quantity: 1 }
      ].filter((v, i, a) => a.findIndex((e) => e.detail?.pid === v.detail?.pid) === i)
    },
    setProductEdit: (state, action: PayloadAction<ProductData | undefined>) => {
      state.edit = action.payload
    },
    deleteFromCart: (state, action: PayloadAction<{ id: string }>) => {
      const productId = action.payload.id
      const productIndex = state.cart.products.findIndex((e) => e.detail?.pid === productId)

      if (productIndex !== -1) {
        // Product is in the cart, so we need to adjust the stock
        const productInCart = state.cart.products[productIndex]
        const productStock = productInCart.quantity

        // Update the stock in the products list (increase by the quantity that was in the cart)
        state.data.products = state.data.products.map((e) => {
          if (e.pid === productId) {
            return {
              ...e,
              in_stock: e.in_stock + productStock // Increment the stock based on cart quantity
            }
          } else {
            return e
          }
        })

        // Remove the product from the cart
        state.cart.products = state.cart.products.filter((e) => e.detail?.pid !== productId)
      } else {
        // Product is not in the cart, just remove it from the cart list (if needed)
        state.cart.products = state.cart.products.filter((e) => e.detail?.pid !== productId)
      }
    },
    incrementPage: (state) => {
      state.data.page = state.data.page + 1
    },
    decrementPage: (state) => {
      state.data.page = state.data.page + 1
    },
    updatePageLimit: (state, action: PayloadAction<number>) => {
      state.data.limit = action.payload
    },
    resetCart: (state) => {
      state.cart = { products: [] }
    }
  },
  extraReducers(builder) {
    builder.addCase(asyncGetProducts.pending, (state) => {
      state.loading = true
    })

    builder.addCase(asyncGetProducts.rejected, (state) => {
      state.loading = false
    })

    builder.addCase(asyncGetProducts.fulfilled, (state, action) => {
      if (action.payload) {
        const updatedData = action.payload.products
        const existingData = state.data.products ?? []

        const mergedData = existingData.map((record) => {
          const updatedRecord = updatedData.find((update) => update.pid === record.pid)
          return updatedRecord ? { ...record, ...updatedRecord } : record
        })

        const newRecords = updatedData.filter(
          (update) => !existingData.some((record) => record.pid === update.pid)
        )

        state.data.products = [...mergedData, ...newRecords].map((e) => {
          const find = state.cart.products.filter((d) => d.detail.pid === e.pid)[0]
          if (!find) return e
          if (find && find?.quantity > e.in_stock) {
            state.cart.products = state.cart.products.filter((d) => d.detail.pid !== e.pid)
            return e
          }
          return {
            ...e,
            in_stock: e.in_stock - find.quantity
          }
        })

        state.data.total = action.payload.total
      }
      state.loading = false
    })
  }
})

export const {
  decrementPage,
  incrementPage,
  updatePageLimit,
  addToCart,
  deleteFromCart,
  setProductEdit,
  setQuantity,
  resetCart
} = productSlice.actions

export default productSlice.reducer
