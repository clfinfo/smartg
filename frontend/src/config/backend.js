const DEFAULT_BACKEND_URL = 'http://127.0.0.1:5000'

const envUrl = import.meta.env.VITE_BACKEND_URL
  ? import.meta.env.VITE_BACKEND_URL.trim().replace(/\/$/, '')
  : ''

export const BACKEND_URL = envUrl || ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? DEFAULT_BACKEND_URL
  : '')

export const getBackendUrl = () => {
  if (!BACKEND_URL) {
    throw new Error(
      'Missing VITE_BACKEND_URL. In production, set the deployed backend base URL as VITE_BACKEND_URL, or deploy the backend in the same project so /api is available.'
    )
  }
  return BACKEND_URL
}
