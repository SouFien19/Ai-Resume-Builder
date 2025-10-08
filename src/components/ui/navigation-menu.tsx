"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export function NavigationMenu({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center", className)} {...props} />
}

export function NavigationMenuList({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) {
  return <ul className={cn("flex items-center", className)} {...props} />
}

export function NavigationMenuItem({ className, ...props }: React.LiHTMLAttributes<HTMLLIElement>) {
  return <li className={cn("list-none", className)} {...props} />
}

export function NavigationMenuLink({ className, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a className={cn("inline-flex items-center", className)} {...props} />
}
