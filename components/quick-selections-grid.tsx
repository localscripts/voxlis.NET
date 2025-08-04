"use client"

import { ArrowRight } from "lucide-react"
import Link from "next/link"

interface QuickLink {
  title: string
  description: string
  href: string
  color: string
}

const quickLinks: QuickLink[] = [
  {
    title: "Discord",
    description: "Browse our top selections",
    href: "/selections",
    color: "from-blue-500 to-blue-600",
  },
  {
    title: "Get Started",
    description: "View all products",
    href: "/selections",
    color: "from-green-500 to-green-600",
  },
  {
    title: "Referrals",
    description: "Find your perfect tool",
    href: "/selections",
    color: "from-purple-500 to-purple-600",
  },
]

export default function QuickSelectionsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {quickLinks.map((link, index) => (
        <Link
          key={index}
          href={link.href}
          className="group block p-8 bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 relative overflow-hidden"
          style={{
            opacity: 0,
            transform: "translateY(60px) scale(0.8) rotateX(15deg)",
            animation: `popUp3D 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${1.0 + index * 0.15}s forwards`,
          }}
        >
          {/* Enhanced Animated Background Bubbles - Same as main page */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Large Floating Bubbles */}
            <div className="absolute top-4 right-6 w-8 h-8 bg-blue-200/20 dark:bg-blue-400/30 rounded-full animate-float-slow"></div>
            <div className="absolute bottom-6 left-4 w-6 h-6 bg-green-200/20 dark:bg-green-400/30 rounded-full animate-float-medium"></div>
            <div className="absolute top-1/2 right-2 w-4 h-4 bg-purple-200/20 dark:bg-purple-400/30 rounded-full animate-float-fast"></div>
            <div className="absolute bottom-2 right-1/3 w-10 h-10 bg-emerald-200/15 dark:bg-emerald-400/25 rounded-full animate-float-slow"></div>

            {/* Medium Bubbles */}

            {/* Small Pulsing Dots */}
            <div className="absolute top-6 left-1/3 w-2 h-2 bg-blue-400/30 dark:bg-blue-300/50 rounded-full animate-pulse-slow"></div>
            <div className="absolute bottom-4 right-6 w-3 h-3 bg-green-400/25 dark:bg-green-300/45 rounded-full animate-pulse-medium"></div>

            {/* Rotating Rings */}
            <div className="absolute top-2 left-2 w-12 h-12 border border-gray-300/20 dark:border-gray-500/40 rounded-full animate-spin-slow"></div>
            <div className="absolute bottom-3 right-3 w-8 h-8 border border-blue-300/25 dark:border-blue-500/45 rounded-full animate-spin-reverse"></div>

            {/* Gradient Orbs */}

            {/* Additional Floating Elements */}

            {/* Tiny Sparkle Effects */}
          </div>

          {/* Discord Icon Stamp for "Discord" */}
          {link.title === "Discord" && (
            <div className="absolute top-2 right-2 transform rotate-12 opacity-25 group-hover:opacity-50 group-hover:rotate-[18deg] group-hover:scale-110 transition-all duration-300">
              <svg
                className="text-blue-600 dark:text-blue-400 opacity-40 w-[175px] h-[175px] group-hover:rotate-6 transition-transform duration-300"
                fill="currentColor"
                viewBox="0 0 16 16"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12.85 3.55C11.95 3.15 11 2.85 10 2.65l-0.05 0c-0.1 0.2 -0.25 0.5 -0.35 0.75 -1.1 -0.15 -2.15 -0.15 -3.2 0 -0.1 -0.25 -0.25 -0.5 -0.35 -0.75l-0.05 0c-1 0.15 -1.95 0.45 -2.85 0.9C1.35 6.25 0.85 8.9 1.1 11.5l0 0.05c1.2 0.9 2.35 1.4 3.5 1.75l0.05 0c0.25 -0.35 0.5 -0.75 0.7 -1.15l0 -0.05c-0.4 -0.15 -0.75 -0.3 -1.1 -0.5 -0.05 0 -0.05 -0.05 0 -0.05 0.05 -0.05 0.15 -0.1 0.2 -0.15l0.05 0c2.3 1.05 4.75 1.05 7.05 0l0.05 0c0.05 0.05 0.15 0.1 0.2 0.15 0.05 0 0 0.05 0 0.05 -0.35 0.2 -0.7 0.4 -1.1 0.5 0 0 -0.05 0.05 0 0.05 0.2 0.4 0.45 0.8 0.7 1.15l0.05 0c1.15 -0.35 2.3 -0.9 3.5 -1.75l0 -0.05c0.3 -3 -0.5 -5.6 -2.1 -7.95zM5.7 9.95c-0.7 0 -1.25 -0.65 -1.25 -1.4s0.55 -1.4 1.25 -1.4 1.25 0.65 1.25 1.4c0 0.75 -0.55 1.4 -1.25 1.4zm4.65 0c-0.7 0 -1.25 -0.65 -1.25 -1.4s0.55 -1.4 1.25 -1.4 1.25 0.65 1.25 1.4c0 0.75 -0.55 1.4 -1.25 1.4z" />
              </svg>
            </div>
          )}

          {/* Shopping Cart Icon Stamp for "Get Started" */}
          {link.title === "Get Started" && (
            <div className="absolute top-2 right-2 transform rotate-12 opacity-25 group-hover:opacity-50 group-hover:rotate-[18deg] group-hover:scale-110 transition-all duration-300">
              <svg
                className="text-green-600 dark:text-green-400 opacity-40 w-[175px] h-[175px] group-hover:rotate-6 transition-transform duration-300"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  className="px-0 mx-0 ml-0 pl-0"
                  d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
                />
              </svg>
            </div>
          )}

          {/* Referrals Icon Stamp for "Referrals" */}
          {link.title === "Referrals" && (
            <div className="absolute top-2 right-2 transform rotate-12 opacity-25 group-hover:opacity-50 group-hover:rotate-[18deg] group-hover:scale-110 transition-all duration-300">
              <svg
                className="text-purple-600 dark:text-purple-400 opacity-40 w-[175px] h-[175px] group-hover:rotate-6 transition-transform duration-300"
                fill="currentColor"
                viewBox="0 0 32 32"
              >
                <g fill="none" fillRule="evenodd">
                  <circle cx="16" cy="16" fill="#9333ea" r="16" />
                  <path
                    d="M22.5 19.154c0 2.57-2.086 4.276-5.166 4.533V26h-2.11v-2.336A11.495 11.495 0 0 1 9.5 21.35l1.552-2.126c1.383 1.075 2.692 1.776 4.269 2.01v-4.58c-3.541-.888-5.19-2.173-5.19-4.813 0-2.523 2.061-4.252 5.093-4.486V6h2.11v1.402a9.49 9.49 0 0 1 4.56 1.776l-1.359 2.196c-1.067-.771-2.158-1.262-3.298-1.495v4.439c3.687.888 5.263 2.313 5.263 4.836zm-7.18-5.327V9.715c-1.527.117-2.327.935-2.327 1.963 0 .98.46 1.612 2.328 2.15zm4.318 5.49c0-1.05-.51-1.681-2.401-2.219v4.23c1.528-.118 2.401-.889 2.401-2.01z"
                    fill="#fff"
                  />
                </g>
              </svg>
            </div>
          )}

          <div
            className={`w-12 h-12 bg-gradient-to-r ${link.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 relative z-10`}
          >
            <ArrowRight className="w-6 h-6 text-white" />
          </div>
          <h3
            className={`text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 transition-colors select-none relative z-10 ${
              link.title === "Discord"
                ? "group-hover:text-blue-600 dark:group-hover:text-blue-400"
                : link.title === "Get Started"
                  ? "group-hover:text-green-600 dark:group-hover:text-green-400"
                  : "group-hover:text-purple-600 dark:group-hover:text-purple-400"
            }`}
          >
            {link.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 select-none relative z-10">{link.description}</p>
        </Link>
      ))}
    </div>
  )
}
