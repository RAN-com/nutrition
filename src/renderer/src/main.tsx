import './assets/main.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { persistor, store } from './redux/store'
import { ThemeProvider } from '@emotion/react'
import { theme } from './theme/index'
import { CssBaseline, GlobalStyles } from '@mui/material'
import { Toaster } from 'react-hot-toast'
import zIndex from '@mui/material/styles/zIndex'

const resizeOps = (): void => {
  const vh = window.innerHeight * 0.01
  document.documentElement.style.setProperty('--vh', `${vh}px`)
}

resizeOps()
window.addEventListener('resize', resizeOps)

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <ThemeProvider theme={theme}>
          <GlobalStyles
            styles={{
              '*': {
                '& *.scrollbar::-webkit-scrollbar': {
                  width: '8px', // Scrollbar width
                  height: '8px'
                },
                '& *.scrollbar::-webkit-scrollbar-track': {
                  backgroundColor: '#d1d1d1', // Scrollbar track color
                  borderRadius: '20px' // Optional: rounded corners for the track
                },
                '& *.scrollbar::-webkit-scrollbar-thumb': {
                  backgroundColor: '#6d6d6d', // Scrollbar thumb color
                  borderRadius: '10px', // Rounded corners for the thumb
                  border: '2px solid #e0e0e0' // Optional: creates padding-like effect
                },
                '& *.scrollbar::-webkit-scrollbar-thumb:hover': {
                  backgroundColor: '#0056b3' // Color on hover
                }
              }
            }}
          />
          <Toaster
            containerStyle={{ zIndex: zIndex.modal * 10 }}
            toastOptions={{
              style: {
                // position: "fixed",
                zIndex: zIndex.modal * 10
              }
            }}
          />
          <CssBaseline />
          {/* <Layout> */}
          <App />
          {/* </Layout> */}
        </ThemeProvider>
      </PersistGate>
    </Provider>
  </React.StrictMode>
)
