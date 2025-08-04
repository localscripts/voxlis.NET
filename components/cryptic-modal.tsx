"use client"

import { Shield, X } from "lucide-react"
import { useState, useEffect } from "react"
import Image from "next/image"

interface CrypticModalProps {
  isOpen: boolean
  onClose: () => void
  onPlatformSelect: (platform: string) => void
}

export default function CrypticModal({ isOpen, onClose, onPlatformSelect }: CrypticModalProps) {
  const [isClosing, setIsClosing] = useState(false)

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

  const allPlatforms = [
    {
      name: "Windows",
      icon: "/placeholder.svg?height=48&width=48",
    },
    {
      name: "macOS",
      icon: "/placeholder.svg?height=48&width=48",
    },
    {
      name: "iOS",
      icon: "/placeholder.svg?height=48&width=48",
    },
    {
      name: "Android",
      icon: "/placeholder.svg?height=48&width=48",
    },
  ]

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
        data-cryptic-modal
        className="fixed left-1/2 top-1/2 w-[95%] max-w-lg bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl z-[140] overflow-hidden select-none border border-gray-200 dark:border-gray-700"
        style={{
          opacity: isClosing ? 0 : 1,
          transform: isClosing
            ? "translate(-50%, calc(-50% + 30px)) scale(0.9) rotateX(8deg)"
            : "translate(-50%, -50%) scale(1) rotateX(0deg)",
          animation: isClosing
            ? "getStartedModalOut 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards"
            : "getStartedModalIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
        }}
      >
        {/* Header */}
        <div
          className="relative p-6 border-b border-gray-200 dark:border-gray-700"
          style={{
            opacity: isClosing ? 0 : 0,
            animation: isClosing ? "fadeOut 0.1s ease-out forwards" : "fadeIn 0.3s ease-out 0.15s forwards",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Cryptic: Choose Your Platform</h2>

            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg p-2 transition-all duration-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Platforms List */}
        <div
          className="p-4 max-h-80 overflow-y-auto custom-scrollbar"
          style={{
            opacity: isClosing ? 0 : 0,
            animation: isClosing ? "fadeOut 0.1s ease-out forwards" : "fadeIn 0.3s ease-out 0.25s forwards",
          }}
        >
          {allPlatforms.map((platform, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 mb-3 rounded-xl border transition-all duration-200 cursor-pointer group relative overflow-hidden border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md"
              style={{
                opacity: isClosing ? 0 : 0,
                transform: "translateX(-30px) scale(0.9)",
                animation: isClosing
                  ? "executorItemOut 0.2s ease-out forwards"
                  : `executorItemIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${0.35 + index * 0.05}s forwards`,
              }}
              onClick={() => {
                onPlatformSelect(platform.name.toLowerCase())
                handleCloseModal()
              }}
            >
              {/* Main Content */}
              <div className="flex items-center gap-4 flex-1">
                {/* Icon */}
                <div className="w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-200 overflow-hidden relative bg-gray-100 dark:bg-gray-700 group-hover:bg-green-100 dark:group-hover:bg-green-900/30">
                  <Image
                    src={platform.icon || "/placeholder.svg"}
                    alt={platform.name}
                    fill
                    className="object-cover"
                    draggable={false}
                  />
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg transition-colors text-gray-900 dark:text-gray-100 group-hover:text-green-700 dark:group-hover:text-green-300">
                    {platform.name}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
          style={{
            opacity: isClosing ? 0 : 0,
            animation: isClosing ? "fadeOut 0.1s ease-out forwards" : "fadeIn 0.3s ease-out 0.75s forwards",
          }}
        >
          {/* Security Text */}
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 justify-center">
            <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span>Secure downloads & instant access</span>
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

        @keyframes getStartedModalIn {
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

        @keyframes getStartedModalOut {
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
            transform: translateX(-30px) scale(0.9);
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
            transform: translateX(-20px) scale(0.95);
          }
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 3px;
        }

        .dark .custom-scrollbar::-webkit-scrollbar-track {
          background: #374151;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }

        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #6b7280;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }

        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
      </div>
    </>
  )
}
