const STORAGE_KEY = 'isLoggedIn'

/** @returns {boolean} */
export function getIsLoggedIn() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

/** @param {boolean} value */
export function setIsLoggedIn(value) {
  try {
    if (value) localStorage.setItem(STORAGE_KEY, 'true')
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

export function clearAuth() {
  setIsLoggedIn(false)
}
