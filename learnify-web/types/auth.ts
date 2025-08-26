export interface User {
  id: string
  email: string
  name?: string | null
  createdAt: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  name: string
  email: string
  password: string
  confirmPassword: string
}

// Так как токен мы не возвращаем на фронт, AuthResponse содержит только user
export interface AuthResponse {
  user: User
}