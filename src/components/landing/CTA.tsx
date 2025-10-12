"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export default function CTA() {
  return (
    <section className="py-20 md:py-28 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="relative bg-gradient-to-r from-pink-500 via-orange-500 to-purple-600 rounded-2xl p-10 md:p-16 text-center overflow-hidden">
          <div
            className="absolute inset-0 bg-grid-pattern-dark opacity-10"
            style={{ maskImage: "linear-gradient(to bottom, white, transparent)" }}
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative z-10"
          >
            <Sparkles className="w-12 h-12 text-white/50 mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Land Your Dream Job?
            </h2>
            <p className="text-lg text-white/90 max-w-2xl mx-auto mb-8">
              Join thousands of successful professionals who have transformed their careers. Get started today and create a resume that opens doors.
            </p>
            <Link href="/dashboard" passHref>
              <Button
                size="lg"
                className="bg-white text-pink-600 hover:bg-gray-100 shadow-2xl scale-105 hover:scale-110 transition-transform duration-300"
              >
                Create My Resume Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
