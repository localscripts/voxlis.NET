"use client"

import { X, Star, Shield, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import Link from "next/link"

interface ExecutorsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ExecutorsModal({ isOpen, onClose }: ExecutorsModalProps) {
  const [isClosing, setIsClosing] = useState(false)

  const executors = [
    { name: "Zenith", price: "From $1.00", icon: "⚡", description: "Premium script executor with advanced features" },
    { name: "Ronin", price: "From $2.20", icon: "⚔️", description: "Powerful and reliable execution engine" },
    { name: "Wave", price: "From $1.00", icon: "🌊", description: "Smooth and efficient script runner" },
    { name: "Exoliner", price: "From $1.00", icon: "🚀", description: "High-performance executor for professionals" },
    { name: "Cryptic", price: "From $1.00", icon: "🔒", description: "Secure and fast script execution" },
    { name: "Arceus X", price: "From $1.00", icon: "⭐", description: "Advanced executor with premium tools" },
    { name: "Fluxus", price: "From $1.00", icon: "🔥", description: "Versatile executor for all your needs" },
  ]

  const features = [
    { icon: Shield, text: "Secure & Trusted", color: "text-blue-600 dark:text-blue-400" },
    { icon: Zap, text: "Instant Delivery", color: "text-green-600 dark:text-green-400" },
    { icon: Star, text: "Premium Quality", color: "text-purple-600 dark:text-purple-400" },
  ]

  const handleCloseModal = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
      setIsClosing(false)
    }, 200)
  }

  // Reset states when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsClosing(false)
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        handleCloseModal()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Modal Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 dark:bg-black/80 z-[130] backdrop-blur-sm"
        style={{
          opacity: isClosing ? 0 : 1,
          animation: isClosing ? "fadeOut 0.2s ease-out forwards" : "fadeIn 0.2s ease-out forwards",
        }}
        onClick={handleCloseModal}
      />

      {/* Modal */}
      <div
        data-executors-modal
        className="fixed left-1/2 top-1/2 w-[95%] max-w-4xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl z-[140] overflow-hidden select-none max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700"
        style={{
          opacity: isClosing ? 0 : 1,
          transform: isClosing
            ? "translate(-50%, calc(-50% + 30px)) scale(0.9) rotateX(8deg)"
            : "translate(-50%, -50%) scale(1) rotateX(0deg)",
          animation: isClosing
            ? "executorModalOut 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards"
            : "executorModalIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
        }}
      >
        <div className="p-6 md:p-8">
          {/* Header */}
          <div
            className="flex items-center justify-between mb-6"
            style={{
              opacity: isClosing ? 0 : 0,
              animation: isClosing ? "fadeOut 0.1s ease-out forwards" : "fadeIn 0.3s ease-out 0.15s forwards",
            }}
          >
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Choose Your Executor</h2>
              <p className="text-gray-600 dark:text-gray-400">Premium script execution tools for all your needs</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCloseModal}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 h-10 w-10 flex-shrink-0"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Features Banner */}
          <div
            className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6"
            style={{
              opacity: isClosing ? 0 : 0,
              animation: isClosing ? "fadeOut 0.1s ease-out forwards" : "fadeIn 0.3s ease-out 0.25s forwards",
            }}
          >
            <div className="flex flex-wrap items-center justify-center gap-6">
              {features.map((feature, index) => {
                const IconComponent = feature.icon
                return (
                  <div key={index} className="flex items-center gap-2">
                    <IconComponent className={`h-5 w-5 ${feature.color}`} />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{feature.text}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Executors List Layout */}
          <div
            className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 mb-6"
            style={{
              opacity: isClosing ? 0 : 0,
              animation: isClosing ? "fadeOut 0.1s ease-out forwards" : "fadeIn 0.3s ease-out 0.35s forwards",
            }}
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 uppercase tracking-wider">
              EXECUTORS
            </h3>

            <div className="space-y-3">
              {executors.map((executor, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 hover:shadow-md transition-all duration-300 group cursor-pointer"
                  style={{
                    opacity: isClosing ? 0 : 0,
                    transform: "translateX(-50px) scale(0.9)",
                    animation: isClosing
                      ? "executorItemOut 0.2s ease-out forwards"
                      : `executorItemIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${0.45 + index * 0.08}s forwards`,
                  }}
                  onClick={() => {
                    console.log(`Selected ${executor.name}`)
                    handleCloseModal()
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 rounded-lg flex items-center justify-center">
                      <span className="text-lg">{executor.icon}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                        {executor.name}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{executor.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors">
                      {executor.price}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* View All Executors Button */}
            <div
              className="mt-6"
              style={{
                opacity: isClosing ? 0 : 0,
                animation: isClosing ? "fadeOut 0.1s ease-out forwards" : "fadeIn 0.3s ease-out 0.75s forwards",
              }}
            >
              <Link
                href="/selections"
                className="w-full block text-center py-4 px-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden group uppercase tracking-wide"
                onClick={handleCloseModal}
              >
                <span className="relative z-10">VIEW ALL EXECUTORS</span>
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </Link>
            </div>
          </div>

          {/* Additional Actions */}
          <div
            className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700"
            style={{
              opacity: isClosing ? 0 : 0,
              animation: isClosing ? "fadeOut 0.1s ease-out forwards" : "fadeIn 0.3s ease-out 0.85s forwards",
            }}
          >
            <Link
              href="/resellers"
              className="flex-1 text-center py-3 px-6 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-300 transform hover:scale-105"
              onClick={handleCloseModal}
            >
              Compare Prices
            </Link>
            <button
              onClick={handleCloseModal}
              className="flex-1 py-3 px-6 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              Browse Later
            </button>
          </div>
        </div>

        <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes fadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
        
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: translate(-50%, calc(-50% - 10px)) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
        
        @keyframes fadeOutScale {
          from {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          to {
            opacity: 0;
            transform: translate(-50%, calc(-50% - 10px)) scale(0.95);
          }
        }

        @keyframes executorModalIn {
          0% {
            opacity: 0;
            transform: translate(-50%, calc(-50% + 40px)) scale(0.9) rotateX(12deg);
          }
          60% {
            opacity: 1;
            transform: translate(-50%, calc(-50% - 8px)) scale(1.01) rotateX(-3deg);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1) rotateX(0deg);
          }
        }

        @keyframes executorModalOut {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1) rotateX(0deg);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, calc(-50% + 30px)) scale(0.9) rotateX(8deg);
          }
        }

        @keyframes executorItemIn {
          0% {
            opacity: 0;
            transform: translateX(-50px) scale(0.9);
          }
          60% {
            opacity: 1;
            transform: translateX(5px) scale(1.02);
          }
          100% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }

        @keyframes executorItemOut {
          0% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateX(-30px) scale(0.95);
          }
        }
      `}</style>
      </div>
    </>
  )
}
