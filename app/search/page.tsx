"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { Search, Loader2 } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { AttentionBanner } from "@/components/attention-banner"

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSearch = () => {
    if (!query.trim()) return

    setLoading(true)

    // Redirect to home page with search query and a timestamp to ensure uniqueness
    router.push(`/?query=${encodeURIComponent(query)}&t=${Date.now()}`)
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Search Products</h1>

        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for products..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10"
            />
          </div>

          <Button onClick={handleSearch} disabled={loading} className="w-full">
            {loading ? (
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Searching...
              </div>
            ) : (
              "Search"
            )}
          </Button>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-medium mb-4">Popular Searches</h2>
          <div className="flex flex-wrap gap-2">
            {["Ryzen CPU", "RTX 4060", "DDR4 RAM", "SSD", "Gaming Monitor"].map((term) => (
              <Button
                key={term}
                variant="outline"
                size="sm"
                onClick={() => {
                  setQuery(term)
                  handleSearch()
                }}
              >
                {term}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
