"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import Image from "next/image"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ShoppingCart,
  Cpu,
  Search,
  ArrowRight,
  ExternalLink,
  MonitorIcon,
  HardDrive,
  CpuIcon as Gpu,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { AttentionBanner } from "@/components/attention-banner"

interface Product {
  name: string
  price: string
  image: string
  availability: string
  source: string
  url: string
}

export default function Home() {
  const [query, setQuery] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [compareList, setCompareList] = useState<Product[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [productsPerPage] = useState(20) // Number of products to show per retailer
  const router = useRouter()

  // Load compare list from localStorage on component mount
  useEffect(() => {
    const savedCompareList = localStorage.getItem("compareList")
    if (savedCompareList) {
      setCompareList(JSON.parse(savedCompareList))
    }
  }, [])

  // Save compare list to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("compareList", JSON.stringify(compareList))
  }, [compareList])

  const searchProducts = async (resetPage = true) => {
    if (!query.trim()) return

    if (resetPage) {
      setPage(1)
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/products?query=${encodeURIComponent(query)}&limit=${productsPerPage}`)

      if (!response.ok) {
        throw new Error("Failed to fetch products")
      }

      const data = await response.json()
      setProducts(data.products)

      // Set hasMore based on whether we got a full page of results
      setHasMore(data.products.length >= productsPerPage * 6) // 6 retailers
    } catch (err) {
      setError("An error occurred while fetching products")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadMoreProducts = async () => {
    const nextPage = page + 1
    setPage(nextPage)

    // You could implement pagination on the backend and fetch more products here
    // For now, we'll just simulate it by showing a loading state
    setLoading(true)

    // Simulate loading delay
    setTimeout(() => {
      setLoading(false)
      setHasMore(false) // No more products after this page
    }, 1000)
  }

  const addToCompare = (e: React.MouseEvent, product: Product) => {
    e.preventDefault()
    e.stopPropagation()

    // Check if product is already in compare list
    if (!compareList.some((item) => item.name === product.name && item.source === product.source)) {
      setCompareList([...compareList, product])
    }
  }

  const goToComparePage = () => {
    router.push("/compare")
  }

  const goToBuildPage = () => {
    router.push("/build")
  }

  // Group products by source
  const startechProducts = products.filter((product) => product.source === "Startech")
  const techlandProducts = products.filter((product) => product.source === "Techland")
  const ultratechProducts = products.filter((product) => product.source === "UltraTech")
  const potakaitProducts = products.filter((product) => product.source === "Potaka IT")
  const pchouseProducts = products.filter((product) => product.source === "PC House")
  const skylandProducts = products.filter((product) => product.source === "Skyland")

  // Product card skeleton for loading state
  const ProductCardSkeleton = () => (
    <div className="flex flex-col w-[220px] min-w-[220px] bg-background border rounded-lg overflow-hidden">
      <Skeleton className="h-[180px]" />
      <div className="p-4 flex flex-col gap-2">
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-5 w-1/2 mb-2" />
        <Skeleton className="h-9 w-full mt-1" />
      </div>
    </div>
  )

  return (
    <main className="min-h-screen">
      <AttentionBanner />
      <SiteHeader />

      {/* Hero section with search */}
      <div className="bg-gradient-to-b from-background to-muted/50 border-b">
        <div className="container mx-auto py-16 px-4">
          <p className="text-muted-foreground max-w-2xl mb-8">
            Compare prices across multiple tech retailers in Bangladesh. Find the best deals on CPUs, GPUs, monitors,
            and more. Build your dream PC with our PC Builder tool.
          </p>

          <div className="flex gap-2 mb-8 max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for products..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchProducts()}
                className="pl-10"
              />
            </div>
            <Button onClick={() => searchProducts()} disabled={loading} className="min-w-[100px]">
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

          {error && (
            <div className="bg-destructive/10 text-destructive rounded-lg p-4 mb-8">
              <p>{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Results section */}
      <div className="container mx-auto py-8 px-4 pb-24">
        {loading && products.length === 0 ? (
          <div className="space-y-12">
            {/* Skeleton for StarTech Products */}
            <div className="bg-card rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <Skeleton className="h-10 w-32" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {Array(5)
                  .fill(0)
                  .map((_, index) => (
                    <ProductCardSkeleton key={`startech-skeleton-${index}`} />
                  ))}
              </div>
            </div>

            {/* Skeleton for TechLand Products */}
            <div className="bg-card rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <Skeleton className="h-10 w-32" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {Array(5)
                  .fill(0)
                  .map((_, index) => (
                    <ProductCardSkeleton key={`techland-skeleton-${index}`} />
                  ))}
              </div>
            </div>

            {/* Skeleton for UltraTech Products */}
            <div className="bg-card rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <Skeleton className="h-10 w-32" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {Array(5)
                  .fill(0)
                  .map((_, index) => (
                    <ProductCardSkeleton key={`ultratech-skeleton-${index}`} />
                  ))}
              </div>
            </div>
          </div>
        ) : products.length > 0 ? (
          <div className="space-y-12">
            {/* StarTech Products */}
            {startechProducts.length > 0 && (
              <div className="bg-card rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-blue-900 p-2 rounded-md flex items-center justify-center h-10 w-10">
                    <span className="text-white font-bold">ST</span>
                  </div>
                  <h2 className="text-2xl font-semibold">StarTech</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {startechProducts.map((product, index) => (
                    <ProductCard key={`startech-${index}`} product={product} addToCompare={addToCompare} />
                  ))}
                </div>
              </div>
            )}

            {/* TechLand Products */}
            {techlandProducts.length > 0 && (
              <div className="bg-card rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gray-900 p-2 rounded-md flex items-center justify-center h-10 w-10">
                    <span className="text-white font-bold">TL</span>
                  </div>
                  <h2 className="text-2xl font-semibold">TechLand</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {techlandProducts.map((product, index) => (
                    <ProductCard key={`techland-${index}`} product={product} addToCompare={addToCompare} />
                  ))}
                </div>
              </div>
            )}

            {/* UltraTech Products */}
            {ultratechProducts.length > 0 && (
              <div className="bg-card rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-purple-900 p-2 rounded-md flex items-center justify-center h-10 w-10">
                    <span className="text-white font-bold">UT</span>
                  </div>
                  <h2 className="text-2xl font-semibold">UltraTech</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {ultratechProducts.map((product, index) => (
                    <ProductCard key={`ultratech-${index}`} product={product} addToCompare={addToCompare} />
                  ))}
                </div>
              </div>
            )}

            {/* Potaka IT Products */}
            {potakaitProducts.length > 0 && (
              <div className="bg-card rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-green-900 p-2 rounded-md flex items-center justify-center h-10 w-10">
                    <span className="text-white font-bold">PI</span>
                  </div>
                  <h2 className="text-2xl font-semibold">Potaka IT</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {potakaitProducts.map((product, index) => (
                    <ProductCard key={`potakait-${index}`} product={product} addToCompare={addToCompare} />
                  ))}
                </div>
              </div>
            )}

            {/* PC House Products */}
            {pchouseProducts.length > 0 && (
              <div className="bg-card rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-red-900 p-2 rounded-md flex items-center justify-center h-10 w-10">
                    <span className="text-white font-bold">PC</span>
                  </div>
                  <h2 className="text-2xl font-semibold">PC House</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {pchouseProducts.map((product, index) => (
                    <ProductCard key={`pchouse-${index}`} product={product} addToCompare={addToCompare} />
                  ))}
                </div>
              </div>
            )}

            {/* Skyland Products */}
            {skylandProducts.length > 0 && (
              <div className="bg-card rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-teal-900 p-2 rounded-md flex items-center justify-center h-10 w-10">
                    <span className="text-white font-bold">SK</span>
                  </div>
                  <h2 className="text-2xl font-semibold">Skyland</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {skylandProducts.map((product, index) => (
                    <ProductCard key={`skyland-${index}`} product={product} addToCompare={addToCompare} />
                  ))}
                </div>
              </div>
            )}

            {/* Pagination controls */}
            {hasMore && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1 || loading}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground px-2">Page {page}</span>
                  <Button variant="outline" size="sm" onClick={loadMoreProducts} disabled={!hasMore || loading}>
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {/* Loading indicator for pagination */}
            {loading && products.length > 0 && (
              <div className="flex justify-center mt-6">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading more products...</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          !loading && (
            <div className="text-center py-16">
              <div className="bg-muted rounded-full p-4 inline-flex mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">No products found</h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-8">
                Search for products to compare prices across different retailers.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="outline" onClick={goToBuildPage} className="gap-2">
                  <Cpu className="h-4 w-4" />
                  Build a PC
                </Button>
                <Button
                  onClick={() => {
                    setQuery("ryzen")
                    searchProducts()
                  }}
                >
                  Search for Ryzen CPUs
                </Button>
              </div>
            </div>
          )
        )}

        {/* Quick links section - Updated with Lucide icons */}
        {!loading && products.length === 0 && (
          <div className="mt-16 border-t pt-12">
            <h2 className="text-2xl font-semibold mb-6 text-center">Popular Categories</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: "CPUs", icon: Cpu, link: "/build/components/cpu" },
                { name: "Graphics Cards", icon: Gpu, link: "/build/components/video-card" },
                { name: "Monitors", icon: MonitorIcon, link: "/build/components/monitor" },
                { name: "Storage", icon: HardDrive, link: "/build/components/storage" },
              ].map((category) => (
                <Link href={category.link} key={category.name}>
                  <div className="border rounded-lg p-6 text-center hover:border-primary hover:bg-primary/5 transition-colors">
                    <div className="flex justify-center mb-3">
                      <category.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-medium">{category.name}</h3>
                    <div className="flex items-center justify-center mt-2 text-primary text-sm">
                      <span>Browse</span>
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer - Updated copyright year */}
      <footer className="border-t bg-muted/50">
        <div className="container mx-auto py-8 px-4">
          <div className="flex flex-col md:flex-row justify-between items-start">
            <div>
              <p className="text-sm text-muted-foreground mb-4">© 2025 PCPartPickerBD. All rights reserved.</p>
              <div className="flex gap-4">
                <Link href="/build" className="text-sm text-muted-foreground hover:text-foreground">
                  PC Builder
                </Link>
                <Link href="/compare" className="text-sm text-muted-foreground hover:text-foreground">
                  Compare Products
                </Link>
              </div>
            </div>

            <div className="mt-4 md:mt-0 flex flex-col items-end">
              <div className="text-sm text-muted-foreground">
                Developed by{" "}
                <a
                  href="https://sabbir.lol"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Sabbir
                </a>
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Supported by{" "}
                <a
                  href="https://unknownport.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  unknownport.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Compare Button */}
      {compareList.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button onClick={goToComparePage} size="lg" className="rounded-full shadow-lg">
            <ShoppingCart className="mr-2 h-5 w-5" />
            Compare ({compareList.length})
          </Button>
        </div>
      )}
    </main>
  )
}

interface ProductCardProps {
  product: Product
  addToCompare: (e: React.MouseEvent, product: Product) => void
}

function ProductCard({ product, addToCompare }: ProductCardProps) {
  // Function to handle price display
  const renderPrice = () => {
    // Check if price contains multiple prices (e.g., "৳ 12,500 ৳ 13,000")
    if (product.price.includes("৳") && product.price.split("৳").length > 2) {
      const prices = product.price.split("৳").filter((p) => p.trim())

      // If we have at least two prices
      if (prices.length >= 2) {
        return (
          <div>
            <p className="text-lg font-bold">৳{prices[0].trim()}</p>
            <p className="text-sm text-muted-foreground line-through">৳{prices[1].trim()}</p>
          </div>
        )
      }
    }

    // Regular price display
    return <p className="text-lg font-bold">{product.price}</p>
  }

  return (
    <div className="group flex flex-col bg-background border rounded-lg overflow-hidden hover:shadow-md transition-all duration-300 h-full">
      <Link href={product.url} target="_blank" rel="noopener noreferrer" className="flex flex-col h-full">
        <div className="relative h-[180px] bg-white p-4 flex items-center justify-center">
          {product.image ? (
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">No image</div>
          )}
          {/* Source badge */}
          <div className="absolute top-2 left-2">
            <div
              className={`text-xs px-2 py-1 rounded-md ${
                product.source === "Startech"
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
              }`}
            >
              {product.source}
            </div>
          </div>
          {/* Availability badge */}
          {product.availability === "In Stock" && (
            <div className="absolute top-2 right-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 text-xs px-2 py-1 rounded-md">
              In Stock
            </div>
          )}
        </div>
        <div className="p-4 flex flex-col gap-2 flex-grow">
          <h3 className="text-sm font-medium line-clamp-2 min-h-[2.5rem]">{product.name}</h3>
          <div className="mt-auto">
            {renderPrice()}
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1 group-hover:text-primary transition-colors">
              <span>View details</span>
              <ExternalLink className="h-3 w-3" />
            </div>
          </div>
        </div>
      </Link>
      <div className="px-4 pb-4">
        <Button
          variant="outline"
          size="sm"
          className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
          onClick={(e) => addToCompare(e, product)}
        >
          Add to compare
        </Button>
      </div>
    </div>
  )
}
