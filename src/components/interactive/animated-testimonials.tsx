"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Quote } from "lucide-react";

export type Testimonial = {
  quote: string;
  name: string;
  role?: string;
  avatar?: string;
};

export function AnimatedTestimonials({
  items,
  interval = 4000,
}: {
  items: Testimonial[];
  interval?: number;
}) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % items.length), interval);
    return () => clearInterval(id);
  }, [items.length, interval]);

  const item = items[index];
  const initials = item.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative mx-auto max-w-2xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35 }}
        >
          <Card>
            <CardContent className="p-6">
              <Quote className="h-5 w-5 text-primary" />
              <p className="mt-3 text-balance text-sm text-muted-foreground">{item.quote}</p>
              <div className="mt-6 flex items-center gap-3">
                <Avatar>
                  {item.avatar ? (
                    <AvatarImage src={item.avatar} alt={item.name} />
                  ) : null}
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm font-medium">{item.name}</div>
                  {item.role ? (
                    <div className="text-xs text-muted-foreground">{item.role}</div>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      <div className="mt-4 flex justify-center gap-1.5">
        {items.map((_, i) => (
          <span
            key={i}
            aria-hidden
            className={
              "h-1.5 w-1.5 rounded-full " + (i === index ? "bg-primary" : "bg-muted")
            }
          />
        ))}
      </div>
    </div>
  );
}
