"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export function Avatar({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("relative inline-flex h-10 w-10 overflow-hidden rounded-full bg-muted", className)} {...props} />
}

export function AvatarImage({ alt = "", ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
  return <img alt={alt} className="h-full w-full object-cover" {...props} />
}

export function AvatarFallback({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("flex h-full w-full items-center justify-center text-xs font-medium", className)} {...props} />
}

export { Avatar as default }
