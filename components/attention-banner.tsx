"use client"

import { AlertTriangle } from "lucide-react"
import { useState } from "react"

export function AttentionBanner() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="bg-amber-500 text-black py-2 relative">
      <div className="container mx-auto px-4 flex items-center justify-center">
        <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
        <p className="text-sm font-medium text-center">
          This site is a work in progress. Some features may not be fully functional.
        </p>
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-black hover:text-gray-800"
          aria-label="Close banner"
        >
          ×
        </button>
      </div>
    </div>
  )
}
