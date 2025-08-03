// frontend/src/api.js
import axios from 'axios'

// Get the backend URL from environment variables or use default
const getBackendURL = () => {
  // For Vite (if using Vite)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }

  // For Create React App (if using CRA)
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL
  }

  // Default URLs based on environment
  if (process.env.NODE_ENV === 'production') {
    // IMPORTANT: REPLACE THIS WITH YOUR ACTUAL RENDER BACKEND URL
    return 'https://shared-notes-backend.onrender.com' // <--- UPDATE THIS LINE - 
  }

  // Local development
  return 'http://localhost:5001' // Assuming your local backend runs on 5000
}

// Create axios instance with your backend URL
const api = axios.create({
  baseURL: getBackendURL(),
  timeout: 45000, // Increased timeout for Render cold starts
  headers: {
    'Content-Type': 'application/json',
  }
})

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    // Check sessionStorage first (current session), then localStorage (fallback)
    const token = sessionStorage.getItem('token') || localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        fullURL: `${config.baseURL}${config.url}`,
        hasToken: !!token
      })
    }

    return config
  },
  (error) => {
    console.error('Request interceptor error:', error)
    return Promise.reject(error)
  })

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('API Response:', {
        status: response.status,
        url: response.config.url
      })
    }
    return response
  },
  (error) => {
    // Enhanced error logging
    console.error('API Error Details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      fullURL: error.config ? `${error.config.baseURL}${error.config.url}` : 'Unknown',
      code: error.code,
      network: error.code === 'ERR_NETWORK' ? 'Network Error - Backend might be down' : 'Not a network error'
    })

    if (error.response?.status === 401) {
      // Token expired or invalid - clear both storage locations
      sessionStorage.removeItem('token')
      localStorage.removeItem('token')
      // Force reload to show login modal
      if (window.location.pathname !== '/') {
        window.location.href = '/'
      }
    }

    return Promise.reject(error)
  })

// Export both the api instance and the backend URL for debugging
export { getBackendURL }
export default api