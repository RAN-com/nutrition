import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UIState {
  dimensions: {
    width: number
    height: number
  } | null
  toggle_dev_mode: boolean
  updates: {
    downloadProgress: {
      total: number;
      delta: number;
      transferred: number;
      percent: number;
      bytesPerSecond: number;
    } | null
    isAvailable: boolean;
    showModalForAvailable: boolean;
    showModalForDownloaded: boolean;
    isDownloaded: boolean;
  };
}

const initialState: UIState = {
  dimensions: null,
  toggle_dev_mode: false,
  updates: {
    downloadProgress: null,
    showModalForAvailable: false,
    showModalForDownloaded: false,
    isAvailable: false,
    isDownloaded: false
  }
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setDownloadProgress: (state, action: PayloadAction<UIState['updates']['downloadProgress']>) => {
      state.updates.downloadProgress = action.payload
    },
    toggleDevMode: (state, action: PayloadAction<UIState['toggle_dev_mode']>) => {
      state.toggle_dev_mode = action.payload
    },
    setDimensions(state, action: PayloadAction<UIState['dimensions']>) {
      state.dimensions = action.payload
    },
    setShowAvailableModal(state, action) {
      state.updates = {
        ...state.updates,
        showModalForAvailable: action.payload
      }
    },
    setShowDownloadedModal(state, action) {
      state.updates = {
        ...state.updates,
        showModalForDownloaded: action.payload
      };
    },
    setUpdateAvailableStatus(state, action) {
      state.updates.isAvailable = action.payload
    },
    setUpdateDownloaded(state, action) {
      state.updates.downloadProgress = null;
      state.updates.isDownloaded = action.payload;
    }
  }
})

export const { setShowAvailableModal, setShowDownloadedModal, setDimensions, toggleDevMode, setUpdateAvailableStatus,
  setDownloadProgress,
  setUpdateDownloaded } = uiSlice.actions

export default uiSlice.reducer
