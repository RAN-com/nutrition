import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UIState {
  dimensions: {
    width: number
    height: number
  } | null
  toggle_dev_mode: boolean
}

const initialState: UIState = {
  dimensions: null,
  toggle_dev_mode: false
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleDevMode: (state, action: PayloadAction<UIState['toggle_dev_mode']>) => {
      state.toggle_dev_mode = action.payload
    },
    setDimensions(state, action: PayloadAction<UIState['dimensions']>) {
      state.dimensions = action.payload
    }
  }
})

export const { setDimensions, toggleDevMode } = uiSlice.actions

export default uiSlice.reducer
