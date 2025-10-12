"use client";

import { motion } from "framer-motion";
import { Briefcase, Users, Award, TrendingUp, Building2 } from "lucide-react";

const jobPortals = [
  { 
    name: "Indeed", 
    icon: Briefcase,
    color: "from-blue-600 to-blue-700"
  },
  { 
    name: "LinkedIn", 
    icon: Users,
    color: "from-blue-500 to-blue-600"
  },
  { 
    name: "Glassdoor", 
    icon: Building2,
    color: "from-green-500 to-green-600"
  },
  { 
    name: "Monster", 
    icon: TrendingUp,
    color: "from-purple-500 to-purple-600"
  },
  { 
    name: "CareerBuilder", 
    icon: Award,
    color: "from-orange-500 to-orange-600"
  },
];

export default function SocialProof() {
  return (
    <section className="py-12 md:py-16 bg-white dark:bg-gray-950 border-y border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-8 tracking-wider">
            INTEGRATED WITH TOP JOB PORTALS
          </p>

          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
            {jobPortals.map((portal, index) => (
              <motion.div
                key={portal.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="group relative"
              >
                <div className="flex flex-col items-center gap-2">
                  {/* Icon with gradient background */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${portal.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:rotate-3`}>
                    <portal.icon className="w-8 h-8 text-white" strokeWidth={2.5} />
                  </div>
                  
                  {/* Portal Name */}
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-pink-500 group-hover:to-orange-500 transition-all duration-300">
                    {portal.name}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Optional: Add "Export to" text */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-6 text-xs text-gray-500 dark:text-gray-400"
          >
            Export your resume directly to any platform
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-8 flex items-center justify-center gap-8"
          >
            <div className="text-center">
              <div className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
                500+
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Companies</div>
            </div>
            <div className="h-8 w-px bg-gray-300 dark:bg-gray-700" />
            <div className="text-center">
              <div className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
                50K+
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Job Seekers</div>
            </div>
            <div className="h-8 w-px bg-gray-300 dark:bg-gray-700" />
            <div className="text-center">
              <div className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
                98%
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Satisfaction</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
