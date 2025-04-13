"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase, type DbProduct, type DbPriceHistory } from "@/lib/supabase"
import { SiteHeader } from "@/components/site-header"
import { AttentionBanner } from "@/components/attention-banner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ExternalLink, ArrowLeft } from "lucide-react"
import Image from "next/image"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface ProductPrice {
  id: string
  price: number
  original_price: number | null
  availability: string
  url: string
  created_at: string
  retailer: {
    id: string
    name: string
    website: string
  }
}

interface ProductWithPrices extends DbProduct {
  product_prices: ProductPrice[]
  price_history: Record<string, DbPriceHistory[]>
}

export default function ProductPage() {
  const { id } = useParams()
  const [product, setProduct] = useState<ProductWithPrices | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeRetailer, setActiveRetailer] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true)

        // Fetch product details
        const { data: productData, error: productError } = await supabase
          .from("products")
          .select("*")
          .eq("id", id)
          .single()

        if (productError) throw productError

        // Fetch product prices
        const { data: pricesData, error: pricesError } = await supabase
          .from("product_prices")
          .select(`
            *,
            retailer:retailers (*)
          `)
          .eq("product_id", id)

        if (pricesError) throw pricesError

        // Fetch price history for each retailer
        const priceHistory: Record<string, DbPriceHistory[]> = {}

        for (const price of pricesData) {
          const { data: historyData, error: historyError } = await supabase
            .from("price_history")
            .select("*")
            .eq("product_id", id)
            .eq("retailer_id", price.retailer.id)
            .order("recorded_at", { ascending: true })

          if (!historyError && historyData) {
            priceHistory[price.retailer.id] = historyData
          }
        }

        // Set the product with prices and history
        setProduct({
          ...productData,
          product_prices: pricesData,
          price_history: priceHistory,
        } as ProductWithPrices)

        // Set the active retailer to the first one
        if (pricesData.length > 0) {
          setActiveRetailer(pricesData[0].retailer.id)
        }
      } catch (err) {
        console.error("Error fetching product:", err)
        setError("Failed to load product details")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProduct()
    }
  }, [id])

  // Format price for display
  const formatPrice = (price: number) => {
    return `৳ ${price.toLocaleString()}`
  }

  // Prepare chart data
  const getChartData = () => {
    if (!product || !activeRetailer || !product.price_history[activeRetailer]) {
      return []
    }

    // Get current price
    const currentPrice = product.product_prices.find((p) => p.retailer.id === activeRetailer)

    // Combine historical data with current price
    const history = [...product.price_history[activeRetailer]]

    // Add current price if it exists
    if (currentPrice) {
      history.push({
        id: "current",
        product_id: product.id,
        retailer_id: activeRetailer,
        price: currentPrice.price,
        recorded_at: new Date().toISOString(),
      })
    }

    // Format data for chart
    return history.map((item) => ({
      date: new Date(item.recorded_at).toLocaleDateString(),
      price: item.price,
    }))
  }

  return (
    <div className="min-h-screen">
      <AttentionBanner />
      <SiteHeader />

      <div className="container mx-auto py-8 px-4">
        <Button variant="outline" onClick={() => window.history.back()} className="mb-6 flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <div className="grid md:grid-cols-[300px_1fr] gap-8">
              <Skeleton className="h-[300px] w-full" />
              <div className="space-y-4">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>
        ) : error ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <h2 className="text-xl font-semibold text-red-500 mb-2">Error</h2>
                <p className="text-muted-foreground">{error}</p>
                <Button className="mt-4" onClick={() => window.history.back()}>
                  Go Back
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : product ? (
          <div className="space-y-8">
            <h1 className="text-2xl md:text-3xl font-bold">{product.name}</h1>

            <div className="grid md:grid-cols-[300px_1fr] gap-8">
              {/* Product Image */}
              <div className="bg-white rounded-lg p-4 flex items-center justify-center h-[300px] relative">
                {product.image_url ? (
                  <Image
                    src={product.image_url || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-contain p-4"
                  />
                ) : (
                  <div className="text-muted-foreground">No image available</div>
                )}
              </div>

              {/* Product Details */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Best Prices</CardTitle>
                    <CardDescription>Compare prices across different retailers</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {product.product_prices.length > 0 ? (
                        product.product_prices
                          .sort((a, b) => a.price - b.price)
                          .map((price) => (
                            <div
                              key={price.id}
                              className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <Badge variant={price.retailer.name === "Startech" ? "default" : "secondary"}>
                                    {price.retailer.name}
                                  </Badge>
                                  {price.availability === "In Stock" && (
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                      In Stock
                                    </Badge>
                                  )}
                                </div>
                                <div className="mt-1 font-medium text-lg">{formatPrice(price.price)}</div>
                                {price.original_price && (
                                  <div className="text-sm text-muted-foreground line-through">
                                    {formatPrice(price.original_price)}
                                  </div>
                                )}
                              </div>
                              <a href={price.url} target="_blank" rel="noopener noreferrer">
                                <Button size="sm" className="gap-1">
                                  <ExternalLink className="h-4 w-4" />
                                  View
                                </Button>
                              </a>
                            </div>
                          ))
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          No prices available for this product
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Product Specs */}
                {product.specs && Object.keys(product.specs).length > 0 && (
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>Specifications</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(product.specs).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="font-medium">{key}:</span>
                            <span>{value}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Price History Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Price History</CardTitle>
                <CardDescription>Track how the price has changed over time</CardDescription>

                {/* Retailer Tabs */}
                {product.product_prices.length > 0 && (
                  <TabsList className="mt-2">
                    {product.product_prices.map((price) => (
                      <TabsTrigger
                        key={price.retailer.id}
                        value={price.retailer.id}
                        onClick={() => setActiveRetailer(price.retailer.id)}
                        className={activeRetailer === price.retailer.id ? "bg-primary text-primary-foreground" : ""}
                      >
                        {price.retailer.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                )}
              </CardHeader>
              <CardContent>
                {activeRetailer ? (
                  <div className="h-[400px] w-full">
                    {getChartData().length > 1 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={getChartData()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip
                            formatter={(value) => [`৳ ${value}`, "Price"]}
                            labelFormatter={(label) => `Date: ${label}`}
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="price"
                            stroke="#8884d8"
                            activeDot={{ r: 8 }}
                            name="Price (৳)"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        Not enough price history data available yet
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">Select a retailer to view price history</div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Product not found</h2>
            <p className="text-muted-foreground mb-4">
              The product you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => window.history.back()}>Go Back</Button>
          </div>
        )}
      </div>
    </div>
  )
}
