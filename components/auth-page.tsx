"use client"

import { useState } from "react"
import { LoginForm } from "./auth/login-form"
import { RegisterForm } from "./auth/register-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface AuthPageProps {
  onLogin: (token: string) => void
}

export function AuthPage({ onLogin }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl text-center">{isLogin ? "Welcome Back" : "Create Account"}</CardTitle>
          <CardDescription className="text-center">
            {isLogin ? "Sign in to your password manager" : "Create a new account to get started"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLogin ? <LoginForm onLogin={onLogin} /> : <RegisterForm onLogin={onLogin} />}
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
            </span>
            <button onClick={() => setIsLogin(!isLogin)} className="text-primary hover:underline font-medium">
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
