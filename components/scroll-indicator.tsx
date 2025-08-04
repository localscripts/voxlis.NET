"use client"

import { ArrowDown } from "lucide-react"

interface ScrollIndicatorProps {
  show: boolean
}

export default function ScrollIndicator({ show }: ScrollIndicatorProps) {
  return (
    <div
      className="fixed bottom-8 left-8 z-50 pointer-events-none transition-all duration-500"
      style={{
        opacity: show ? 1 : 0,
        transform: show ? "translateY(0) scale(1)" : "translateY(30px) scale(0.9)",
      }}
      id="scroll-indicator"
    >
      <div className="flex flex-col items-center">
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2 font-medium select-none">Scroll to explore</div>
        <div className="h-10 border-2 border-gray-300 dark:border-gray-600 rounded-xl flex justify-center relative w-10 select-none bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg">
          {ArrowDown && (
            <ArrowDown
              className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-2 transition-colors duration-300"
              style={{
                animation: "scrollBounce 2s ease-in-out infinite",
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
