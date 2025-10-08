"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { Command as CommandPrimitive } from "cmdk"
import { cn } from "@/lib/utils"

function Command({ className, ...props }: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      className={cn("bg-popover text-popover-foreground rounded-md border shadow-md", className)}
      {...props}
    />
  )
}

const CommandInput = React.forwardRef<HTMLInputElement, React.ComponentProps<typeof CommandPrimitive.Input>>(({ className, ...props }, ref) => (
  <CommandPrimitive.Input ref={ref} className={cn("w-full border-b bg-transparent px-3 py-2 text-sm outline-none", className)} {...props} />
))
CommandInput.displayName = "CommandInput"

function CommandList({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.List>) {
  return <CommandPrimitive.List className={cn("max-h-60 overflow-y-auto px-2 py-2", className)} {...props} />
}

function CommandEmpty({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return <CommandPrimitive.Empty className={cn("px-3 py-6 text-center text-sm text-muted-foreground", className)} {...props} />
}

function CommandGroup({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return <CommandPrimitive.Group className={cn("px-2 py-2 text-xs text-muted-foreground", className)} {...props} />
}

function CommandItem({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return <CommandPrimitive.Item className={cn("aria-selected:bg-accent aria-selected:text-accent-foreground flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm", className)} {...props} />
}

function CommandSeparator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("-mx-1 my-1 h-px bg-border", className)} {...props} />
}

function CommandShortcut({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)} {...props} />
}

const CommandDialog = ({ children, open, onOpenChange }: { children: React.ReactNode; open: boolean; onOpenChange: (o: boolean) => void }) => (
  <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
      <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-xl -translate-x-1/2 -translate-y-1/2">
        {/* Provide an accessible title for screen readers */}
        <DialogPrimitive.Title className="sr-only">Command palette</DialogPrimitive.Title>
        <Command className="rounded-lg border shadow-md">
          {children}
        </Command>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  </DialogPrimitive.Root>
)

export { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandSeparator, CommandShortcut, CommandDialog }
