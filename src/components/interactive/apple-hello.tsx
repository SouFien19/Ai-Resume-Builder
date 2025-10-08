"use client";

import { motion } from "framer-motion";

export function AppleHello({
  text = "Hello",
  subtext,
}: {
  text?: string;
  subtext?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-24 rounded-[100%] bg-[conic-gradient(var(--tw-gradient-stops))] from-fuchsia-500 via-cyan-400 to-amber-400 opacity-20 blur-2xl"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, ease: "linear", duration: 40 }}
      />
      <div className="relative z-10 px-10 py-16 text-center">
        <motion.h2
          className="text-balance bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-5xl font-semibold tracking-tight text-transparent sm:text-6xl"
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20%" }}
          transition={{ duration: 0.6 }}
        >
          {text}
        </motion.h2>
        {subtext ? (
          <motion.p
            className="mt-3 text-pretty text-muted-foreground"
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {subtext}
          </motion.p>
        ) : null}
      </div>
    </div>
  );
}
