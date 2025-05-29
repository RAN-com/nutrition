import './assets/main.css'
import 'react-responsive-carousel/lib/styles/carousel.min.css' // requires a loader
import { SnackbarProvider } from 'notistack'
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

  document.documentElement.style.setProperty('width', `${window.screen.availWidth}px`)
  document.documentElement.style.setProperty('height', `${window.screen.availHeight}px`)
  document.documentElement.style.setProperty('--vh', `${vh}px`)
}

resizeOps()
window.addEventListener('DOMContentLoaded', resizeOps)
window.addEventListener('resize', resizeOps)

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <ThemeProvider theme={theme}>
          <SnackbarProvider autoHideDuration={3000} maxSnack={3} preventDuplicate>
            <Toaster
              containerStyle={{ zIndex: zIndex.modal * 100 }} // Adjust zIndex as needed
              // containerStyle={{ zIndex: zIndex.modal * 10 }}
              // toastOptions={{
              //   style: {
              //     // position: "fixed",
              //     zIndex: zIndex.modal * 10
              //   }
              // }}
            />
            <GlobalStyles
              styles={{
                '*': {
                  '::-webkit-scrollbar': {
                    width: '8px', // Scrollbar width
                    height: '8px'
                  },
                  '::-webkit-scrollbar-track': {
                    backgroundColor: '#d1d1d1', // Scrollbar track color
                    borderRadius: '20px' // Optional: rounded corners for the track
                  },
                  '::-webkit-scrollbar-thumb': {
                    backgroundColor: '#6d6d6d', // Scrollbar thumb color
                    borderRadius: '10px', // Rounded corners for the thumb
                    border: '2px solid #e0e0e0' // Optional: creates padding-like effect
                  },
                  '::-webkit-scrollbar-thumb:hover': {
                    backgroundColor: '#0056b3' // Color on hover
                  },
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
            <CssBaseline />
            {/* <Layout> */}
            <App />
            {/* </Layout> */}
          </SnackbarProvider>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  </React.StrictMode>
)
