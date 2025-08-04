"use client"

import { ArrowRight } from "lucide-react"
import Image from "next/image"

interface HeroSectionProps {
  onButtonClick: () => void // Change prop name and type
}

export default function HeroSection({ onButtonClick }: HeroSectionProps) {
  return (
    <div className="text-center py-8 mb-64 mt-[150px] md:mt-30 relative overflow-hidden">
      {/* Logo */}
      <div
        className="flex justify-center mb-8"
        style={{
          opacity: 0,
          transform: "translateY(50px) scale(0.8)",
          animation: "popUpBounce 1.2s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.2s forwards",
        }}
      >
        <div className="relative rounded-lg group">
          <Image
            src="/images/key-empire-logo.png"
            alt="Key-Empire"
            width={600}
            height={150}
            className="h-24 md:h-32 lg:h-36 w-auto select-none transform hover:scale-105 transition-all duration-300"
            priority
            draggable={false}
            style={{
              animation: "logoFloat 3s ease-in-out infinite",
              filter: "drop-shadow(0 8px 16px rgba(0, 0, 0, 0.2))",
            }}
          />
        </div>
      </div>

      {/* Marketplace Description */}
      <p
        className="text-2xl md:text-3xl text-gray-600 dark:text-gray-300 mb-6 max-w-4xl mx-auto select-none lg:text-3xl text-shadow"
        style={{
          opacity: 0,
          transform: "translateY(30px)",
          animation: "popUpSlide 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.4s forwards",
          textShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
        }}
      >
        Your premium marketplace for executors, scripts, and digital tools. Join thousands of satisfied customers
        worldwide.
      </p>

      {/* Action Button */}
      <div
        className="flex justify-center"
        style={{
          opacity: 0,
          transform: "translateY(20px) scale(0.9)",
          animation: "popUpScale 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.6s forwards",
        }}
      >
        <button // Use button element
          onClick={onButtonClick} // Use onButtonClick prop
          className="px-8 py-4 text-lg bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white font-semibold rounded-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden group select-none"
          style={{
            animation: "buttonPulse 2s infinite",
            boxShadow: "0 20px 40px -12px rgba(34, 197, 94, 0.4), 0 8px 16px -4px rgba(34, 197, 94, 0.2)",
          }}
        >
          <span className="relative z-10 flex items-center gap-2 select-none">
            Get Started
            <ArrowRight className="w-5 h-5" />
          </span>
          <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
        </button>
      </div>
    </div>
  )
}
