"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"
import type { User, AuthState } from "@/types/auth"

interface AuthContextType extends AuthState {
  login: (user: User, accessToken: string) => void
  logout: () => void
  setLoading: (loading: boolean) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

type AuthAction =
  | { type: "LOGIN"; payload: { user: User; accessToken: string } }
  | { type: "LOGOUT" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "INITIALIZE"; payload: { user: User | null; accessToken: string | null } }

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        isAuthenticated: true,
        isLoading: false,
      }
    case "LOGOUT":
      return {
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
      }
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      }
    case "INITIALIZE":
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        isAuthenticated: !!action.payload.accessToken,
        isLoading: false,
      }
    default:
      return state
  }
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    // Initialize auth state from localStorage
    const accessToken = localStorage.getItem("accessToken")
    const userStr = localStorage.getItem("user")

    let user: User | null = null
    if (userStr) {
      try {
        user = JSON.parse(userStr)
      } catch (error) {
        console.error("Failed to parse user from localStorage:", error)
        localStorage.removeItem("user")
      }
    }

    dispatch({ type: "INITIALIZE", payload: { user, accessToken } })
  }, [])

  const login = (user: User, accessToken: string) => {
    localStorage.setItem("accessToken", accessToken)
    localStorage.setItem("user", JSON.stringify(user))
    dispatch({ type: "LOGIN", payload: { user, accessToken } })
  }

  const logout = () => {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("user")
    dispatch({ type: "LOGOUT" })
  }

  const setLoading = (loading: boolean) => {
    dispatch({ type: "SET_LOADING", payload: loading })
  }

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    setLoading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
