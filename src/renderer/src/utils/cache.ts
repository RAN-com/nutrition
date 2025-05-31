const localStorageKey = 'appCache'

export function getCache<T>(key: string): T | null {
  const cache = localStorage.getItem(localStorageKey)
  if (!cache) return null

  try {
    const parsedCache = JSON.parse(cache)
    return parsedCache[key] || null
  } catch (error) {
    console.error('Error parsing cache:', error)
    return null
  }
}

export function setCache<T>(key: string, value: T): void {
  const cache = localStorage.getItem(localStorageKey)
  const parsedCache = cache ? JSON.parse(cache) : {}

  parsedCache[key] = value

  try {
    localStorage.setItem(localStorageKey, JSON.stringify(parsedCache))
  } catch (error) {
    console.error('Error setting cache:', error)
  }
}

export function clearCache(): void {
  try {
    localStorage.removeItem(localStorageKey)
  } catch (error) {
    console.error('Error clearing cache:', error)
  }
}
