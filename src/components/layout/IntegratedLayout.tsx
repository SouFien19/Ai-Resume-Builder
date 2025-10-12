"use client"
import * as React from "react"
import Link from "next/link"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { Button } from "@/components/ui/button"
import { 
  Home, 
  BarChart3, 
  PanelLeftClose,
  Menu,
  FileText,
  BrainCircuit,
  Target,
  Sparkles,
  ChevronRight,
  X,
  Clock
} from "lucide-react"
import { cn } from "@/lib/utils"
import { UserButton, useUser } from "@clerk/nextjs"
import { SiReactiveresume } from "react-icons/si"
import { usePathname } from "next/navigation"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ModeToggle } from "@/components/ui/mode-toggle"
import { GlobalSearch } from "@/components/shared/GlobalSearch"
import { Breadcrumb } from "@/components/shared/Breadcrumb"
import { motion, AnimatePresence } from "framer-motion"

// Optimized Particle Background with CSS animations
const SidebarParticles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <style jsx>{`
        @keyframes float-1 {
          0%, 100% { transform: translate(0, 0); opacity: 0; }
          50% { opacity: 0.3; }
          100% { transform: translate(20px, -100px); }
        }
        @keyframes float-2 {
          0%, 100% { transform: translate(0, 0); opacity: 0; }
          50% { opacity: 0.25; }
          100% { transform: translate(-15px, -120px); }
        }
        @keyframes float-3 {
          0%, 100% { transform: translate(0, 0); opacity: 0; }
          50% { opacity: 0.2; }
          100% { transform: translate(10px, -90px); }
        }
        .particle {
          position: absolute;
          border-radius: 50%;
          background: linear-gradient(to right, rgba(236, 72, 153, 0.1), rgba(251, 146, 60, 0.1));
        }
        .particle-1 { left: 10%; top: 20%; width: 2px; height: 2px; animation: float-1 15s infinite; }
        .particle-2 { left: 30%; top: 40%; width: 3px; height: 3px; animation: float-2 18s infinite 2s; }
        .particle-3 { left: 50%; top: 60%; width: 2px; height: 2px; animation: float-3 20s infinite 4s; }
        .particle-4 { left: 70%; top: 30%; width: 3px; height: 3px; animation: float-1 16s infinite 6s; }
        .particle-5 { left: 80%; top: 70%; width: 2px; height: 2px; animation: float-2 19s infinite 8s; }
        .particle-6 { left: 20%; top: 80%; width: 2px; height: 2px; animation: float-3 17s infinite 3s; }
        .particle-7 { left: 60%; top: 10%; width: 3px; height: 3px; animation: float-1 21s infinite 5s; }
        .particle-8 { left: 40%; top: 90%; width: 2px; height: 2px; animation: float-2 14s infinite 7s; }
      `}</style>
      <div className="particle particle-1" />
      <div className="particle particle-2" />
      <div className="particle particle-3" />
      <div className="particle particle-4" />
      <div className="particle particle-5" />
      <div className="particle particle-6" />
      <div className="particle particle-7" />
      <div className="particle particle-8" />
    </div>
  );
};

const menuItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: FileText, label: "Resumes", href: "/dashboard/resumes" },
  { icon: BrainCircuit, label: "AI Studio", badge: "Pro", href: "/dashboard/ai-studio" },
  { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
  { icon: Target, label: "Templates", href: "/dashboard/templates" },
]

