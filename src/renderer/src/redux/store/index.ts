/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { combineReducers, configureStore } from '@reduxjs/toolkit'
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import logger from 'redux-logger'
import authSlice from '../features/user/auth'
import customerSlice from '../features/user/customers'
import productSlice from '../features/user/products'
import orderSlice from '../features/user/order'
import visitorSlice from '../features/user/visitors'
import pricingSlice from '../features/pricing/slice'
import staffSlice from '../features/user/staff'
import cardSlice from '../features/user/card'
import uiSlice from './ui/slice'

// Define RootState type based on combined reducers
const appReducer = combineReducers({
  auth: authSlice,
  customer: customerSlice,
  product: productSlice,
  orders: orderSlice,
  visitor: visitorSlice,
  pricing: pricingSlice,
  staffs: staffSlice,
  card: cardSlice,
  ui: uiSlice
})

// Persist configuration
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'staffs', 'pricing'] // List of reducers to persist
}

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, appReducer)

// Configure the store with proper typing
export const store = configureStore({
  reducer: persistedReducer,
  devTools: import.meta.env.NODE_ENV !== 'production',
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
      }
    }).concat([logger])
})

// Persistor export
export const persistor = persistStore(store)

// Type definitions
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
