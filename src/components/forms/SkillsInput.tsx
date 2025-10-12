"use client"

import React, { useState, KeyboardEvent, ChangeEvent, useEffect } from "react"
import { X, Plus } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface SkillsInputProps {
  value: string[]
  onChange: (skills: string[]) => void
  maxSkills?: number
  placeholder?: string
  suggestions?: string[]
  className?: string
  enableAutocompletedFromAPI?: boolean
}

export function SkillsInput({
  value = [],
  onChange,
  maxSkills = 20,
  placeholder = "ex: JavaScript",
  suggestions = [],
  className,
  enableAutocompletedFromAPI = true
}: SkillsInputProps) {
  const [inputValue, setInputValue] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const [apiSuggestions, setApiSuggestions] = useState<string[]>([])

  const isMaxReached = value.length >= maxSkills

  // Fetch autocomplete suggestions from API
  useEffect(() => {
    if (!enableAutocompletedFromAPI || !inputValue || inputValue.length < 2) {
      setApiSuggestions([])
      return
    }

    const fetchSuggestions = async () => {
      try {
        const params = new URLSearchParams({
          query: inputValue,
          limit: "10"
        })
        
        // Add existing skills for contextual suggestions
        if (value.length > 0) {
          params.append("existingSkills", value.join(","))
        }

        const response = await fetch(`/api/ai/suggest-skills?${params}`)
        if (response.ok) {
          const data = await response.json()
          setApiSuggestions(data.results || [])
        }
      } catch (error) {
        console.error("Failed to fetch skill suggestions:", error)
      }
    }

    // Debounce API calls
    const timeoutId = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(timeoutId)
  }, [inputValue, value, enableAutocompletedFromAPI])

  // Merge API suggestions with provided suggestions
  const allSuggestions = [...apiSuggestions, ...suggestions]
  
  // Filter suggestions based on input and existing skills
  const filteredSuggestions = allSuggestions
    .filter(s => 
      s.toLowerCase().includes(inputValue.toLowerCase()) &&
      !value.some(v => v.toLowerCase() === s.toLowerCase())
    )
    // Remove duplicates (case-insensitive)
    .filter((skill, index, arr) => 
      arr.findIndex(s => s.toLowerCase() === skill.toLowerCase()) === index
    )
    .slice(0, 10)

  const addSkill = (skill: string) => {
    const trimmedSkill = skill.trim()
    
    if (!trimmedSkill) return
    if (isMaxReached) return
    if (value.some(s => s.toLowerCase() === trimmedSkill.toLowerCase())) return

    onChange([...value, trimmedSkill])
    setInputValue("")
    setShowSuggestions(false)
    setFocusedIndex(-1)
  }

  const removeSkill = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Space or Enter to add skill
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault()
      if (focusedIndex >= 0 && filteredSuggestions[focusedIndex]) {
        addSkill(filteredSuggestions[focusedIndex])
      } else if (inputValue.trim()) {
        addSkill(inputValue)
      }
      return
    }

    // Backspace on empty input to delete last skill
    if (e.key === "Backspace" && !inputValue && value.length > 0) {
      removeSkill(value.length - 1)
      return
    }

    // Arrow navigation for suggestions
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setFocusedIndex(prev => 
        prev < filteredSuggestions.length - 1 ? prev + 1 : prev
      )
    }

    if (e.key === "ArrowUp") {
      e.preventDefault()
      setFocusedIndex(prev => prev > 0 ? prev - 1 : -1)
    }

    // Escape to close suggestions
    if (e.key === "Escape") {
      setShowSuggestions(false)
      setFocusedIndex(-1)
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    setShowSuggestions(newValue.length > 0)
    setFocusedIndex(-1)
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Skills Display with Tags */}
      <div className="relative">
        <div className={cn(
          "min-h-[120px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          "transition-all duration-200"
        )}>
          {/* Tags Container */}
          <div className="flex flex-wrap gap-2 mb-2">
            <AnimatePresence mode="popLayout">
              {value.map((skill, index) => (
                <motion.div
                  key={skill}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="group relative"
                >
                  <div className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium",
                    "bg-gradient-to-r from-pink-500/10 to-orange-500/10",
                    "border border-pink-200 dark:border-pink-500/30",
                    "text-pink-700 dark:text-pink-300",
                    "transition-all duration-200",
                    "hover:from-pink-500/20 hover:to-orange-500/20",
                    "hover:border-pink-300 dark:hover:border-pink-400/50"
                  )}>
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => removeSkill(index)}
                      className={cn(
                        "rounded-full p-0.5",
                        "hover:bg-pink-500/20 dark:hover:bg-pink-500/30",
                        "transition-colors duration-150",
                        "focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-1"
                      )}
                      aria-label={`Remove ${skill}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Input Field */}
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(inputValue.length > 0)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            disabled={isMaxReached}
            placeholder={value.length === 0 ? placeholder : ""}
            className={cn(
              "w-full bg-transparent outline-none",
              "placeholder:text-xs placeholder:text-blue-400/60 dark:placeholder:text-blue-400/40",
              isMaxReached && "cursor-not-allowed opacity-50"
            )}
            aria-label="Add skills"
            aria-describedby="skills-count"
          />
        </div>

        {/* Suggestions Dropdown */}
        <AnimatePresence>
          {showSuggestions && filteredSuggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className={cn(
                "absolute z-50 w-full mt-2 rounded-lg border border-border bg-popover shadow-lg",
                "max-h-60 overflow-y-auto"
              )}
            >
              {filteredSuggestions.map((suggestion, index) => (
                <button
                  key={suggestion}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    addSkill(suggestion)
                  }}
                  onMouseEnter={() => setFocusedIndex(index)}
                  className={cn(
                    "w-full px-4 py-2.5 text-left text-sm",
                    "transition-colors duration-150",
                    "first:rounded-t-lg last:rounded-b-lg",
                    focusedIndex === index
                      ? "bg-pink-500/10 text-pink-700 dark:text-pink-300"
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Plus className="h-3.5 w-3.5 opacity-50" />
                    <span>{suggestion}</span>
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Skills Counter */}
      <div className="flex items-center justify-between mt-2 px-1">
        <p className="text-xs text-muted-foreground">
          Press <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-muted rounded">Space</kbd> or{" "}
          <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-muted rounded">Enter</kbd> to add
        </p>
        <p
          id="skills-count"
          className={cn(
            "text-xs font-medium",
            value.length >= maxSkills - 3 && value.length < maxSkills
              ? "text-orange-500"
              : value.length >= maxSkills
              ? "text-red-500"
              : "text-muted-foreground"
          )}
        >
          {value.length}/{maxSkills} skills
        </p>
      </div>

      {/* Max Skills Warning */}
      {isMaxReached && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="text-xs text-red-500 mt-2 px-1"
        >
          Maximum number of skills reached. Remove a skill to add more.
        </motion.p>
      )}
    </div>
  )
}
