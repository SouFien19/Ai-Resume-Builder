"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Sidebar as UISidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { 
  LayoutDashboard, 
  FileText, 
  Brain, 
  BarChart3, 
  Palette, 
  Settings,
  ChevronRight,
  Plus,
  Search,
  User
} from "lucide-react"
import { SiReactiveresume } from "react-icons/si"
import { Button } from "@/components/ui/button"

// Navigation data structure following shadcn.io patterns
const navigationData = {
  user: {
    name: "John Doe",
    email: "john@example.com",
    avatar: "/avatars/john-doe.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "Resumes",
      url: "/dashboard/resumes", 
      icon: FileText,
      badge: "3",
    },
    {
      title: "AI Studio",
      url: "/dashboard/ai-studio",
      icon: Brain,
      badge: "Pro",
    },
    {
      title: "Templates",
      url: "/dashboard/templates",
      icon: Palette,
    },
    {
      title: "Analytics", 
      url: "/dashboard/analytics",
      icon: BarChart3,
    },
  ],
  projects: [
    {
      name: "Software Engineer Resume",
      url: "#",
      icon: FileText,
    },
    {
      name: "Marketing Manager CV", 
      url: "#",
      icon: FileText,
    },
    {
      name: "Designer Portfolio",
      url: "#", 
      icon: FileText,
    },
  ],
}

export default function AppSidebar() {
  const pathname = usePathname()

  return (
    <UISidebar collapsible="icon" className="h-full border-r">
      {/* Header */}
      <SidebarHeader className="gap-3.5 border-b p-4">
        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <SiReactiveresume className="size-4" />
        </div>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-semibold">ResumeCraft</span>
          <span className="truncate text-xs text-sidebar-foreground/70">AI Resume Builder</span>
        </div>
        <Button variant="ghost" size="icon" className="ml-auto size-7">
          <Search className="size-4" />
        </Button>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent className="flex-1 overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarMenu>
            {navigationData.navMain.map((item) => {
              const isActive = pathname === item.url || pathname?.startsWith(item.url + "/")
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    tooltip={item.title}
                    isActive={isActive}
                    className="px-2.5 py-2"
                  >
                    <Link href={item.url} className="flex items-center">
                      <item.icon className="mr-2 size-4" />
                      <span>{item.title}</span>
                      {item.badge && (
                        <span className={cn(
                          "ml-auto inline-flex h-5 items-center justify-center rounded px-2 text-xs font-medium",
                          item.badge === "Pro" 
                            ? "bg-orange-100 text-orange-600" 
                            : "bg-sidebar-accent text-sidebar-accent-foreground"
                        )}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup className="group-data-[collapsible=true]:hidden">
          <SidebarGroupLabel>Recent Projects</SidebarGroupLabel>
          <SidebarMenu>
            {navigationData.projects.map((item) => (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton asChild>
                  <a href={item.url} className="font-medium">
                    <item.icon className="mr-2 size-4" />
                    {item.name}
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            <SidebarMenuItem>
              <SidebarMenuButton className="text-sidebar-foreground/70">
                <Plus className="mr-2 size-4" />
                More projects
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="gap-2 border-t p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-accent text-sidebar-accent-foreground">
                <User className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{navigationData.user.name}</span>
                <span className="truncate text-xs">{navigationData.user.email}</span>
              </div>
              <ChevronRight className="ml-auto size-4" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </UISidebar>
  )
}
