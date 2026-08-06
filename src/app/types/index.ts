export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'instructor' | 'student'
  status?: 'active' | 'inactive'
  last_login_at?: string
  created_at?: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  errors?: string[]
}

export interface AuthResponse {
  success: boolean
  data: {
    user: User
    token: string
  }
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  name: string
  email: string
  password: string
  role?: string
}