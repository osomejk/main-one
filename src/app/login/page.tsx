"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, ArrowLeft, Loader2 } from 'lucide-react'
import { loginFeeder } from "@/lib/feeder-auth"

export default function FeederLoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error when user types
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }))
  }

  const validateForm = () => {
    let valid = true
    const newErrors = { ...errors }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
      valid = false
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
      valid = false
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
      valid = false
    }

    setErrors(newErrors)
    return valid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError("")

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const response = await loginFeeder({
        email: formData.email,
        password: formData.password,
      })

      if (response.success) {
        setSuccess(true)

        // Store authentication state in localStorage
        if (typeof window !== "undefined" && response.data) {
          localStorage.setItem("isFeederAuthenticated", "true")
          localStorage.setItem("feederToken", response.data.accessToken)
          localStorage.setItem("feederRefreshToken", response.data.refreshToken)
          localStorage.setItem("feederName", response.data.feeder.name)
        }

        // Reset form
        setFormData({
          email: "",
          password: "",
        })

        // Redirect after 2 seconds
        setTimeout(() => {
          router.push("/products")
        }, 2000)
      } else {
        throw new Error(response.message || "Failed to login")
      }
    } catch (error: any) {
      console.error("Login error:", error)
      setApiError(error.message || "An error occurred during login")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-12 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="w-full flex flex-col items-center relative mb-8">
          <Link
            href="https://evershine-two.vercel.app/"
            className="absolute left-0 top-0 inline-flex items-center text-dark hover:underline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
          <Image src="/logo.png" alt="Evershine Logo" width={150} height={90} priority className="mt-8" />
        </div>

        <Card className="w-full shadow-lg border-0">
          <CardHeader className="space-y-1 bg-[#1E40AF]/5 border-b pb-4">
            <CardTitle className="text-2xl text-center text-[#1E40AF]">Feeder Login</CardTitle>
            <CardDescription className="text-center">Login to access the feeder dashboard</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {apiError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{apiError}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription>Login successful! Redirecting to dashboard...</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading || success}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading || success}
                />
                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
              </div>

              <Button
                type="submit"
                className="w-full h-12 mt-6 bg-[#1E40AF] hover:bg-[#1E40AF]/90 text-white rounded-md text-base"
                disabled={isLoading || success}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-center">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-[#1E40AF] hover:underline">
                Register here
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </main>
  )
}
