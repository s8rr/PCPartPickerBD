"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, X } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

interface Product {
  name: string
  price: string
  image: string
  availability: string
  source: string
  url: string
}

export default function ComparePage() {
  const [compareList, setCompareList] = useState<Product[]>([])

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
  }, [])

  const removeFromCompare = (product: Product) => {
    setCompareList(compareList.filter((item) => !(item.name === product.name && item.source === product.source)))
  }

  // Function to determine if a product is in stock based on price
  const isInStock = (price: string): boolean => {
    // Check if the price contains any numeric characters
    return /[0-9]/.test(price)
  }

  // Function to handle price display
  const renderPrice = (price: string) => {
    // Check if price contains multiple prices (e.g., "৳ 12,500 ৳ 13,000")
    if (price.includes("৳") && price.split("৳").length > 2) {
      const prices = price.split("৳").filter((p) => p.trim())

      // If we have at least two prices
      if (prices.length >= 2) {
        return (
          <div>
            <p className="font-bold">৳{prices[0].trim()}</p>
            <p className="text-sm text-muted-foreground line-through">৳{prices[1].trim()}</p>
          </div>
        )
      }
    }

    // Regular price display
    return <span className="font-bold">{price}</span>
  }

  // For the empty state:
  if (compareList.length === 0) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto py-8 md:py-16 px-4 text-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Compare Products</h1>
          <p className="text-muted-foreground mb-6 md:mb-8">No products added to comparison list</p>
          <Link href="/">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Search
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // Mobile product card for small screens
  const MobileProductCard = ({ product }: { product: Product }) => (
    <div className="border rounded-lg overflow-hidden mb-4">
      <div className="flex items-center gap-3 p-3 bg-muted/30">
        <div
          className={`h-8 w-8 rounded ${
            product.source === "Startech"
              ? "bg-blue-900"
              : product.source === "Techland"
                ? "bg-gray-900"
                : product.source === "UltraTech"
                  ? "bg-purple-900"
                  : product.source === "Potaka IT"
                    ? "bg-green-900"
                    : product.source === "Skyland"
                      ? "bg-teal-900"
                      : "bg-red-900"
          } flex items-center justify-center text-white text-xs`}
        >
          {product.source === "Startech"
            ? "ST"
            : product.source === "Techland"
              ? "TL"
              : product.source === "UltraTech"
                ? "UT"
                : product.source === "Potaka IT"
                  ? "PI"
                  : product.source === "Skyland"
                    ? "SK"
                    : "PC"}
        </div>
        <span className="font-medium">{product.source}</span>
      </div>

      <div className="p-4">
        <div className="flex gap-4 mb-4">
          <div className="w-20 h-20 bg-white rounded-md relative flex-shrink-0">
            <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-contain p-1" />
          </div>
          <div>
            <h3 className="font-medium text-sm mb-1">{product.name}</h3>
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`px-2 py-0.5 rounded text-xs font-medium ${
                  isInStock(product.price)
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                }`}
              >
                {isInStock(product.price) ? "In Stock" : "Out of Stock"}
              </span>
              <div>{renderPrice(product.price)}</div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <a href={product.url} target="_blank" rel="noopener noreferrer" className="flex-1">
            <Button size="sm" className="w-full">
              Buy
            </Button>
          </a>
          <Button size="sm" variant="outline" onClick={() => removeFromCompare(product)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )

  // For the compare list view:
  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-6 md:py-8 px-4">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-8">Compare Products</h1>

        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Search
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile view */}
        <div className="md:hidden">
          {compareList.map((product, index) => (
            <MobileProductCard key={`mobile-${product.source}-${index}`} product={product} />
          ))}
        </div>

        {/* Desktop view */}
        <div className="hidden md:grid md:grid-cols-[300px_1fr] gap-8">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <Image
              src={compareList[0]?.image || "/placeholder.svg"}
              alt={compareList[0]?.name || "Product"}
              width={300}
              height={300}
              className="object-contain w-full h-auto"
            />
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shop</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Availability</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {compareList.map((product, index) => (
                  <TableRow key={`${product.source}-${index}`}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-8 w-8 rounded ${
                            product.source === "Startech"
                              ? "bg-blue-900"
                              : product.source === "Techland"
                                ? "bg-gray-900"
                                : product.source === "UltraTech"
                                  ? "bg-purple-900"
                                  : product.source === "Potaka IT"
                                    ? "bg-green-900"
                                    : product.source === "Skyland"
                                      ? "bg-teal-900"
                                      : "bg-red-900"
                          } flex items-center justify-center text-white text-xs`}
                        >
                          {product.source === "Startech"
                            ? "ST"
                            : product.source === "Techland"
                              ? "TL"
                              : product.source === "UltraTech"
                                ? "UT"
                                : product.source === "Potaka IT"
                                  ? "PI"
                                  : product.source === "Skyland"
                                    ? "SK"
                                    : "PC"}
                        </div>
                        {product.source}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-sm font-medium ${
                          isInStock(product.price)
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                        }`}
                      >
                        {isInStock(product.price) ? "In Stock" : "Out of Stock"}
                      </span>
                    </TableCell>
                    <TableCell>{renderPrice(product.price)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <a href={product.url} target="_blank" rel="noopener noreferrer">
                          <Button size="sm">Buy</Button>
                        </a>
                        <Button size="sm" variant="outline" onClick={() => removeFromCompare(product)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  )
}
