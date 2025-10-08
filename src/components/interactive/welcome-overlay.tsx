"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppleHello } from "@/components/interactive/apple-hello";

export function WelcomeOverlay({
  onDone,
  text = "Welcome",
  subtext = "Build job‑winning resumes with AI assistance.",
  durationMs = 2200,
}: {
  onDone: () => void;
  text?: string;
  subtext?: string;
  durationMs?: number;
}) {
  useEffect(() => {
    const t = setTimeout(() => onDone(), durationMs);
    return () => clearTimeout(t);
  }, [onDone, durationMs]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
      >
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-3xl px-6"
        >
          <AppleHello text={text} subtext={subtext} />
        </motion.div>

        <button
          type="button"
          onClick={onDone}
          className="absolute bottom-4 right-4 rounded-md border bg-card/70 px-3 py-1.5 text-sm text-muted-foreground shadow-sm backdrop-blur transition hover:bg-card"
        >
          Skip
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
