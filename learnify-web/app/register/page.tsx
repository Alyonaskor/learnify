"use client"

import { AuthCard } from "@/components/auth/auth-card"
import { RegisterForm } from "@/components/auth/register-form"
import { useAuthRedirect } from "@/hooks/use-auth-redirect"
import { Loader2 } from "lucide-react"

export default function RegisterPage() {
  const { isLoading } = useAuthRedirect()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <AuthCard title="Create Account" description="Get started with Learnify CMS">
      <RegisterForm />
    </AuthCard>
  )
}
