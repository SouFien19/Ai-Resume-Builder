"use client"

import React from "react"
import { CheckCircle2, XCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { PasswordInput } from "./PasswordInput"

interface PasswordConfirmationProps {
  password: string
  confirmPassword: string
  onPasswordChange: (value: string) => void
  onConfirmPasswordChange: (value: string) => void
  passwordPlaceholder?: string
  confirmPlaceholder?: string
  className?: string
  showStrengthMeter?: boolean
  showCriteria?: boolean
}

export function PasswordConfirmation({
  password,
  confirmPassword,
  onPasswordChange,
  onConfirmPasswordChange,
  passwordPlaceholder = "Enter your password",
  confirmPlaceholder = "Confirm your password",
  className,
  showStrengthMeter = true,
  showCriteria = true
}: PasswordConfirmationProps) {
  const passwordsMatch = password && confirmPassword && password === confirmPassword
  const showMatchIndicator = confirmPassword.length > 0

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Password Input */}
      <div>
        <label className="text-sm font-medium mb-2 block">Password</label>
        <PasswordInput
          value={password}
          onChange={onPasswordChange}
          placeholder={passwordPlaceholder}
          showStrengthMeter={showStrengthMeter}
          showCriteria={showCriteria}
        />
      </div>

      {/* Confirm Password Input */}
      <div>
        <label className="text-sm font-medium mb-2 block">Confirm Password</label>
        <div className="relative">
          <PasswordInput
            value={confirmPassword}
            onChange={onConfirmPasswordChange}
            placeholder={confirmPlaceholder}
            showStrengthMeter={false}
            showCriteria={false}
          />
          
          {/* Match Indicator */}
          <AnimatePresence>
            {showMatchIndicator && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute right-10 top-1/2 -translate-y-1/2"
              >
                {passwordsMatch ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Match Status Message */}
        <AnimatePresence>
          {showMatchIndicator && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={cn(
                "text-xs mt-2 flex items-center gap-1.5",
                passwordsMatch ? "text-green-600 dark:text-green-400" : "text-red-500"
              )}
            >
              {passwordsMatch ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Passwords match
                </>
              ) : (
                <>
                  <XCircle className="h-3.5 w-3.5" />
                  Passwords do not match
                </>
              )}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
