"use client"

import { Shield, Zap, Users, type LucideIcon } from "lucide-react"

interface Feature {
  icon: LucideIcon
  title: string
  description: string
}

const features: Feature[] = [
  {
    icon: Shield,
    title: "Secure & Trusted",
    description: "All transactions are protected with enterprise-grade security",
  },
  {
    icon: Zap,
    title: "Instant Delivery",
    description: "Get your products immediately after purchase",
  },
  {
    icon: Users,
    title: "24/7 Support",
    description: "Our team is always here to help you succeed",
  },
]

export default function FeaturesSection() {
  return (
    <div className="mb-16 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-12 select-none text-shadow">
        Why Choose Key-Empire?
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center">
        {features.map((feature, index) => {
          const IconComponent = feature.icon
          return (
            <div
              key={index}
              className="relative overflow-hidden text-center p-6 bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 w-full max-w-sm"
            >
              {/* Animated Background Bubbles */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Floating Circles */}
                <div className="absolute top-4 right-6 w-8 h-8 bg-blue-200/20 dark:bg-blue-400/10 rounded-full animate-float-slow"></div>
                <div className="absolute bottom-6 left-4 w-6 h-6 bg-green-200/20 dark:bg-green-400/10 rounded-full animate-float-medium"></div>
                <div className="absolute top-1/2 right-2 w-4 h-4 bg-purple-200/20 dark:bg-purple-400/10 rounded-full animate-float-fast"></div>
                <div className="absolute bottom-2 right-1/3 w-10 h-10 bg-emerald-200/15 dark:bg-emerald-400/10 rounded-full animate-float-slow"></div>

                {/* Pulsing Dots */}
                <div className="absolute top-6 left-1/3 w-2 h-2 bg-blue-400/30 dark:bg-blue-300/20 rounded-full animate-pulse-slow"></div>
                <div className="absolute bottom-4 right-6 w-3 h-3 bg-green-400/25 dark:bg-green-300/20 rounded-full animate-pulse-medium"></div>

                {/* Rotating Ring */}
                <div className="absolute top-2 left-2 w-12 h-12 border border-gray-300/20 dark:border-gray-600/20 rounded-full animate-spin-slow"></div>
              </div>

              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <IconComponent className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 select-none">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 select-none">{feature.description}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
