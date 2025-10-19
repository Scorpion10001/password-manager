"use client"

import { useState, useEffect } from "react"
import { AuthPage } from "@/components/auth-page"
import { DashboardPage } from "@/components/dashboard-page"

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already authenticated
    const storedToken = localStorage.getItem("access_token")
    if (storedToken) {
      setToken(storedToken)
      setIsAuthenticated(true)
    }
    setLoading(false)
  }, [])

  const handleLogin = (accessToken: string) => {
    setToken(accessToken)
    setIsAuthenticated(true)
    localStorage.setItem("access_token", accessToken)
  }

  const handleLogout = () => {
    setToken(null)
    setIsAuthenticated(false)
    localStorage.removeItem("access_token")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {isAuthenticated && token ? (
        <DashboardPage token={token} onLogout={handleLogout} />
      ) : (
        <AuthPage onLogin={handleLogin} />
      )}
    </main>
  )
}
