import { useState, useEffect } from 'react'

function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine) // Initial state based on current status

  useEffect(() => {
    function handleOnlineChange() {
      setIsOnline(navigator.onLine)
    }

    window.addEventListener('online', handleOnlineChange)

    window.addEventListener('offline', handleOnlineChange)

    return () => {
      window.removeEventListener('online', handleOnlineChange)

      window.removeEventListener('offline', handleOnlineChange)
    }
  }, [])

  return isOnline
}

export default useOnlineStatus
