"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PasswordStrengthIndicator } from "./password-strength-indicator"

interface AddPasswordFormProps {
  token: string
  onPasswordAdded: () => void
}

export function AddPasswordForm({ token, onPasswordAdded }: AddPasswordFormProps) {
  const [serviceName, setServiceName] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [url, setUrl] = useState("")
  const [notes, setNotes] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("http://localhost:5000/api/passwords", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          service_name: serviceName,
          username,
          password,
          url: url || undefined,
          notes: notes || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to add password")
        return
      }

      // Reset form
      setServiceName("")
      setUsername("")
      setPassword("")
      setUrl("")
      setNotes("")
      onPasswordAdded()
    } catch (err) {
      setError("Failed to connect to server")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="serviceName">Service Name *</Label>
        <Input
          id="serviceName"
          placeholder="e.g., Gmail, GitHub, Netflix"
          value={serviceName}
          onChange={(e) => setServiceName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">Username *</Label>
        <Input
          id="username"
          placeholder="Enter username or email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password *</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {password && <PasswordStrengthIndicator password={password} />}
      </div>

      <div className="space-y-2">
        <Label htmlFor="url">Website URL (optional)</Label>
        <Input
          id="url"
          type="url"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          placeholder="Add any notes about this password"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Adding password..." : "Add Password"}
      </Button>
    </form>
  )
}
