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
import { registerSchema, type RegisterFormData } from "@/lib/validations/auth"
import { REGISTER_MUTATION } from "@/lib/graphql/mutations"
import type { RegisterMutationResponse } from "@/types/api"
import { Loader2 } from "lucide-react"

export function RegisterForm() {
  const [serverError, setServerError] = useState<string>("")
  const { login } = useAuth()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const [registerMutation] = useMutation<RegisterMutationResponse>(REGISTER_MUTATION, {
    onCompleted: (data) => {
      const { user, accessToken } = data.register
      login(user, accessToken)
      router.push("/dashboard")
    },
    onError: (error) => {
      setServerError(error.message || "An error occurred during registration")
    },
  })

  const onSubmit = async (data: RegisterFormData) => {
    setServerError("")

    try {
      await registerMutation({
        variables: {
          input: {
            fullName: data.fullName,
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
        id="fullName"
        label="Full Name"
        type="text"
        autoComplete="name"
        required
        error={errors.fullName}
        {...register("fullName")}
      />

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
        autoComplete="new-password"
        required
        error={errors.password}
        {...register("password")}
      />

      <FormField
        id="confirmPassword"
        label="Confirm Password"
        type="password"
        autoComplete="new-password"
        required
        error={errors.confirmPassword}
        {...register("confirmPassword")}
      />

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isSubmitting ? "Creating account..." : "Create Account"}
      </Button>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:text-primary/80 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </form>
  )
}
