"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"

interface BreadcrumbItem {
  label: string
  href: string
}

// Map route segments to friendly names
const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  resumes: "Resumes",
  "ai-studio": "AI Studio",
  templates: "Templates",
  analytics: "Analytics",
  settings: "Settings",
  edit: "Edit",
  preview: "Preview",
  create: "Create New",
  "content-gen": "Content Generator",
  "ats-optimizer": "ATS Optimizer",
  "job-matcher": "Job Matcher",
  "cover-letter": "Cover Letter",
  career: "Career Path",
}

export function Breadcrumb() {
  const pathname = usePathname()
  
  // Build breadcrumb items from pathname
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    if (!pathname) return []
    const segments = pathname.split("/").filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = []
    
    let currentPath = ""
    
    segments.forEach((segment) => {
      currentPath += `/${segment}`
      
      // Skip MongoDB ObjectIDs (24 hex characters)
      if (segment.match(/^[0-9a-f]{24}$/i)) {
        return
      }
      
      const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
      breadcrumbs.push({
        label,
        href: currentPath,
      })
    })
    
    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs()

  // Don't show breadcrumbs on dashboard home
  if (pathname === "/dashboard" || breadcrumbs.length === 0) {
    return null
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
      <Link 
        href="/dashboard" 
        className="flex items-center gap-1 hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
        <span className="sr-only sm:not-sr-only">Home</span>
      </Link>
      
      {breadcrumbs.map((item, index) => {
        const isLast = index === breadcrumbs.length - 1
        
        return (
          <React.Fragment key={item.href}>
            <ChevronRight className="h-4 w-4" />
            {isLast ? (
              <span className="font-medium text-foreground">{item.label}</span>
            ) : (
              <Link
                href={item.href}
                className="hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}
