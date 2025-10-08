"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface KeyboardShortcutsProps {
  className?: string;
}

const shortcuts = [
  {
    keys: ['Ctrl', 'S'],
    macKeys: ['⌘', 'S'],
    description: 'Save manually',
    category: 'Actions'
  },
  {
    keys: ['Ctrl', 'Z'],
    macKeys: ['⌘', 'Z'],
    description: 'Undo',
    category: 'History'
  },
  {
    keys: ['Ctrl', 'Y'],
    macKeys: ['⌘', 'Y'],
    description: 'Redo',
    category: 'History'
  },
  {
    keys: ['Ctrl', 'Shift', 'Z'],
    macKeys: ['⌘', '⇧', 'Z'],
    description: 'Redo (alternative)',
    category: 'History'
  },
];

export function KeyboardShortcutsButton({ className }: KeyboardShortcutsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  return (
    <>
      {/* Trigger Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative gap-2 text-neutral-400 hover:text-white hover:bg-neutral-800",
          className
        )}
        aria-label="Keyboard Shortcuts"
      >
        <Keyboard className="h-4 w-4" />
        <span className="hidden sm:inline text-xs">Shortcuts</span>
      </Button>

      {/* Shortcuts Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-lg"
            >
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-neutral-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Keyboard className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-white">Keyboard Shortcuts</h2>
                      <p className="text-sm text-neutral-400 mt-0.5">Speed up your workflow</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8 p-0 hover:bg-neutral-800"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Shortcuts List */}
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                  {/* Group by category */}
                  {['Actions', 'History'].map((category) => {
                    const categoryShortcuts = shortcuts.filter(s => s.category === category);
                    if (categoryShortcuts.length === 0) return null;

                    return (
                      <div key={category} className="mb-6 last:mb-0">
                        <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
                          {category}
                        </h3>
                        <div className="space-y-2">
                          {categoryShortcuts.map((shortcut, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="flex items-center justify-between p-3 bg-neutral-800/50 hover:bg-neutral-800 rounded-lg transition-colors"
                            >
                              <span className="text-sm text-neutral-200">
                                {shortcut.description}
                              </span>
                              <div className="flex items-center gap-1">
                                {(isMac ? shortcut.macKeys : shortcut.keys).map((key, keyIndex) => (
                                  <React.Fragment key={keyIndex}>
                                    <kbd className="px-2 py-1 text-xs font-mono bg-neutral-900 border border-neutral-700 rounded text-neutral-300 shadow-sm min-w-[28px] text-center">
                                      {key}
                                    </kbd>
                                    {keyIndex < (isMac ? shortcut.macKeys : shortcut.keys).length - 1 && (
                                      <span className="text-neutral-600 mx-0.5">+</span>
                                    )}
                                  </React.Fragment>
                                ))}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="p-4 bg-neutral-800/30 border-t border-neutral-800">
                  <p className="text-xs text-neutral-500 text-center">
                    Press <kbd className="px-1.5 py-0.5 text-xs bg-neutral-900 border border-neutral-700 rounded">?</kbd> anytime to view shortcuts
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
