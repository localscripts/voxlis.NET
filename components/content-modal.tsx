"use client"

import { useState } from "react"
import { X, FileText, Download, Star, Shield } from "lucide-react"

interface ContentModalProps {
  isOpen: boolean
  onClose: () => void
  productName?: string
}

export default function ContentModal({ isOpen, onClose, productName }: ContentModalProps) {
  const [activeTab, setActiveTab] = useState("overview")

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{productName || "Product Details"}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Premium executor package</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {[
            { id: "overview", label: "Overview" },
            { id: "features", label: "Features" },
            { id: "reviews", label: "Reviews" },
            { id: "support", label: "Support" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Product Description</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  This premium executor offers advanced scripting capabilities with enhanced security features. Perfect
                  for both beginners and advanced users looking for reliable performance.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Download className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-gray-900 dark:text-gray-100">Downloads</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">15.2K</p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4 text-yellow-600" />
                    <span className="font-medium text-gray-900 dark:text-gray-100">Rating</span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-600">4.8/5</p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-gray-900 dark:text-gray-100">Security</span>
                  </div>
                  <p className="text-sm font-bold text-blue-600">Verified</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "features" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Key Features</h3>
              <ul className="space-y-3">
                {[
                  "Advanced script execution engine",
                  "Built-in security protection",
                  "User-friendly interface",
                  "Regular updates and support",
                  "Compatible with latest versions",
                  "24/7 customer support",
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">User Reviews</h3>
              <div className="space-y-4">
                {[
                  { name: "Alex M.", rating: 5, comment: "Excellent product! Works perfectly and great support." },
                  { name: "Sarah K.", rating: 4, comment: "Very reliable, would recommend to others." },
                  { name: "Mike R.", rating: 5, comment: "Best executor I've used so far. Worth every penny!" },
                ].map((review, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 dark:text-gray-100">{review.name}</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "support" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Support Information</h3>
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Installation Guide</h4>
                  <p className="text-blue-700 dark:text-blue-300 text-sm">
                    Step-by-step instructions are included with your purchase.
                  </p>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">24/7 Support</h4>
                  <p className="text-green-700 dark:text-green-300 text-sm">
                    Our support team is available around the clock to help you.
                  </p>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">Discord Community</h4>
                  <p className="text-purple-700 dark:text-purple-300 text-sm">
                    Join our Discord server for community support and updates.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
            <button className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              Purchase Now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
