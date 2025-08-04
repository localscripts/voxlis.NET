"use client"

import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { useState, useEffect } from "react"

interface PaginationModalProps {
  isOpen: boolean
  onClose: () => void
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  totalItems: number
  itemsPerPage: number
}

export default function PaginationModal({
  isOpen,
  onClose,
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
}: PaginationModalProps) {
  const [isClosing, setIsClosing] = useState(false)

  const handleCloseModal = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
      setIsClosing(false)
    }, 200)
  }

  const handlePageChange = (page: number) => {
    onPageChange(page)
    handleCloseModal()
  }

  const goToPrevious = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1)
    }
  }

  const goToNext = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1)
    }
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
      if (event.key === "ArrowLeft" && isOpen && currentPage > 1) {
        handlePageChange(currentPage - 1)
      }
      if (event.key === "ArrowRight" && isOpen && currentPage < totalPages) {
        handlePageChange(currentPage + 1)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, currentPage, totalPages])

  if (!isOpen) return null

  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  // Generate page numbers with smart truncation
  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 7

    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Smart truncation logic
      if (currentPage <= 4) {
        // Show first pages + ellipsis + last
        for (let i = 1; i <= 5; i++) pages.push(i)
        pages.push("...")
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 3) {
        // Show first + ellipsis + last pages
        pages.push(1)
        pages.push("...")
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i)
      } else {
        // Show first + ellipsis + current area + ellipsis + last
        pages.push(1)
        pages.push("...")
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i)
        pages.push("...")
        pages.push(totalPages)
      }
    }

    return pages
  }

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
        data-pagination-modal
        className="fixed left-1/2 top-1/2 w-[95%] max-w-7xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl z-[140] overflow-hidden select-none border border-gray-200 dark:border-gray-700"
        style={{
          opacity: isClosing ? 0 : 1,
          transform: isClosing
            ? "translate(-50%, calc(-50% + 30px)) scale(0.95) rotateX(8deg)"
            : "translate(-50%, -50%) scale(1) rotateX(0deg)",
          animation: isClosing
            ? "paginationModalOut 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards"
            : "paginationModalIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700"
          style={{
            opacity: isClosing ? 0 : 0,
            animation: isClosing ? "fadeOut 0.1s ease-out forwards" : "fadeIn 0.3s ease-out 0.15s forwards",
          }}
        >
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Navigate Pages</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Showing {startItem}-{endItem} of {totalItems} items
            </p>
          </div>
          <button
            onClick={handleCloseModal}
            className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg p-2 transition-all duration-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Pagination Content */}
        <div
          className="p-8"
          style={{
            opacity: isClosing ? 0 : 0,
            animation: isClosing ? "fadeOut 0.1s ease-out forwards" : "fadeIn 0.3s ease-out 0.25s forwards",
          }}
        >
          {/* Main Navigation */}
          <div className="flex items-center justify-center gap-4 mb-8">
            {/* Previous Button */}
            <button
              onClick={goToPrevious}
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-gray-700 dark:text-gray-300 shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>

            {/* Page Numbers */}
            <div className="flex gap-2">
              {getPageNumbers().map((page, index) => (
                <div key={index}>
                  {page === "..." ? (
                    <span className="w-12 h-12 flex items-center justify-center text-gray-400 dark:text-gray-500 font-medium">
                      ...
                    </span>
                  ) : (
                    <button
                      onClick={() => handlePageChange(page as number)}
                      className={`w-12 h-12 rounded-xl font-bold transition-all duration-200 shadow-sm ${
                        currentPage === page
                          ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg transform scale-110"
                          : "bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 hover:scale-105"
                      }`}
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
              className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-gray-700 dark:text-gray-300 shadow-sm"
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Jump Section */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 text-center">Quick Navigation</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="px-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-white dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-gray-700 dark:text-gray-300 text-center"
              >
                First Page
              </button>
              <button
                onClick={() => handlePageChange(Math.ceil(totalPages / 4))}
                className="px-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-white dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200 font-medium text-gray-700 dark:text-gray-300 text-center"
              >
                Page {Math.ceil(totalPages / 4)}
              </button>
              <button
                onClick={() => handlePageChange(Math.ceil(totalPages / 2))}
                className="px-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-white dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200 font-medium text-gray-700 dark:text-gray-300 text-center"
              >
                Middle
              </button>
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="px-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-white dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-gray-700 dark:text-gray-300 text-center"
              >
                Last Page
              </button>
            </div>
          </div>

          {/* Keyboard Shortcuts Info */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Use <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs font-mono">←</kbd> and{" "}
              <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs font-mono">→</kbd> arrow keys to
              navigate, or <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs font-mono">Esc</kbd>{" "}
              to close
            </p>
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

          @keyframes paginationModalIn {
            0% {
              opacity: 0;
              transform: translate(-50%, calc(-50% + 40px)) scale(0.95) rotateX(12deg);
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

          @keyframes paginationModalOut {
            0% {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1) rotateX(0deg);
            }
            100% {
              opacity: 0;
              transform: translate(-50%, calc(-50% + 30px)) scale(0.95) rotateX(8deg);
            }
          }
        `}</style>
      </div>
    </>
  )
}
