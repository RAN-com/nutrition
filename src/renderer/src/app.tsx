import Navigation from './navigation'
import React from 'react'
import { infoToast } from './utils/toast'
import RestartModal from './components/modal/restart'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const App = () => {
  const [updateDownloaded, setUpdateDownloaded] = React.useState(false)

  React.useEffect(() => {
    window.electron?.ipcRenderer.on('updateAvailable', () => {
      infoToast('Update Available. This will be auto-downloaded in the background.', undefined, {
        position: 'bottom-left'
      })
    })
    window.electron?.ipcRenderer.on('updateDownloaded', () => {
      setUpdateDownloaded(true)
    })
  }, [])

  return (
    <>
      <RestartModal
        open={updateDownloaded}
        onClose={() => {
          setUpdateDownloaded(false)
          window.electron?.updateResponse('install_later')
        }}
        onRestart={() => {
          window.electron?.updateResponse('install_now')
        }}
      />
      <Navigation />
    </>
  )
}

export default App
