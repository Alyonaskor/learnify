"use client"

import type React from "react"
import { ApolloProvider } from "@apollo/client"
import { AuthProvider } from "@/context/auth-context"
import { apolloClient } from "@/lib/apollo-client"

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ApolloProvider client={apolloClient}>
      <AuthProvider>{children}</AuthProvider>
    </ApolloProvider>
  )
}
