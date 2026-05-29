import { createContext, useContext, useState, useEffect } from 'react'
import { getBackendUrl } from '../config/backend'

const AuthContext = createContext(null)

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

const BACKEND = getBackendUrl()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('smartcity_user')
    if (stored) {
      try { setUser(JSON.parse(stored)) } catch { }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const res = await fetch(`${BACKEND}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      // 💡 FIX: This handles cases where the server might return a non-JSON error page
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned non-JSON response. Check if backend is running.");
      }

      const data = await res.json()
      if (!data.success) throw new Error(data.message || 'Login failed')
      
      const userData = {
        ...data.user,
        token: data.token,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.email}`,
      }
      
      setUser(userData)
      localStorage.setItem('smartcity_user', JSON.stringify(userData))
      localStorage.setItem('smartcity_token', data.token)

      // Backend NodeMailer handles the email alert via authController.js automatically

      return userData


    } catch (err) {
      throw err
    }
  }

  const register = async (name, email, password, role) => {
    try {
      const res = await fetch(`${BACKEND}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });
      
      if (!res.ok) {
        throw new Error("Server Error or Bad Request");
      }
      
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Registration failed');
      
      const userData = {
        ...data.user,
        token: data.token,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.email}`,
      }
      
      setUser(userData)
      localStorage.setItem('smartcity_user', JSON.stringify(userData))
      localStorage.setItem('smartcity_token', data.token)
      return userData
    } catch (err) {
      throw err
    }
  }

  const googleLogin = async (payload) => {
    try {
      const res = await fetch(`${BACKEND}/api/auth/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message || 'Google login failed')
      
      const userData = {
        ...data.user,
        token: data.token,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.email}`,
      }
      
      setUser(userData)
      localStorage.setItem('smartcity_user', JSON.stringify(userData))
      localStorage.setItem('smartcity_token', data.token)
      return userData
    } catch (err) {
      throw err
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('smartcity_user')
    localStorage.removeItem('smartcity_token')
  }

  const updateUser = (data) => {
    const updated = { ...user, ...data }
    setUser(updated)
    localStorage.setItem('smartcity_user', JSON.stringify(updated))
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, googleLogin, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}
