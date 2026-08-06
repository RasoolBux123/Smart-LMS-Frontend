'use client'

import { createContext, useState, useEffect, ReactNode } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'instructor' | 'student'
  status?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, role?: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        const response = await axios.get(`${API_URL}/auth/me`)
        const userData = response.data.data
        setUser(userData)
        // Set cookie for middleware with role
        document.cookie = `token=${token}; path=/; max-age=604800`
        document.cookie = `role=${userData.role}; path=/; max-age=604800`
      }
    } catch (error) {
      console.error('❌ Auth check failed:', error)
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      document.cookie = 'role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const formData = new FormData()
      formData.append('username', email)
      formData.append('password', password)
      
      const response = await axios.post(`${API_URL}/auth/login`, formData)
      const { token, user } = response.data.data
      
      localStorage.setItem('token', token)
      document.cookie = `token=${token}; path=/; max-age=604800`
      document.cookie = `role=${user.role}; path=/; max-age=604800`
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      setUser(user)
      toast.success(`Welcome ${user.name}!`)
      
      // Redirect to role dashboard
      window.location.href = `/${user.role}`
    } catch (error: any) {
      console.error('❌ Login error:', error)
      const message = error.response?.data?.detail || error.message || 'Login failed'
      toast.error(message)
      throw error
    }
  }

  const register = async (name: string, email: string, password: string, role?: string) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        name,
        email,
        password,
        role: role || 'student'
      })
      const { token, user } = response.data.data
      
      localStorage.setItem('token', token)
      document.cookie = `token=${token}; path=/; max-age=604800`
      document.cookie = `role=${user.role}; path=/; max-age=604800`
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      setUser(user)
      toast.success('Account created!')
      window.location.href = `/${user.role}`
    } catch (error: any) {
      console.error('❌ Register error:', error)
      const message = error.response?.data?.detail || error.message || 'Registration failed'
      toast.error(message)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    document.cookie = 'role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    setUser(null)
    toast.success('Logged out')
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}