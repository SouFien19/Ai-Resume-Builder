"use client";

import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    description: "Perfect for getting started",
    features: [
      "3 Resume Templates",
      "Basic AI Suggestions",
      "PDF Export",
      "Email Support",
      "1 Resume Project",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    price: "$9",
    period: "/month",
    description: "Best for job seekers",
    features: [
      "Unlimited Templates",
      "Advanced AI Writing",
      "ATS Optimization",
      "Cover Letter Generator",
      "Priority Support",
      "Unlimited Projects",
      "Custom Branding",
      "LinkedIn Optimization",
    ],
    cta: "Upgrade to Pro",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For teams and organizations",
    features: [
      "Everything in Pro",
      "Team Management",
      "API Access",
      "Custom Templates",
      "Dedicated Support",
      "SSO Integration",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 md:py-28 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12 md:mb-20">
          <Badge variant="secondary" className="mb-4">
            Pricing
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-50 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Choose the plan that's right for you. No hidden fees, cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              whileHover={{ y: -8 }}
              className={`relative p-8 rounded-2xl border ${
                plan.popular
                  ? "bg-gradient-to-br from-pink-500 to-orange-500 border-transparent shadow-2xl scale-105 z-10"
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-white text-pink-600 dark:bg-gray-900 dark:text-pink-400 shadow-lg">
                    <Sparkles className="w-3 h-3 mr-1" />
                    MOST POPULAR
                  </Badge>
                </div>
              )}

              <div className={plan.popular ? "text-white" : ""}>
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className={`text-sm mb-6 ${plan.popular ? "text-white/90" : "text-gray-600 dark:text-gray-400"}`}>
                  {plan.description}
                </p>

                <div className="mb-6">
                  <span className="text-5xl font-bold">{plan.price}</span>
                  {plan.period && <span className={plan.popular ? "text-white/80" : "text-gray-600 dark:text-gray-400"}>{plan.period}</span>}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className={`w-5 h-5 mt-0.5 flex-shrink-0 ${plan.popular ? "text-white" : "text-green-500"}`} />
                      <span className={`text-sm ${plan.popular ? "text-white/90" : "text-gray-600 dark:text-gray-400"}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link href="/dashboard" passHref>
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? "bg-white text-pink-600 hover:bg-gray-100 shadow-xl"
                        : "bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white"
                    }`}
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center mt-12 text-sm text-gray-600 dark:text-gray-400"
        >
          All plans include a 14-day free trial. No credit card required.
        </motion.p>
      </div>
    </section>
  );
}
