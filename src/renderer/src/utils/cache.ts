const localStorageKey = 'appCache'

/**
 * Retrieves a value associated with the specified key from the JSON object stored in localStorage under a fixed cache key.
 *
 * @param key - The property name to retrieve from the cached object.
 * @returns The value associated with {@link key}, or null if not found or if the cache is missing or invalid.
 */
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

/**
 * Stores or updates a key-value pair in the JSON object held under 'appCache' in localStorage.
 *
 * If the cache does not exist, it is initialized. The specified {@link key} is set to the provided {@link value}.
 *
 * @param key - The property name to set within the cached object.
 * @param value - The value to associate with {@link key}.
 *
 * @remark
 * Errors during serialization or storage are caught and logged, but not thrown.
 */
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

/**
 * Removes the entire application cache from localStorage.
 *
 * Deletes the JSON object stored under the fixed cache key, effectively clearing all cached data managed by this utility.
 */
export function clearCache(): void {
  try {
    localStorage.removeItem(localStorageKey)
  } catch (error) {
    console.error('Error clearing cache:', error)
  }
}
