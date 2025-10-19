"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Eye, EyeOff, Copy, Trash2 } from "lucide-react"

interface Password {
  id: number
  service_name: string
  username: string
  url?: string
  notes?: string
}

interface PasswordListProps {
  passwords: Password[]
  token: string
  onPasswordDeleted: () => void
}

export function PasswordList({ passwords, token, onPasswordDeleted }: PasswordListProps) {
  const [visiblePasswords, setVisiblePasswords] = useState<Set<number>>(new Set())
  const [decryptedPasswords, setDecryptedPasswords] = useState<Record<number, string>>({})

  const togglePasswordVisibility = async (id: number) => {
    if (visiblePasswords.has(id)) {
      setVisiblePasswords((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    } else {
      // Fetch decrypted password
      try {
        const response = await fetch(`http://localhost:5000/api/passwords/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.ok) {
          const data = await response.json()
          setDecryptedPasswords((prev) => ({
            ...prev,
            [id]: data.password,
          }))
          setVisiblePasswords((prev) => new Set(prev).add(id))
        }
      } catch (err) {
        console.error("Failed to fetch password:", err)
      }
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const deletePassword = async (id: number) => {
    if (!confirm("Are you sure you want to delete this password?")) return

    try {
      const response = await fetch(`http://localhost:5000/api/passwords/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        onPasswordDeleted()
      }
    } catch (err) {
      console.error("Failed to delete password:", err)
    }
  }

  return (
    <div className="space-y-3">
      {passwords.map((pwd) => (
        <Card key={pwd.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">{pwd.service_name}</h3>
                <p className="text-sm text-muted-foreground truncate">{pwd.username}</p>
                {pwd.url && <p className="text-xs text-muted-foreground truncate mt-1">{pwd.url}</p>}
                {pwd.notes && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{pwd.notes}</p>}
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button size="sm" variant="ghost" onClick={() => togglePasswordVisibility(pwd.id)}>
                  {visiblePasswords.has(pwd.id) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                {visiblePasswords.has(pwd.id) && (
                  <Button size="sm" variant="ghost" onClick={() => copyToClipboard(decryptedPasswords[pwd.id])}>
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => deletePassword(pwd.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
            {visiblePasswords.has(pwd.id) && (
              <div className="mt-3 p-2 bg-muted rounded text-sm font-mono break-all">{decryptedPasswords[pwd.id]}</div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
