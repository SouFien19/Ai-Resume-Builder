"use client";

import { motion } from "framer-motion";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText, Brain, Palette, ArrowRight, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.8 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { 
      duration: 0.8, 
      type: "spring" as const,
      stiffness: 100,
      damping: 15
    },
  },
};

interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  iconBg: string;
  gradientFrom: string;
  gradientTo: string;
  glowColor: string;
}

const ActionCard = ({ title, description, icon, href, iconBg, gradientFrom, gradientTo, glowColor }: ActionCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div 
      variants={itemVariants}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Link href={href}>
        <motion.div
          className="relative h-full group cursor-pointer perspective-1000"
          whileHover={{ 
            scale: 1.05,
            rotateY: 5,
            z: 50,
          }}
          whileTap={{ scale: 0.98 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 20 
          }}
        >
          {/* Animated gradient background */}
          <motion.div
            className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500"
            style={{
              background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
            }}
            animate={isHovered ? {
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3],
            } : {}}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className={`absolute w-1 h-1 ${glowColor} rounded-full`}
                animate={isHovered ? {
                  x: [0, Math.random() * 100 - 50],
                  y: [0, Math.random() * -100],
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                } : {}}
                transition={{
                  duration: 2,
                  delay: i * 0.2,
                  repeat: Infinity,
                }}
                style={{
                  left: `${20 + i * 30}%`,
                  top: '50%',
                }}
              />
            ))}
          </div>

          {/* Main card */}
          <div className="relative h-full min-h-[320px] rounded-3xl border border-neutral-800/50 bg-gradient-to-br from-neutral-900/95 via-neutral-800/95 to-neutral-900/95 backdrop-blur-xl overflow-hidden transition-all duration-500 group-hover:border-transparent group-hover:shadow-2xl flex flex-col">
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 opacity-0 group-hover:opacity-100"
              style={{
                background: `linear-gradient(135deg, transparent 0%, ${gradientFrom}20 50%, ${gradientTo}20 100%)`,
              }}
              animate={isHovered ? {
                backgroundPosition: ['0% 0%', '100% 100%'],
              } : {}}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear"
              }}
            />

            {/* Spotlight effect */}
            <motion.div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
              style={{
                background: `radial-gradient(circle at 50% 0%, ${gradientFrom}30, transparent 60%)`,
              }}
              animate={isHovered ? {
                scale: [1, 1.2, 1],
              } : {}}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            <CardHeader className="text-center pb-3 pt-6 relative z-10">
              {/* Icon container with 3D effect */}
              <motion.div
                className="mx-auto mb-4 relative w-fit"
                animate={isHovered ? {
                  y: [-5, 5, -5],
                  rotateZ: [0, 5, -5, 0],
                } : {}}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {/* Icon glow */}
                <motion.div
                  className={`absolute inset-0 rounded-2xl ${iconBg} blur-2xl opacity-50`}
                  animate={isHovered ? {
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 0.8, 0.5],
                  } : {}}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                
                {/* Icon background */}
                <motion.div
                  className={`relative p-4 rounded-2xl ${iconBg} shadow-2xl`}
                  whileHover={{ 
                    scale: 1.15,
                    rotate: 360,
                  }}
                  transition={{ 
                    duration: 0.8,
                    type: "spring",
                    stiffness: 200
                  }}
                >
                  <div className="relative z-10 w-8 h-8 text-white">
                    {icon}
                  </div>
                  
                  {/* Inner glow */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent" />
                </motion.div>

                {/* Orbiting particles */}
                {[...Array(2)].map((_, i) => (
                  <motion.div
                    key={i}
                    className={`absolute w-2 h-2 ${glowColor} rounded-full`}
                    animate={{
                      rotate: 360,
                    }}
                    transition={{
                      duration: 3 + i,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    style={{
                      top: '50%',
                      left: '50%',
                      transformOrigin: `${30 + i * 10}px 0px`,
                    }}
                  />
                ))}
              </motion.div>

              {/* Title with gradient */}
              <motion.div
                animate={isHovered ? {
                  scale: [1, 1.02, 1],
                } : {}}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              >
                <CardTitle 
                  className="text-lg font-bold bg-gradient-to-r bg-clip-text text-transparent transition-all duration-300"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
                  }}
                >
                  {title}
                </CardTitle>
              </motion.div>
            </CardHeader>

            <CardContent className="text-center relative z-10 pb-6 px-4 flex flex-col flex-1 justify-between gap-4">
              <p className="text-sm text-neutral-400 leading-relaxed">
                {description}
              </p>

              {/* Animated button */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-auto"
              >
                <Button 
                  size="default" 
                  className="w-full group/btn relative overflow-hidden border-0 text-white font-semibold shadow-xl transition-all duration-300 h-10"
                  style={{
                    background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
                  }}
                >
                  {/* Button shimmer */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover/btn:opacity-100"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                    }}
                    animate={{
                      x: ['-100%', '100%'],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                  
                  <span className="relative z-10 flex items-center justify-center gap-2 text-sm">
                    <Sparkles className="w-3.5 h-3.5" />
                    Get Started
                    <motion.div
                      animate={isHovered ? {
                        x: [0, 5, 0],
                      } : {}}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                      }}
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </motion.div>
                  </span>
                </Button>
              </motion.div>
            </CardContent>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
};

export default function QuickActions() {
  const actions = [
    {
      title: "Create Resume",
      description: "Start building your professional resume with AI assistance and modern templates",
      icon: <PlusCircle className="w-full h-full" />,
      href: "/dashboard/templates",
      iconBg: "bg-gradient-to-br from-pink-500 to-purple-500",
      gradientFrom: "#ec4899",
      gradientTo: "#a855f7",
      glowColor: "bg-pink-500",
    },
    {
      title: "View Resumes",
      description: "Manage and edit your existing resume collection with advanced tools",
      icon: <FileText className="w-full h-full" />,
      href: "/dashboard/resumes",
      iconBg: "bg-gradient-to-br from-purple-500 to-fuchsia-500",
      gradientFrom: "#a855f7",
      gradientTo: "#d946ef",
      glowColor: "bg-purple-500",
    },
    {
      title: "AI Studio",
      description: "Generate content with our advanced AI writing assistant and optimization tools",
      icon: <Brain className="w-full h-full" />,
      href: "/dashboard/ai-studio",
      iconBg: "bg-gradient-to-br from-fuchsia-500 to-pink-500",
      gradientFrom: "#d946ef",
      gradientTo: "#ec4899",
      glowColor: "bg-fuchsia-500",
    },
    {
      title: "Templates",
      description: "Browse our collection of professional resume templates designed by experts",
      icon: <Palette className="w-full h-full" />,
      href: "/dashboard/templates",
      iconBg: "bg-gradient-to-br from-violet-500 to-purple-500",
      gradientFrom: "#8b5cf6",
      gradientTo: "#a855f7",
      glowColor: "bg-violet-500",
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header with animated gradient */}
      <div className="flex items-center justify-between relative">
        {/* Animated background glow */}
        <motion.div
          className="absolute -inset-4 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-fuchsia-500/10 rounded-3xl blur-2xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <div className="relative z-10">
          <motion.h2 
            className="text-3xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent"
            animate={{
              backgroundPosition: ['0%', '100%', '0%'],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              backgroundSize: '200% auto',
            }}
          >
            Quick Actions
          </motion.h2>
          <motion.p 
            className="text-neutral-400 mt-2 flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <motion.span
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              ✨
            </motion.span>
            Jump into your most common tasks
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ 
            delay: 0.5,
            type: "spring",
            stiffness: 200
          }}
          whileHover={{ scale: 1.05, rotate: 2 }}
          whileTap={{ scale: 0.95 }}
          className="relative z-10"
        >
          <Button 
            size="lg"
            className="group relative overflow-hidden border-0 bg-gradient-to-r from-pink-500 via-purple-500 to-fuchsia-500 text-white font-semibold shadow-xl hover:shadow-pink-500/50 transition-all duration-300"
          >
            {/* Button shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{
                x: ['-200%', '200%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            
            <span className="relative z-10 flex items-center gap-2">
              <motion.span
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Sparkles className="w-4 h-4" />
              </motion.span>
              Quick Generate
              <motion.span
                animate={{
                  x: [0, 3, 0],
                  scale: [1, 1.3, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Zap className="w-4 h-4" />
              </motion.span>
            </span>
          </Button>
        </motion.div>
      </div>
      
      {/* Cards grid with improved responsive layout */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 auto-rows-fr">
        {actions.map((action, index) => (
          <ActionCard key={index} {...action} />
        ))}
      </div>

      {/* Floating gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <motion.div
          className="absolute top-0 left-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
    </motion.div>
  );
}
