"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@apollo/client"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FormField } from "@/components/ui/form-field"
import { useAuth } from "@/context/auth-context"
import { loginSchema, type LoginFormData } from "@/lib/validations/auth"
import { LOGIN_MUTATION } from "@/lib/graphql/mutations"
import type { LoginMutationResponse } from "@/types/api"
import { Loader2 } from "lucide-react"

export function LoginForm() {
  const [serverError, setServerError] = useState<string>("")
  const { login } = useAuth()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const [loginMutation] = useMutation<LoginMutationResponse>(LOGIN_MUTATION, {
    onCompleted: (data) => {
      const { user, accessToken } = data.login
      login(user, accessToken)
      router.push("/dashboard")
    },
    onError: (error) => {
      setServerError(error.message || "An error occurred during login")
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    setServerError("")

    try {
      await loginMutation({
        variables: {
          input: {
            email: data.email,
            password: data.password,
          },
        },
      })
    } catch (error) {
      // Error handled by onError callback
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {serverError && (
        <Alert variant="destructive">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <FormField
        id="email"
        label="Email Address"
        type="email"
        autoComplete="email"
        required
        error={errors.email}
        {...register("email")}
      />

      <FormField
        id="password"
        label="Password"
        type="password"
        autoComplete="current-password"
        required
        error={errors.password}
        {...register("password")}
      />

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isSubmitting ? "Signing in..." : "Sign In"}
      </Button>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          {"Don't have an account? "}
          <Link href="/register" className="font-medium text-primary hover:text-primary/80 transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </form>
  )
}
