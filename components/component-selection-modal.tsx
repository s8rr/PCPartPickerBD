"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import Image from "next/image"

interface ComponentSelectionModalProps {
  componentType: string
  onSelect: (component: any) => void
  trigger: React.ReactNode
}

export function ComponentSelectionModal({ componentType, onSelect, trigger }: ComponentSelectionModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setLoading(true)
    // This would be replaced with an actual API call
    try {
      const response = await fetch(`/api/products?query=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()
      setResults(data.products || [])
    } catch (error) {
      console.error("Error searching components:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select a {componentType}</DialogTitle>
          <DialogDescription>Search for a {componentType.toLowerCase()} to add to your build.</DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 my-4">
          <Input
            placeholder={`Search for ${componentType.toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1"
          />
          <Button onClick={handleSearch} disabled={loading}>
            <Search className="h-4 w-4 mr-2" />
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>

        {results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {results.map((component: any, index: number) => (
              <div
                key={index}
                className="border rounded-lg p-3 flex gap-3 hover:bg-muted cursor-pointer"
                onClick={() => onSelect(component)}
              >
                <div className="w-16 h-16 bg-white rounded flex-shrink-0 relative">
                  {component.image ? (
                    <Image
                      src={component.image || "/placeholder.svg"}
                      alt={component.name}
                      fill
                      className="object-contain p-1"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
                      No image
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-sm line-clamp-2">{component.name}</h3>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-bold">{component.price}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        component.availability === "In Stock"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                      }`}
                    >
                      {component.availability}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {loading ? "Searching..." : "Search for components to see results"}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
