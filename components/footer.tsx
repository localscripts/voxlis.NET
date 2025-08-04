"use client"

import { Heart, Shield, Zap, Star, MessageCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    products: [
      { name: "Executors", href: "/executors" },
      { name: "Scripts", href: "/scripts" },
      { name: "Selections", href: "/selections" },
    ],
    support: [
      { name: "Discord Support", href: "/discord" },
      { name: "Report Issue", href: "#", onClick: true },
    ],
    company: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
    ],
    community: [
      { name: "Discord Server", href: "/discord" },
    ],
  }

  const features = [
    { icon: Shield, text: "Secure Transactions" },
    { icon: Zap, text: "Instant Delivery" },
    { icon: Star, text: "Premium Quality" },
    { icon: MessageCircle, text: "24/7 Support" },
  ]

  return (
    <footer className="bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 border-t border-gray-200 dark:border-gray-800 mt-16 animate-fadeInUp shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-2 animate-slideInLeft">
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/images/key-empire-logo.png"
                alt="Key-Empire"
                width={160}
                height={40}
                className="h-8 w-auto select-none drop-shadow-lg"
                draggable={false}
                style={{
                  filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15))",
                }}
              />
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 max-w-sm">
              Your trusted marketplace for premium executors, scripts, and tools. Join thousands of satisfied customers
              worldwide.
            </p>

            {/* Features */}
            <div className="grid grid-cols-2 gap-3">
              {features.map((feature, index) => {
                const IconComponent = feature.icon
                return (
                  <div key={index} className="flex items-center gap-2">
                    <IconComponent className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">{feature.text}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Products */}
          <div className="animate-popInDelay1">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Products</h3>
            <ul className="space-y-3">
              {footerLinks.products.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="animate-popInDelay2">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link, index) => (
                <li key={index}>
                  {link.onClick ? (
                    <button
                      onClick={() => {
                        // This would trigger the report modal
                        const reportButton = document.querySelector("[data-report-trigger]") as HTMLButtonElement
                        if (reportButton) reportButton.click()
                      }}
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200 text-left"
                    >
                      {link.name}
                    </button>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="animate-popInDelay3">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div className="animate-popInDelay4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Community</h3>
            <ul className="space-y-3">
              {footerLinks.community.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-gray-200 dark:border-gray-700 animate-fadeInUp">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4 md:mb-0">
            <span>© {currentYear} Key-Empire. Made with</span>
            <Heart className="h-4 w-4 text-red-500 fill-current" />
            <span>
              <br />
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">All systems operational</span>
            </div>
            <Link
              href="/discord"
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-800 rounded-lg transition-colors duration-200 group shadow-md"
            >
              <Image
                src="/images/discord-icon.svg"
                alt="Discord"
                width={16}
                height={16}
                className="h-4 w-4 group-hover:scale-110 transition-transform duration-200"
                draggable={false}
              />
              <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">Join Discord</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
