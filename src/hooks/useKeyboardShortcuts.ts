import { useEffect, useCallback } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
  callback: (event: KeyboardEvent) => void;
  preventDefault?: boolean;
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  shortcuts: KeyboardShortcut[];
}

export function useKeyboardShortcuts({ enabled = true, shortcuts }: UseKeyboardShortcutsOptions) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Don't trigger shortcuts when typing in inputs/textareas
      const target = event.target as HTMLElement;
      const isInputElement = 
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.isContentEditable;

      for (const shortcut of shortcuts) {
        // Skip if event.key or shortcut.key is undefined
        if (!event.key || !shortcut.key) continue;

        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrlKey === undefined || event.ctrlKey === shortcut.ctrlKey;
        const shiftMatch = shortcut.shiftKey === undefined || event.shiftKey === shortcut.shiftKey;
        const metaMatch = shortcut.metaKey === undefined || event.metaKey === shortcut.metaKey;
        const altMatch = shortcut.altKey === undefined || event.altKey === shortcut.altKey;

        // For save/undo/redo, allow even in input elements
        const isGlobalShortcut = ['s', 'z', 'y'].includes(shortcut.key.toLowerCase()) && 
                                 (shortcut.ctrlKey || shortcut.metaKey);

        if (keyMatch && ctrlMatch && shiftMatch && metaMatch && altMatch) {
          if (!isInputElement || isGlobalShortcut) {
            if (shortcut.preventDefault) {
              event.preventDefault();
            }
            shortcut.callback(event);
            break;
          }
        }
      }
    },
    [enabled, shortcuts]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, handleKeyDown]);
}

// Helper function to format shortcut for display
export function formatShortcut(shortcut: Omit<KeyboardShortcut, 'callback' | 'preventDefault'>): string {
  const parts: string[] = [];
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  
  if (shortcut.ctrlKey || shortcut.metaKey) {
    parts.push(isMac ? '⌘' : 'Ctrl');
  }
  if (shortcut.shiftKey) {
    parts.push(isMac ? '⇧' : 'Shift');
  }
  if (shortcut.altKey) {
    parts.push(isMac ? '⌥' : 'Alt');
  }
  parts.push(shortcut.key.toUpperCase());
  
  return parts.join(isMac ? '' : '+');
}
