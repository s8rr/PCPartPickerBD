"use client"

import type React from "react"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"

interface Product {
  id?: string
  name: string
  price: string
  image: string
  availability: string
  source: string
  url: string
}

interface ProductCardProps {
  product: Product
  addToCompare: (e: React.MouseEvent, product: Product) => void
}

export function ProductCard({ product, addToCompare }: ProductCardProps) {
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
      {product.id ? (
        // If product has an ID (from database), link to product detail page
        <Link href={`/product/${product.id}`} className="flex flex-col h-full">
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
      ) : (
        // If product doesn't have an ID (from scraping), link to external site
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
      )}
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
