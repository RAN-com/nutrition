import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UIState {
  dimensions: {
    width: number
    height: number
  } | null
}

const initialState: UIState = {
  dimensions: null
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setDimensions(state, action: PayloadAction<UIState['dimensions']>) {
      state.dimensions = action.payload
    }
  }
})

export const { setDimensions } = uiSlice.actions

export default uiSlice.reducer
