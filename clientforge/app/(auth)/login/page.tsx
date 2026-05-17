import { Suspense } from "react"
import type { Metadata } from "next"
import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = { title: "Sign In — ClientForge" }

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Welcome back</h1>
        <p className="text-gray-400 text-sm">Sign in to your ClientForge account</p>
      </div>
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  )
}
