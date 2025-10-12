"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import {
  FileText,
  Plus,
  Brain,
  Palette,
  BarChart3,
  Home,
  Search,
  Clock,
  Zap,
  Sparkles,
  Target,
} from "lucide-react"

interface Resume {
  _id: string
  name: string
  updatedAt: string
}

export function GlobalSearch() {
  const [open, setOpen] = React.useState(false)
  const [resumes, setResumes] = React.useState<Resume[]>([])
  const router = useRouter()

  // Keyboard shortcut: Cmd+K or Ctrl+K
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  // Fetch recent resumes when dialog opens
  React.useEffect(() => {
    if (open) {
      fetchRecentResumes()
    }
  }, [open])

  const fetchRecentResumes = async () => {
    try {
      const response = await fetch('/api/resumes')
      if (response.ok) {
        const result = await response.json()
        // API returns { success: true, data: resumes, meta: {...} }
        const resumes = result.data || []
        setResumes(resumes.slice(0, 5)) // Get 5 most recent
      }
    } catch (error) {
      console.error('Error fetching resumes:', error)
    }
  }

  const handleSelect = (callback: () => void) => {
    setOpen(false)
    callback()
  }

  return (
    <>
      {/* Search trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="relative w-full md:w-64 flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-800/50 px-3 py-2 text-sm text-neutral-400 hover:bg-neutral-800 hover:text-neutral-300 transition-colors"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">Search...</span>
        <kbd className="pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-neutral-600 bg-neutral-900 px-1.5 font-mono text-xs font-medium text-neutral-400">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          {/* Quick Actions */}
          <CommandGroup heading="Quick Actions">
            <CommandItem onSelect={() => handleSelect(() => router.push('/dashboard/resumes/create'))}>
              <Plus className="mr-2 h-4 w-4" />
              <span>Create New Resume</span>
              <CommandShortcut>⌘N</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => handleSelect(() => router.push('/dashboard/ai-studio'))}>
              <Brain className="mr-2 h-4 w-4" />
              <span>Open AI Studio</span>
            </CommandItem>
            <CommandItem onSelect={() => handleSelect(() => router.push('/dashboard/templates'))}>
              <Palette className="mr-2 h-4 w-4" />
              <span>Browse Templates</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          {/* Navigation */}
          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => handleSelect(() => router.push('/dashboard'))}>
              <Home className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
              <CommandShortcut>⌘H</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => handleSelect(() => router.push('/dashboard/resumes'))}>
              <FileText className="mr-2 h-4 w-4" />
              <span>All Resumes</span>
              <CommandShortcut>⌘R</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => handleSelect(() => router.push('/dashboard/analytics'))}>
              <BarChart3 className="mr-2 h-4 w-4" />
              <span>Analytics</span>
            </CommandItem>
          </CommandGroup>

          {/* Recent Resumes */}
          {resumes.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Recent Resumes">
                {resumes.map((resume) => (
                  <CommandItem
                    key={resume._id}
                    onSelect={() => handleSelect(() => router.push(`/dashboard/resumes/${resume._id}/edit`))}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    <span className="flex-1 truncate">{resume.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(resume.updatedAt).toLocaleDateString()}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          <CommandSeparator />

          {/* AI Features */}
          <CommandGroup heading="AI Features">
            <CommandItem onSelect={() => handleSelect(() => router.push('/dashboard/ai-studio/content-gen'))}>
              <Sparkles className="mr-2 h-4 w-4" />
              <span>Content Generator</span>
            </CommandItem>
            <CommandItem onSelect={() => handleSelect(() => router.push('/dashboard/ai-studio/ats-optimizer'))}>
              <Target className="mr-2 h-4 w-4" />
              <span>ATS Optimizer</span>
            </CommandItem>
            <CommandItem onSelect={() => handleSelect(() => router.push('/dashboard/ai-studio/job-matcher'))}>
              <Zap className="mr-2 h-4 w-4" />
              <span>Job Matcher</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
