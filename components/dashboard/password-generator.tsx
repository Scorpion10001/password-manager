"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Copy, RefreshCw } from "lucide-react"

interface PasswordGeneratorProps {
  token: string
}

export function PasswordGenerator({ token }: PasswordGeneratorProps) {
  const [length, setLength] = useState(16)
  const [useUppercase, setUseUppercase] = useState(true)
  const [useLowercase, setUseLowercase] = useState(true)
  const [useDigits, setUseDigits] = useState(true)
  const [useSpecial, setUseSpecial] = useState(true)
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false)
  const [generatedPassword, setGeneratedPassword] = useState("")
  const [strength, setStrength] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const generatePassword = async () => {
    setLoading(true)
    try {
      const response = await fetch("http://localhost:5000/api/passwords/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          length,
          use_uppercase: useUppercase,
          use_lowercase: useLowercase,
          use_digits: useDigits,
          use_special: useSpecial,
          exclude_ambiguous: excludeAmbiguous,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setGeneratedPassword(data.password)
        setStrength(data.strength)
      }
    } catch (err) {
      console.error("Failed to generate password:", err)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPassword)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="length">Password Length: {length}</Label>
          <Input
            id="length"
            type="range"
            min="8"
            max="128"
            value={length}
            onChange={(e) => setLength(Number.parseInt(e.target.value))}
            className="cursor-pointer"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Checkbox
              id="uppercase"
              checked={useUppercase}
              onCheckedChange={(checked) => setUseUppercase(checked as boolean)}
            />
            <Label htmlFor="uppercase" className="cursor-pointer">
              Uppercase Letters (A-Z)
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="lowercase"
              checked={useLowercase}
              onCheckedChange={(checked) => setUseLowercase(checked as boolean)}
            />
            <Label htmlFor="lowercase" className="cursor-pointer">
              Lowercase Letters (a-z)
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="digits" checked={useDigits} onCheckedChange={(checked) => setUseDigits(checked as boolean)} />
            <Label htmlFor="digits" className="cursor-pointer">
              Numbers (0-9)
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="special"
              checked={useSpecial}
              onCheckedChange={(checked) => setUseSpecial(checked as boolean)}
            />
            <Label htmlFor="special" className="cursor-pointer">
              Special Characters (!@#$%^&*)
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="ambiguous"
              checked={excludeAmbiguous}
              onCheckedChange={(checked) => setExcludeAmbiguous(checked as boolean)}
            />
            <Label htmlFor="ambiguous" className="cursor-pointer">
              Exclude Ambiguous Characters (i, l, 1, O, 0)
            </Label>
          </div>
        </div>

        <Button onClick={generatePassword} className="w-full" disabled={loading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          {loading ? "Generating..." : "Generate Password"}
        </Button>
      </div>

      {generatedPassword && (
        <div className="space-y-3 p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <Input type="text" value={generatedPassword} readOnly className="font-mono" />
            <Button size="sm" variant="outline" onClick={copyToClipboard}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          {strength && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-background rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      strength.color === "red"
                        ? "bg-red-500"
                        : strength.color === "orange"
                          ? "bg-orange-500"
                          : strength.color === "yellow"
                            ? "bg-yellow-500"
                            : strength.color === "lime"
                              ? "bg-lime-500"
                              : "bg-green-500"
                    }`}
                    style={{ width: `${strength.percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{strength.strength}</span>
              </div>
              {strength.crack_time && (
                <p className="text-xs text-muted-foreground">Estimated crack time: {strength.crack_time.time}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
