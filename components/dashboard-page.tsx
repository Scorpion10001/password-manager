"use client"

import { useState, useEffect } from "react"
import { PasswordList } from "./dashboard/password-list"
import { AddPasswordForm } from "./dashboard/add-password-form"
import { PasswordGenerator } from "./dashboard/password-generator"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface DashboardPageProps {
  token: string
  onLogout: () => void
}

export function DashboardPage({ token, onLogout }: DashboardPageProps) {
  const [passwords, setPasswords] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    fetchPasswords()
  }, [refreshTrigger])

  const fetchPasswords = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/passwords", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setPasswords(data)
      }
    } catch (err) {
      console.error("Failed to fetch passwords:", err)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordAdded = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  const handlePasswordDeleted = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Password Manager</h1>
          <Button variant="outline" onClick={onLogout}>
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="passwords" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="passwords">My Passwords</TabsTrigger>
            <TabsTrigger value="add">Add Password</TabsTrigger>
            <TabsTrigger value="generate">Generate</TabsTrigger>
          </TabsList>

          <TabsContent value="passwords" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Saved Passwords</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  </div>
                ) : passwords.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No passwords saved yet. Add one to get started!
                  </p>
                ) : (
                  <PasswordList passwords={passwords} token={token} onPasswordDeleted={handlePasswordDeleted} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="add" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Add New Password</CardTitle>
              </CardHeader>
              <CardContent>
                <AddPasswordForm token={token} onPasswordAdded={handlePasswordAdded} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="generate" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Password Generator</CardTitle>
              </CardHeader>
              <CardContent>
                <PasswordGenerator token={token} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
