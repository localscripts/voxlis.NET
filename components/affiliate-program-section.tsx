"use client"

import Link from "next/link"
import { DollarSign, BookOpen } from "lucide-react"

interface AffiliateInfo {
  value: string
  label: string
  color: string
}

const affiliateInfo: AffiliateInfo[] = [
  { value: "15%", label: "Commission Rate", color: "text-green-600 dark:text-green-400" },
  { value: "Weekly", label: "Payouts", color: "text-blue-600 dark:text-blue-400" },
  { value: "24/7", label: "Support", color: "text-purple-600 dark:text-purple-400" },
]

export default function AffiliateProgramSection() {
  return (
    <div
      className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-3xl border-2 border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden mb-16"
      style={{
        opacity: 0,
        transform: "translateY(80px) scale(0.85)",
        animation: "popUpMega 1.0s cubic-bezier(0.23, 1, 0.32, 1) 1.6s forwards",
      }}
    >
      {/* Full Width Affiliate Program */}
      <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 flex items-center justify-center p-12 relative overflow-hidden min-h-[500px]">
        {/* Enhanced Background Bubbles for Dark Mode */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Large Floating Bubbles */}
          <div className="absolute top-10 left-10 w-32 h-32 bg-green-200/20 dark:bg-green-400/30 rounded-full animate-float-slow"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-emerald-200/25 dark:bg-emerald-400/35 rounded-full animate-float-medium"></div>
          <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-lime-200/15 dark:bg-lime-400/25 rounded-full animate-float-slow"></div>
          <div className="absolute top-1/3 right-1/3 w-20 h-20 bg-teal-200/20 dark:bg-teal-400/30 rounded-full animate-float-fast"></div>
          <div className="absolute bottom-20 right-10 w-28 h-28 bg-green-300/18 dark:bg-green-500/28 rounded-full animate-float-medium"></div>

          {/* Medium Bubbles */}
          <div className="absolute top-32 right-1/2 w-12 h-12 bg-emerald-200/30 dark:bg-emerald-400/40 rounded-full animate-float-fast"></div>
          <div className="absolute bottom-40 left-1/2 w-14 h-14 bg-green-300/25 dark:bg-green-400/35 rounded-full animate-float-slow"></div>
          <div className="absolute top-2/3 left-20 w-10 h-10 bg-lime-300/35 dark:bg-lime-400/45 rounded-full animate-float-medium"></div>

          {/* Small Pulsing Dots */}
          <div className="absolute top-16 left-1/4 w-6 h-6 bg-green-400/40 dark:bg-green-300/50 rounded-full animate-pulse-slow"></div>
          <div className="absolute top-80 right-1/4 w-8 h-8 bg-emerald-400/30 dark:bg-emerald-300/45 rounded-full animate-pulse-medium"></div>
          <div className="absolute bottom-16 left-1/3 w-4 h-4 bg-lime-400/45 dark:bg-lime-300/55 rounded-full animate-pulse-fast"></div>

          {/* Rotating Rings */}
          <div className="absolute top-24 right-40 w-20 h-20 border-2 border-green-300/25 dark:border-green-400/40 rounded-full animate-spin-slow"></div>
          <div className="absolute bottom-24 left-40 w-16 h-16 border-2 border-emerald-300/30 dark:border-emerald-400/45 rounded-full animate-spin-reverse"></div>

          {/* Gradient Orbs */}
          <div className="absolute top-48 left-1/2 w-32 h-32 bg-gradient-to-br from-green-200/20 to-emerald-200/15 dark:from-green-400/25 dark:to-emerald-400/20 rounded-full animate-float-slow blur-sm"></div>
          <div className="absolute bottom-48 right-1/4 w-28 h-28 bg-gradient-to-br from-lime-200/15 to-teal-200/20 dark:from-lime-400/20 dark:to-teal-400/25 rounded-full animate-float-medium blur-sm"></div>
        </div>

        {/* Floating 15% Badge */}
        <div
          className="absolute top-4 left-4 md:top-8 md:left-8 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 md:px-6 md:py-3 rounded-full font-bold text-xl md:text-3xl shadow-lg select-none"
          style={{
            opacity: 0,
            transform: "scale(0) rotate(-180deg)",
            animation:
              "popUpSpin 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) 2.2s forwards, bounce 2s ease-in-out 3s infinite",
          }}
        >
          15%
        </div>

        {/* Main Content */}
        <div className="text-center max-w-2xl relative z-10">
          <div
            className="w-24 h-24 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl overflow-hidden"
            style={{
              opacity: 0,
              transform: "scale(0) rotateY(180deg)",
              animation: "popUpFlip 1.0s cubic-bezier(0.68, -0.55, 0.265, 1.55) 2.0s forwards",
            }}
          >
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/KittyPaw08-BaMmpBpElqXgIJ8IGftLUYlx5QTrqA.gif"
              alt="Money"
              className="w-16 h-16 object-contain"
              draggable={false}
            />
          </div>

          <h2
            className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6 select-none text-shadow"
            style={{
              opacity: 0,
              transform: "translateY(30px) scale(0.9)",
              animation: "popUpSlide 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 2.1s forwards",
              textShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
            }}
          >
            Join the Affiliate Program!
          </h2>

          <p
            className="text-xl text-gray-600 dark:text-gray-300 mb-10 leading-relaxed max-w-xl mx-auto select-none"
            style={{
              opacity: 0,
              transform: "translateY(20px)",
              animation: "popUpSlide 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) 2.3s forwards",
            }}
          >
            Share & earn! Promote Key-Empire.com and earn 15% using your own link!
          </p>

          {/* Action Buttons */}
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            style={{
              opacity: 0,
              transform: "translateY(30px) scale(0.8)",
              animation: "popUpScale 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 2.5s forwards",
            }}
          >
            <Link
              href="/404"
              className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden group select-none flex items-center justify-center gap-2"
            >
              <DollarSign className="w-5 h-5" />
              <span className="relative z-10 select-none">Start Now</span>
              <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            </Link>
            <Link
              href="/404"
              className="px-8 py-4 border-2 border-green-500 dark:border-green-400 text-green-600 dark:text-green-400 font-bold text-lg rounded-xl hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-300 transform hover:scale-105 select-none flex items-center justify-center gap-2"
            >
              <BookOpen className="w-5 h-5" />
              Learn More
            </Link>
          </div>

          {/* Additional Info */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            {affiliateInfo.map((item, index) => (
              <div
                key={index}
                className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-white/20 dark:border-gray-700/20"
                style={{
                  opacity: 0,
                  transform: "translateY(40px) scale(0.7)",
                  animation: `popUpScale 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${2.7 + index * 0.1}s forwards`,
                }}
              >
                <div className={`text-2xl font-bold ${item.color} select-none`}>{item.value}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 select-none">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Background Decoration - Enhanced for Dark Mode */}
        <div
          className="absolute -top-16 -right-16 w-48 h-48 bg-green-200/30 dark:bg-green-400/40 rounded-full"
          style={{
            opacity: 0,
            transform: "scale(0)",
            animation: "popUpCircle 1.2s cubic-bezier(0.68, -0.55, 0.265, 1.55) 2.8s forwards",
          }}
        ></div>
        <div
          className="absolute -bottom-16 -left-16 w-32 h-32 bg-blue-200/30 dark:bg-blue-400/40 rounded-full"
          style={{
            opacity: 0,
            transform: "scale(0)",
            animation: "popUpCircle 1.0s cubic-bezier(0.68, -0.55, 0.265, 1.55) 3.0s forwards",
          }}
        ></div>
        <div
          className="absolute top-1/2 right-8 w-24 h-24 bg-yellow-200/25 dark:bg-yellow-400/35 rounded-full"
          style={{
            opacity: 0,
            transform: "scale(0)",
            animation: "popUpCircle 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) 3.2s forwards",
          }}
        ></div>
      </div>
    </div>
  )
}
