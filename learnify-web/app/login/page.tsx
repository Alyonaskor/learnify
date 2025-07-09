"use client"

import { AuthCard } from "@/components/auth/auth-card"
import { LoginForm } from "@/components/auth/login-form"
import { useAuthRedirect } from "@/hooks/use-auth-redirect"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const { isLoading } = useAuthRedirect()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <AuthCard title="Welcome Back" description="Sign in to your Learnify CMS account">
      <LoginForm />
    </AuthCard>
  )
}
