"use client"

import React, { useState, useMemo } from "react"
import { Eye, EyeOff, CheckCircle2, XCircle, Shield } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

interface PasswordInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  showStrengthMeter?: boolean
  showCriteria?: boolean
}

interface PasswordCriterion {
  label: string
  test: (password: string) => boolean
  met: boolean
}

const commonPasswords = [
  "password",
  "12345678",
  "qwerty",
  "abc123",
  "letmein",
  "welcome",
  "monkey",
  "dragon",
  "master",
  "123456789"
]

export function PasswordInput({
  value,
  onChange,
  placeholder = "Enter your password",
  className,
  showStrengthMeter = true,
  showCriteria = true
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)

  const criteria = useMemo<PasswordCriterion[]>(() => {
    return [
      {
        label: "At least 8 characters",
        test: (p) => p.length >= 8,
        met: value.length >= 8
      },
      {
        label: "Contains uppercase letter",
        test: (p) => /[A-Z]/.test(p),
        met: /[A-Z]/.test(value)
      },
      {
        label: "Contains lowercase letter",
        test: (p) => /[a-z]/.test(p),
        met: /[a-z]/.test(value)
      },
      {
        label: "Contains number",
        test: (p) => /[0-9]/.test(p),
        met: /[0-9]/.test(value)
      },
      {
        label: "Contains special character",
        test: (p) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p),
        met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)
      }
    ]
  }, [value])

  const strength = useMemo(() => {
    if (!value) return { level: "none", score: 0, color: "bg-neutral-300", label: "" }

    const metCriteria = criteria.filter(c => c.met).length
    const isCommon = commonPasswords.some(p => value.toLowerCase().includes(p))

    if (isCommon) {
      return {
        level: "weak",
        score: 1,
        color: "bg-red-500",
        label: "Weak (Common password)"
      }
    }

    if (metCriteria <= 2) {
      return { level: "weak", score: 1, color: "bg-red-500", label: "Weak" }
    }

    if (metCriteria === 3 || metCriteria === 4) {
      return { level: "medium", score: 2, color: "bg-yellow-500", label: "Medium" }
    }

    if (metCriteria === 5 && value.length >= 12) {
      return { level: "strong", score: 3, color: "bg-green-500", label: "Strong" }
    }

    return { level: "medium", score: 2, color: "bg-yellow-500", label: "Medium" }
  }, [value, criteria])

  return (
    <div className={cn("w-full space-y-3", className)}>
      {/* Password Input Field */}
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pr-10"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2",
            "text-muted-foreground hover:text-foreground",
            "transition-colors duration-150",
            "focus:outline-none"
          )}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Strength Meter */}
      {showStrengthMeter && value && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">
                Password Strength:
              </span>
            </div>
            <span
              className={cn(
                "text-xs font-semibold",
                strength.level === "weak" && "text-red-500",
                strength.level === "medium" && "text-yellow-500",
                strength.level === "strong" && "text-green-500"
              )}
            >
              {strength.label}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="flex gap-1 h-1.5">
            {[1, 2, 3].map((bar) => (
              <motion.div
                key={bar}
                className={cn(
                  "flex-1 rounded-full transition-colors duration-300",
                  bar <= strength.score ? strength.color : "bg-neutral-200 dark:bg-neutral-700"
                )}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.3, delay: bar * 0.05 }}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Criteria Checklist */}
      {showCriteria && value && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-1.5"
        >
          {criteria.map((criterion, index) => (
            <motion.div
              key={criterion.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * index }}
              className="flex items-center gap-2"
            >
              {criterion.met ? (
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
              ) : (
                <XCircle className="h-4 w-4 text-neutral-400 flex-shrink-0" />
              )}
              <span
                className={cn(
                  "text-xs transition-colors duration-150",
                  criterion.met
                    ? "text-green-600 dark:text-green-400 font-medium"
                    : "text-muted-foreground"
                )}
              >
                {criterion.label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
