"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface ProductCardProps {
  id: number
  title: string
  image: string
  redirectUrl: string
  price: string
  resellers: string
  shadeColor: string
  popular: boolean
  index: number
  onProductSelect?: (productTitle: string) => void
  isSelected?: boolean
}

export default function ProductCard({
  id,
  title,
  image,
  redirectUrl,
  price,
  resellers,
  shadeColor,
  popular,
  index,
  onProductSelect,
  isSelected = false,
}: ProductCardProps) {
  const [previousSelected, setPreviousSelected] = useState(isSelected)
  const [animationKey, setAnimationKey] = useState(0)
  const router = useRouter()

  useEffect(() => {
    if (previousSelected !== isSelected) {
      setAnimationKey((prev) => prev + 1)
      setPreviousSelected(isSelected)
    }
  }, [isSelected, previousSelected])

  const handleProductClick = () => {
    onProductSelect?.(title)
  }

  const getShadeClasses = (color: string) => {
    const shadeMap = {
      blue: "from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30",
      red: "from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30",
      green: "from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30",
      purple: "from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30",
      orange: "from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30",
      amber: "from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30",
      gray: "from-gray-50 to-gray-100 dark:from-gray-800/30 dark:to-gray-700/30",
      slate: "from-slate-50 to-slate-100 dark:from-slate-800/30 dark:to-slate-700/30",
      pink: "from-pink-50 to-pink-100 dark:from-pink-900/30 dark:to-pink-800/30",
      teal: "from-teal-50 to-teal-100 dark:from-teal-900/30 dark:to-teal-800/30",
      cyan: "from-cyan-50 to-cyan-100 dark:from-cyan-900/30 dark:to-cyan-800/30",
      yellow: "from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30",
      indigo: "from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/30",
      violet: "from-violet-50 to-violet-100 dark:from-violet-900/30 dark:to-violet-800/30",
    }
    return (
      shadeMap[color as keyof typeof shadeMap] || "from-gray-50 to-gray-100 dark:from-gray-800/30 dark:to-gray-700/30"
    )
  }

  const getBorderColor = (color: string) => {
    const borderMap = {
      purple:
        "border-purple-200 group-hover:border-purple-400 dark:border-purple-700 dark:group-hover:border-purple-500",
      cyan: "border-cyan-200 group-hover:border-cyan-400 dark:border-cyan-700 dark:group-hover:border-cyan-500",
      orange:
        "border-orange-200 group-hover:border-orange-400 dark:border-orange-700 dark:group-hover:border-orange-500",
      slate: "border-slate-200 group-hover:border-slate-400 dark:border-slate-700 dark:group-hover:border-slate-500",
      pink: "border-pink-200 group-hover:border-pink-400 dark:border-pink-700 dark:group-hover:border-pink-500",
    }
    return (
      borderMap[color as keyof typeof borderMap] ||
      "border-gray-200 group-hover:border-gray-400 dark:border-gray-700 dark:group-hover:border-gray-500"
    )
  }

  return (
    <button
      onClick={handleProductClick}
      className={`group block w-full text-left`}
      style={{
        opacity: 0,
        animation: `fadeInUp 0.8s ease-out ${index * 0.1}s forwards`,
      }}
    >
      <div
        className={`relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:scale-[1.02] border-2 ${getBorderColor(shadeColor)}`}
      >
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {/* Dynamic background */}
          <div className={`absolute inset-0 bg-gradient-to-br ${getShadeClasses(shadeColor)} opacity-60`}></div>

          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white dark:via-gray-300 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </div>

          {/* Product Image */}
          <div className="absolute inset-0 p-2 sm:p-3 flex items-center justify-center">
            <div className="relative w-full h-full">
              <Image
                src={image || "/placeholder.svg"}
                alt={title}
                fill
                className="object-contain transform group-hover:scale-110 transition-transform duration-500 drop-shadow-2xl"
                draggable={false}
              />
            </div>
          </div>

          {/* Epic Checkmark Animation when selected */}
          {isSelected && (
            <div key={`selected-${animationKey}`} className="absolute inset-0 flex items-center justify-center z-20">
              {/* Ripple Effect Background */}
              <div className="absolute w-24 h-24 sm:w-32 sm:h-32 bg-green-400/30 rounded-full animate-epicRipple"></div>
              <div
                className="absolute w-18 h-18 sm:w-24 sm:h-24 bg-green-500/40 rounded-full animate-epicRipple"
                style={{ animationDelay: "0.1s" }}
              ></div>

              {/* Main Checkmark Circle */}
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-400 via-green-500 to-green-600 rounded-full flex items-center justify-center shadow-2xl border-4 border-white/30 animate-epicCheckIn backdrop-blur-sm">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-300 to-green-700 rounded-full blur-md opacity-60 animate-pulse"></div>

                {/* Checkmark Icon */}
                <svg
                  className="w-8 h-8 sm:w-10 sm:h-10 text-white relative z-10 animate-checkmarkDraw"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                    className="animate-checkmarkPath"
                  />
                </svg>

                {/* Sparkle Effects */}
                <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-2 h-2 sm:w-3 sm:h-3 bg-yellow-300 rounded-full animate-sparkle1"></div>
                <div className="absolute -bottom-0.5 -left-1 sm:-bottom-1 sm:-left-2 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-yellow-400 rounded-full animate-sparkle2"></div>
                <div className="absolute top-0.5 -left-2 sm:top-1 sm:-left-3 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-sparkle3"></div>
                <div className="absolute -top-2 left-1 sm:-top-3 sm:left-2 w-1 h-1 bg-yellow-200 rounded-full animate-sparkle4"></div>
              </div>
            </div>
          )}

          {/* Deselection Animation */}
          {!isSelected && previousSelected && (
            <div key={`deselected-${animationKey}`} className="absolute inset-0 flex items-center justify-center z-20">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-2xl border-4 border-white/30 animate-epicCheckOut">
                <svg
                  className="w-8 h-8 sm:w-10 sm:h-10 text-white animate-xMarkDraw"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={3}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6"></div>
        </div>

        {/* Product Info */}
        <div className="p-2 sm:p-3 space-y-2">
          {/* Title */}
          <div className="space-y-1 sm:space-y-2">
            <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 leading-tight">
              {title}
            </h3>
          </div>

          {/* Price and Sellers */}
          <div className="flex items-center justify-between gap-2">
            <div className="space-y-0.5 sm:space-y-1 flex-shrink-0">
              <div className="text-base sm:text-lg font-bold text-green-600 dark:text-green-400">{price}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{resellers}</div>
            </div>

            {/* Action Button - Properly responsive */}
            <button
              className={`${
                isSelected
                  ? "bg-green-600 hover:bg-green-700 cursor-default"
                  : "bg-blue-600 hover:bg-blue-700 cursor-pointer hover:scale-105 sm:hover:scale-110 active:scale-95"
              } text-white rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 shadow-lg sm:shadow-xl hover:shadow-xl sm:hover:shadow-2xl transform border-2 border-white/20 hover:border-white/40 backdrop-blur-sm relative overflow-hidden group/btn px-2 py-1.5 sm:py-2 flex-shrink-0 min-w-0 sm:px-1`}
              onClick={(e) => {
                e.stopPropagation()
                handleProductClick()
              }}
            >
              {/* Button shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></div>

              {/* Button content */}
              <span className="relative z-10 flex items-center gap-1 sm:gap-2 whitespace-now-wrap">
                {isSelected ? (
                  <>
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="hidden xs:inline">Selected</span>
                    <span className="xs:hidden">✓</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 group-hover/btn:rotate-12 transition-transform duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="hidden sm:inline">Select Now</span>
                    <span className="sm:hidden">Select</span>
                  </>
                )}
              </span>

              {/* Pulsing ring for unselected state */}
              {!isSelected && (
                <div
                  className={`absolute inset-0 rounded-lg sm:rounded-xl border-2 border-blue-400 animate-ping opacity-30`}
                ></div>
              )}
            </button>
          </div>
        </div>

        {/* Animated Border */}
        <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 transition-all duration-300 pointer-events-none"></div>
      </div>

      <style jsx>{`
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(40px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes epicRipple {
        0% {
          transform: scale(0);
          opacity: 1;
        }
        100% {
          transform: scale(1.5);
          opacity: 0;
        }
      }

      @keyframes epicCheckIn {
        0% {
          opacity: 0;
          transform: scale(0) rotate(-180deg);
          filter: blur(10px);
        }
        30% {
          opacity: 1;
          transform: scale(1.4) rotate(20deg);
          filter: blur(2px);
        }
        60% {
          transform: scale(0.8) rotate(-10deg);
          filter: blur(0px);
        }
        80% {
          transform: scale(1.1) rotate(5deg);
        }
        100% {
          transform: scale(1) rotate(0deg);
          opacity: 1;
          filter: blur(0px);
        }
      }

      @keyframes epicCheckOut {
        0% {
          opacity: 1;
          transform: scale(1) rotate(0deg);
        }
        30% {
          opacity: 1;
          transform: scale(1.2) rotate(90deg);
        }
        100% {
          opacity: 0;
          transform: scale(0) rotate(180deg);
          filter: blur(5px);
        }
      }

      @keyframes checkmarkDraw {
        0% {
          opacity: 0;
          transform: scale(0.5);
        }
        50% {
          opacity: 1;
          transform: scale(1.2);
        }
        100% {
          opacity: 1;
          transform: scale(1);
        }
      }

      @keyframes checkmarkPath {
        0% {
          stroke-dasharray: 0 100;
          stroke-dashoffset: 0;
        }
        100% {
          stroke-dasharray: 100 0;
          stroke-dashoffset: 0;
        }
      }

      @keyframes xMarkDraw {
        0% {
          opacity: 0;
          transform: scale(0.5) rotate(-90deg);
        }
        100% {
          opacity: 1;
          transform: scale(1) rotate(0deg);
        }
      }

      @keyframes sparkle1 {
        0%, 100% {
          opacity: 0;
          transform: scale(0) rotate(0deg);
        }
        50% {
          opacity: 1;
          transform: scale(1) rotate(180deg);
        }
      }

      @keyframes sparkle2 {
        0%, 100% {
          opacity: 0;
          transform: scale(0) rotate(0deg);
        }
        60% {
          opacity: 1;
          transform: scale(1.2) rotate(270deg);
        }
      }

      @keyframes sparkle3 {
        0%, 100% {
          opacity: 0;
          transform: scale(0) rotate(0deg);
        }
        40% {
          opacity: 1;
          transform: scale(0.8) rotate(90deg);
        }
      }

      @keyframes sparkle4 {
        0%, 100% {
          opacity: 0;
          transform: scale(0) rotate(0deg);
        }
        70% {
          opacity: 1;
          transform: scale(1.5) rotate(360deg);
        }
      }

      .animate-epicRipple {
        animation: epicRipple 0.8s ease-out forwards;
      }

      .animate-epicCheckIn {
        animation: epicCheckIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
      }

      .animate-epicCheckOut {
        animation: epicCheckOut 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
      }

      .animate-checkmarkDraw {
        animation: checkmarkDraw 0.3s ease-out 0.2s forwards;
      }

      .animate-checkmarkPath {
        animation: checkmarkPath 0.4s ease-out 0.3s forwards;
      }

      .animate-xMarkDraw {
        animation: xMarkDraw 0.3s ease-out forwards;
      }

      .animate-sparkle1 {
        animation: sparkle1 0.8s ease-out 0.4s forwards;
      }

      .animate-sparkle2 {
        animation: sparkle2 0.9s ease-out 0.5s forwards;
      }

      .animate-sparkle3 {
        animation: sparkle3 0.7s ease-out 0.3s forwards;
      }

      .animate-sparkle4 {
        animation: sparkle4 1s ease-out 0.6s forwards;
      }

      @media (max-width: 480px) {
        .xs\\:hidden {
          display: none;
        }
        .xs\\:inline {
          display: inline;
        }
      }
    `}</style>
    </button>
  )
}
