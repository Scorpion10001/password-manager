"use client"

import { useEffect, useState } from "react"

interface PasswordStrengthIndicatorProps {
  password: string
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const [strength, setStrength] = useState<any>(null)

  useEffect(() => {
    const checkStrength = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/passwords/strength", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        })

        if (response.ok) {
          const data = await response.json()
          setStrength(data.strength)
        }
      } catch (err) {
        console.error("Failed to check strength:", err)
      }
    }

    checkStrength()
  }, [password])

  if (!strength) return null

  const colorMap: Record<string, string> = {
    red: "bg-red-500",
    orange: "bg-orange-500",
    yellow: "bg-yellow-500",
    lime: "bg-lime-500",
    green: "bg-green-500",
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full ${colorMap[strength.color] || "bg-gray-500"}`}
            style={{ width: `${strength.percentage}%` }}
          ></div>
        </div>
        <span className="text-sm font-medium text-foreground">{strength.strength}</span>
      </div>
      {strength.feedback.length > 0 && (
        <ul className="text-xs text-muted-foreground space-y-1">
          {strength.feedback.map((item: string, idx: number) => (
            <li key={idx}>• {item}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