function SidebarNav({ isCollapsed }: { isCollapsed: boolean }) {
  const pathname = usePathname()

  return (
    <TooltipProvider delayDuration={0}>
      <nav className="grid gap-2 px-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
          
          const linkContent = (
            <motion.div
              whileHover={{ x: 4 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-3 text-neutral-300 transition-all hover:bg-neutral-800 hover:text-white relative group",
                isActive && "bg-gradient-to-r from-pink-500/20 to-orange-500/20 text-white border-l-4 border-pink-500",
                isCollapsed && "justify-center rounded-xl w-12 h-12 p-0"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!isCollapsed && (
                <>
                  <span className="flex-1 truncate font-medium">{item.label}</span>
                  {item.badge && (
                    <span className={cn(
                      "ml-auto text-xs px-2 py-1 rounded-full",
                      isActive ? "bg-white text-pink-600" : "bg-pink-500 text-white"
                    )}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
              
              {/* Animated indicator for active state */}
              {isActive && !isCollapsed && (
                <motion.div 
                  className="absolute -left-1 top-1/2 w-1 h-6 bg-gradient-to-b from-pink-500 to-orange-500 rounded-r-lg"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
              
              {/* Hover effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity" />
            </motion.div>
          )

          return (
            <Link
              key={item.href}
              href={item.href}
              className="block"
            >
              {isCollapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right" sideOffset={10} className="bg-neutral-800 text-white border-neutral-700">
                    {item.label}
                    {item.badge && <span className="ml-2 text-xs bg-pink-500 px-1.5 py-0.5 rounded">Pro</span>}
                  </TooltipContent>
                </Tooltip>
              ) : (
                linkContent
              )}
            </Link>
          )
        })}
      </nav>
    </TooltipProvider>
  )
}

interface RecentResume {
  _id: string
  title: string
  updatedAt: string
}

function RecentItems({ isCollapsed }: { isCollapsed: boolean }) {
  const [recentResumes, setRecentResumes] = React.useState<RecentResume[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchRecentResumes = async () => {
      try {
        const response = await fetch('/api/resumes')
        if (response.ok) {
          const result = await response.json()
          const resumes = result.data || []
          setRecentResumes(resumes.slice(0, 3)) // Get 3 most recent
        }
      } catch (error) {
        console.error('Error fetching recent resumes:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecentResumes()
  }, [])

  if (isCollapsed) return null
  if (isLoading) return null
  if (recentResumes.length === 0) return null

  const formatTimeAgo = (date: string) => {
    const now = new Date()
    const then = new Date(date)
    const diffMs = now.getTime() - then.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="px-2 pb-4">
      <div className="px-3 pb-2">
        <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Recent</h3>
      </div>
      <div className="space-y-1">
        {recentResumes.map((resume) => (
          <Link
            key={resume._id}
            href={`/dashboard/resumes/${resume._id}/edit`}
          >
            <motion.div
              whileHover={{ x: 4 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-400 hover:bg-neutral-800/50 hover:text-white transition-colors group cursor-pointer"
            >
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span className="flex-1 truncate">{resume.title || 'Untitled Resume'}</span>
              <span className="text-xs text-neutral-500 group-hover:text-neutral-400">
                {formatTimeAgo(resume.updatedAt)}
              </span>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  )
}

function SidebarFooter({ isCollapsed }: { isCollapsed: boolean }) {
  return null
}

export function IntegratedLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const [isMobileNavOpen, setIsMobileNavOpen] = React.useState(false)
  const [isMounted, setIsMounted] = React.useState(false)
  const { user } = useUser();

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleCollapse = (collapsed: boolean) => {
    setIsCollapsed(collapsed)
  }

  const desktopSidebar = (
    <ResizablePanel 
      defaultSize={18} 
      minSize={15} 
      maxSize={22}
      collapsible={true}
      collapsedSize={5}
      onCollapse={() => handleCollapse(true)}
      onExpand={() => handleCollapse(false)}
      className={cn(
        "h-full bg-neutral-950 border-r border-neutral-800 transition-all duration-300 ease-in-out relative",
        isCollapsed ? "min-w-[80px]" : "min-w-[280px]"
      )}
    >
      <SidebarParticles />
      <div className="flex h-full flex-col gap-2 relative z-10">
        <div className="flex h-16 items-center border-b border-neutral-800 px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <div className="p-2 bg-gradient-to-r from-pink-500 to-orange-500 rounded-lg">
              <SiReactiveresume className="h-5 w-5 text-white" />
            </div>
            {!isCollapsed && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-lg bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent"
              >
                ResumeCraft
              </motion.span>
            )}
          </Link>
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 ml-auto text-neutral-400 hover:text-white hover:bg-neutral-800"
              onClick={() => handleCollapse(true)}
            >
              <PanelLeftClose className="h-4 w-4" />
              <span className="sr-only">Collapse</span>
            </Button>
          )}
        </div>
        <div className="flex-1 overflow-auto py-2">
          <SidebarNav isCollapsed={isCollapsed} />
          <RecentItems isCollapsed={isCollapsed} />
        </div>
        <SidebarFooter isCollapsed={isCollapsed} />
        <div className="border-t border-neutral-800 p-4">
          {isMounted && (
            isCollapsed ? (
              <div className="flex justify-center">
                <UserButton 
                  afterSignOutUrl="/" 
                  appearance={{ 
                    elements: { 
                      avatarBox: "w-10 h-10 border-2 border-neutral-700",
                      rootBox: "flex justify-center"
                    } 
                  }} 
                />
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <UserButton 
                  afterSignOutUrl="/" 
                  appearance={{ elements: { avatarBox: "w-10 h-10 border-2 border-neutral-700" } }} 
                />
                <div className="flex flex-col truncate">
                  <span className="font-semibold text-sm text-white truncate">{user?.fullName}</span>
                  <span className="text-xs text-neutral-400 truncate">{user?.primaryEmailAddress?.emailAddress}</span>
                </div>
                <ModeToggle />
              </div>
            )
          )}
        </div>
      </div>
    </ResizablePanel>
  )

  const mobileSidebar = (
    <AnimatePresence>
      {isMobileNavOpen && (
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed inset-y-0 left-0 z-50 w-72 bg-neutral-950 border-r border-neutral-800"
        >
          <div className="flex h-full flex-col gap-2">
            <div className="flex h-16 items-center border-b border-neutral-800 px-6 justify-between">
              <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                <div className="p-2 bg-gradient-to-r from-pink-500 to-orange-500 rounded-lg">
                  <SiReactiveresume className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">ResumeCraft</span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-neutral-400 hover:text-white hover:bg-neutral-800"
                onClick={() => setIsMobileNavOpen(false)}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
            <div className="flex-1 overflow-auto py-2">
              <SidebarNav isCollapsed={false} />
            </div>
            <SidebarFooter isCollapsed={false} />
            <div className="border-t border-neutral-800 p-4">
              {isMounted && (
                <div className="flex items-center gap-3">
                  <UserButton 
                    afterSignOutUrl="/" 
                    appearance={{ elements: { avatarBox: "w-10 h-10 border-2 border-neutral-700" } }} 
                  />
                  <div className="flex flex-col truncate">
                    <span className="font-semibold text-sm text-white truncate">{user?.fullName}</span>
                    <span className="text-xs text-neutral-400 truncate">{user?.primaryEmailAddress?.emailAddress}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <div className="flex min-h-screen w-full bg-neutral-950">
      {/* Desktop Layout */}
      <div className="hidden md:flex w-full">
        <ResizablePanelGroup direction="horizontal" className="h-screen">
          {desktopSidebar}
          <ResizableHandle withHandle className="bg-neutral-800 hover:bg-neutral-700" />
          <ResizablePanel defaultSize={82}>
            <div className="flex h-full flex-col">
              <header className="flex h-16 items-center gap-4 border-b border-neutral-800 bg-neutral-900 px-6 sticky top-0 z-10">
                <div className="flex-1">
                  <GlobalSearch />
                </div>
                <div className="flex items-center gap-3">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      variant="outline" 
                      className="bg-gradient-to-r from-pink-500 to-orange-500 text-white border-none hover:from-pink-600 hover:to-orange-600"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Upgrade to Pro
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </motion.div>
                  <ModeToggle />
                  {isMounted && (
                    <UserButton 
                      afterSignOutUrl="/" 
                      appearance={{ 
                        elements: { 
                          avatarBox: "w-8 h-8 border-2 border-neutral-700",
                        } 
                      }} 
                    />
                  )}
                </div>
              </header>
              <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
                <div className="mx-auto w-full max-w-none space-y-6">
                  <Breadcrumb />
                  {children}
                </div>
              </main>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col w-full">
        <header className="flex h-16 items-center justify-between border-b border-neutral-800 bg-neutral-900 px-4 sticky top-0 z-20">
          <a href="/dashboard" className="flex items-center gap-2 font-semibold">
            <div className="p-2 bg-gradient-to-r from-pink-500 to-orange-500 rounded-lg">
              <SiReactiveresume className="h-5 w-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">ResumeCraft</span>
          </a>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="text-neutral-400 hover:text-white hover:bg-neutral-800"
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </div>
        </header>
        
        {isMobileNavOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" 
            onClick={() => setIsMobileNavOpen(false)} 
          />
        )}
        {mobileSidebar}

        <main className="flex-1 overflow-auto p-4">
          <div className="mx-auto w-full space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}