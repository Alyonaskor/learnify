import type { AuthResponse } from "./auth" // Assuming AuthResponse is declared in another file, e.g., auth.ts

export interface GraphQLError {
  message: string
  extensions?: {
    code: string
    [key: string]: any
  }
}

export interface GraphQLResponse<T> {
  data?: T
  errors?: GraphQLError[]
}

export interface LoginMutationResponse {
  login: AuthResponse
}

export interface RegisterMutationResponse {
  register: AuthResponse
}
