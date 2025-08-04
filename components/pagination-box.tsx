"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationBoxProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  totalItems: number
  itemsPerPage: number
  className?: string
}

export default function PaginationBox({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  className = "",
}: PaginationBoxProps) {
  const goToPrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1)
    }
  }

  const goToNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1)
    }
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  // Generate visible page numbers with smart truncation
  const getVisiblePages = () => {
    const pages = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Smart truncation
      if (currentPage <= 3) {
        // Show first pages + ellipsis + last
        for (let i = 1; i <= 4; i++) pages.push(i)
        pages.push("...")
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        // Show first + ellipsis + last pages
        pages.push(1)
        pages.push("...")
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i)
      } else {
        // Show first + ellipsis + current area + ellipsis + last
        pages.push(1)
        pages.push("...")
        pages.push(currentPage - 1)
        pages.push(currentPage)
        pages.push(currentPage + 1)
        pages.push("...")
        pages.push(totalPages)
      }
    }

    return pages
  }

  if (totalPages <= 1) return null

  return (
    <div className={`w-full max-w-7xl mx-auto ${className}`}>
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl border-2 border-gray-200 dark:border-gray-700 shadow-2xl p-4">
        {/* Main Pagination Controls */}
        <div className="flex items-center justify-center gap-3">
          {/* Previous Button */}
          <button
            onClick={goToPrevious}
            disabled={currentPage === 1}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:shadow-md"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          {/* Page Numbers */}
          <div className="flex gap-1">
            {getVisiblePages().map((page, index) => (
              <div key={index}>
                {page === "..." ? (
                  <span className="w-10 h-10 flex items-center justify-center text-gray-400 dark:text-gray-500 font-medium">
                    ...
                  </span>
                ) : (
                  <button
                    onClick={() => onPageChange(page as number)}
                    className={`w-10 h-10 rounded-lg font-bold transition-all duration-300 shadow-sm ${
                      currentPage === page
                        ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg transform scale-110 ring-2 ring-green-200 dark:ring-green-800"
                        : "bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-green-400 dark:hover:border-green-500 hover:text-green-600 dark:hover:text-green-400 hover:scale-105 hover:shadow-md"
                    }`}
                    style={{
                      animation: currentPage === page ? "pageActive 0.3s ease-out" : undefined,
                    }}
                  >
                    {page}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Next Button */}
          <button
            onClick={goToNext}
            disabled={currentPage === totalPages}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:shadow-md"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <style jsx>{`
          @keyframes pageActive {
            0% {
              transform: scale(1);
              box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
            }
            50% {
              transform: scale(1.15);
              box-shadow: 0 0 0 8px rgba(34, 197, 94, 0.3);
            }
            100% {
              transform: scale(1.1);
              box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
            }
          }
        `}</style>
      </div>
    </div>
  )
}
