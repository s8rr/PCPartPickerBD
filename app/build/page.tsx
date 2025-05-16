"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Plus,
  Share,
  ShoppingCart,
  Cpu,
  Fan,
  Layers,
  MemoryStickIcon as Memory,
  HardDrive,
  Tv2,
  Box,
  Zap,
  Monitor,
  RefreshCw,
  ExternalLink,
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react"
import Image from "next/image"
import { ProductTooltip } from "@/components/product-tooltip"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import React from "react"

// Define component types
interface PCComponent {
  type: string
  name: string
  price: string
  image: string
  source: string
  url: string
  availability: string
  specs?: Record<string, string>
  id?: string // Add unique ID for multiple components
}

interface CrossSiteComponent {
  name: string
  price: string
  image: string
  availability: string
  source: string
  url: string
  specs?: Record<string, string>
}

interface CrossSitePrices {
  [key: string]: CrossSiteComponent | null
}

// Define component categories with icons
const componentCategories = [
  { id: "cpu", label: "CPU", icon: Cpu },
  { id: "cpu-cooler", label: "CPU Cooler", icon: Fan },
  { id: "motherboard", label: "Motherboard", icon: Layers },
  { id: "memory", label: "Memory", icon: Memory },
  { id: "storage", label: "Storage", icon: HardDrive },
  { id: "video-card", label: "Video Card", icon: Tv2 },
  { id: "case", label: "Case", icon: Box },
  { id: "power-supply", label: "Power Supply", icon: Zap },
  { id: "monitor", label: "Monitor", icon: Monitor },
]

// Helper function to truncate name to specified number of words
const truncateName = (name: string, wordCount: number): string => {
  const words = name.split(" ")
  if (words.length <= wordCount) return name
  return words.slice(0, wordCount).join(" ") + "..."
}

export default function BuildPage() {
  // Add a new state variable for the base total at the top with other state variables
  const [totalBase, setTotalBase] = useState(0)
  // Add state variables for the new shops
  const [totalStartech, setTotalStartech] = useState(0)
  const [totalTechland, setTotalTechland] = useState(0)
  const [totalUltraTech, setTotalUltraTech] = useState(0)
  const [totalPotakaIT, setTotalPotakaIT] = useState(0)
  const [totalPCHouse, setTotalPCHouse] = useState(0)
  // Add a new state variable for Skyland total:
  const [totalSkyland, setTotalSkyland] = useState(0)
  // Update the state variable to store arrays of components
  const [selectedComponents, setSelectedComponents] = useState<Record<string, PCComponent[]>>({})
  const [crossSitePrices, setCrossSitePrices] = useState<Record<string, Record<string, CrossSitePrices>>>({})
  const [loading, setLoading] = useState(true)
  const [crossSiteLoading, setCrossSiteLoading] = useState<Record<string, boolean>>({})
  // Add state for mobile accordion
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  // Add state for share button loading
  const [isSharing, setIsSharing] = useState(false)

  const { toast } = useToast()
  const router = useRouter()

  // Update the useEffect for loading from localStorage
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const buildId = urlParams.get("build")

    // If there's a shared build in the URL, prioritize loading that
    if (buildId) {
      fetchSharedBuild(buildId)
      return // Skip loading from localStorage
    }

    // Otherwise load from localStorage as usual
    const savedBuild = localStorage.getItem("pcBuild")
    const savedCrossSitePrices = localStorage.getItem("pcBuildCrossSitePrices")

    if (savedBuild) {
      try {
        const parsedBuild = JSON.parse(savedBuild)

        // Convert old format to new format if needed
        const formattedBuild: Record<string, PCComponent[]> = {}

        Object.entries(parsedBuild).forEach(([type, component]) => {
          if (Array.isArray(component)) {
            // Already in new format
            formattedBuild[type] = component
          } else if (component) {
            // Convert old format to new format
            const typedComponent = component as PCComponent
            if (!typedComponent.id) {
              typedComponent.id = Math.random().toString(36).substring(2, 9)
            }
            formattedBuild[type] = [typedComponent]
          }
        })

        setSelectedComponents(formattedBuild)

        // If we have saved cross-site prices, load them
        if (savedCrossSitePrices) {
          try {
            const parsedCrossSitePrices = JSON.parse(savedCrossSitePrices)
            setCrossSitePrices(parsedCrossSitePrices)
          } catch (error) {
            console.error("Error parsing saved cross-site prices:", error)
          }
        } else {
          // Otherwise fetch cross-site prices for each component
          Object.entries(formattedBuild).forEach(([type, components]) => {
            if (components && components.length > 0) {
              components.forEach((component) => {
                fetchCrossSitePrices(type, component)
              })
            }
          })
        }
      } catch (error) {
        console.error("Error parsing saved build:", error)
        setSelectedComponents({})
      }
    }

    // Simulate loading delay for demonstration
    const timer = setTimeout(() => {
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [router, toast])

  // Update the fetchSharedBuild function
  const fetchSharedBuild = async (buildId: string) => {
    try {
      setLoading(true) // Show loading state while fetching

      const response = await fetch(`/api/builds?id=${buildId}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch shared build: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      // Convert the shared build format back to our component format
      const formattedBuild: Record<string, PCComponent[]> = {}

      Object.entries(data.build).forEach(([type, componentData]: [string, any]) => {
        if (Array.isArray(componentData)) {
          formattedBuild[type] = componentData.map((data: any) => ({
            type,
            name: data.name,
            price: data.price,
            image: data.image || "",
            source: data.source,
            url: data.url,
            availability: data.availability || "In Stock",
            id: data.id || Math.random().toString(36).substring(2, 9),
          }))
        } else {
          formattedBuild[type] = [
            {
              type,
              name: componentData.name,
              price: componentData.price,
              image: componentData.image || "",
              source: componentData.source,
              url: componentData.url,
              availability: componentData.availability || "In Stock",
              id: Math.random().toString(36).substring(2, 9),
            },
          ]
        }
      })

      // Clear existing components and cross-site prices completely
      setSelectedComponents(formattedBuild)
      setCrossSitePrices({})

      // Save to localStorage, replacing any existing build
      localStorage.setItem("pcBuild", JSON.stringify(formattedBuild))
      localStorage.removeItem("pcBuildCrossSitePrices") // Clear cross-site prices

      // Fetch cross-site prices for each component
      Object.entries(formattedBuild).forEach(([type, components]) => {
        if (components && components.length > 0) {
          components.forEach((component) => {
            fetchCrossSitePrices(type, component)
          })
        }
      })

      // Remove the build parameter from URL to avoid reloading the same build
      router.replace("/build", undefined, { shallow: true })

      toast({
        title: "Shared build loaded!",
        description: "This PC build was shared with you. Any previous build has been replaced.",
        duration: 5000,
      })
    } catch (error) {
      console.error("Error loading shared build:", error)
      toast({
        title: "Error loading shared build",
        description: "The shared build link appears to be invalid or expired.",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  // Update the useEffect for calculating totals to fix the other retailer totals
  // Replace the entire useEffect for calculating totals with this updated version:

  useEffect(() => {
    let baseTotal = 0
    let startechTotal = 0
    let techlandTotal = 0
    let ultratechTotal = 0
    let potakaitTotal = 0
    let pchouseTotal = 0
    let skylandTotal = 0

    // First, calculate the base total from selected components
    Object.entries(selectedComponents).forEach(([type, components]) => {
      components?.forEach((component) => {
        if (component) {
          // Extract the numeric price value, handling discounted prices correctly
          const price = component.price
          const numericPrice = extractNumericPrice(price)

          if (numericPrice > 0) {
            // Add to base total regardless of source
            baseTotal += numericPrice

            // Also add to the specific retailer total
            if (component.source === "Startech") {
              startechTotal += numericPrice
            } else if (component.source === "Techland") {
              techlandTotal += numericPrice
            } else if (component.source === "UltraTech") {
              ultratechTotal += numericPrice
            } else if (component.source === "Potaka IT") {
              potakaitTotal += numericPrice
            } else if (component.source === "PC House") {
              pchouseTotal += numericPrice
            } else if (component.source === "Skyland") {
              skylandTotal += numericPrice
            }
          }
        }
      })
    })

    // Create a map to track which component types we've already handled for each retailer
    const handledComponents = {
      Startech: new Set(),
      Techland: new Set(),
      UltraTech: new Set(),
      "Potaka IT": new Set(),
      "PC House": new Set(),
      Skyland: new Set(),
    }

    // Mark components that are already selected for each retailer
    Object.entries(selectedComponents).forEach(([type, components]) => {
      components?.forEach((component) => {
        if (component && component.source) {
          handledComponents[component.source].add(type)
        }
      })
    })

    // Now add cross-site prices for components not selected from each retailer
    Object.entries(crossSitePrices).forEach(([type, pricesByType]) => {
      // For each component type
      Object.entries(pricesByType).forEach(([componentId, prices]) => {
        if (prices && componentId === "default") {
          // For each retailer's price for this component
          Object.entries(prices).forEach(([retailer, component]) => {
            // Only add if we haven't already handled this component type for this retailer
            if (component && !handledComponents[retailer]?.has(type)) {
              // Extract the numeric price value
              const price = component.price
              const numericPrice = extractNumericPrice(price)

              if (numericPrice > 0) {
                // Add to the specific retailer total
                if (retailer === "Startech") {
                  startechTotal += numericPrice
                } else if (retailer === "Techland") {
                  techlandTotal += numericPrice
                } else if (retailer === "UltraTech") {
                  ultratechTotal += numericPrice
                } else if (retailer === "Potaka IT") {
                  potakaitTotal += numericPrice
                } else if (retailer === "PC House") {
                  pchouseTotal += numericPrice
                } else if (retailer === "Skyland") {
                  skylandTotal += numericPrice
                }

                // Mark this component type as handled for this retailer
                handledComponents[retailer].add(type)
              }
            }
          })
        }
      })
    })

    setTotalBase(baseTotal)
    setTotalStartech(startechTotal)
    setTotalTechland(techlandTotal)
    setTotalUltraTech(ultratechTotal)
    setTotalPotakaIT(potakaitTotal)
    setTotalPCHouse(pchouseTotal)
    setTotalSkyland(skylandTotal)
  }, [selectedComponents, crossSitePrices])

  // Improved helper function to extract the numeric price value, handling more price formats
  const extractNumericPrice = (priceString: string): number => {
    if (!priceString) return 0

    // Remove any non-breaking spaces and normalize whitespace
    const normalizedPrice = priceString.replace(/\u00A0/g, " ").trim()

    // If the price contains multiple prices (e.g., "৳ 12,500 ৳ 13,000")
    // Use the first price which is typically the discounted price
    if (normalizedPrice.includes("৳") && normalizedPrice.split("৳").length > 2) {
      const prices = normalizedPrice.split("৳").filter((p) => p.trim())
      if (prices.length >= 1) {
        // Extract numeric value from the first price
        const firstPrice = prices[0].trim()
        const numericMatch = firstPrice.match(/[\d,]+/)
        if (numericMatch) {
          return Number.parseFloat(numericMatch[0].replace(/,/g, "")) || 0
        }
      }
    }

    // For regular prices with ৳ symbol
    const bengaliPriceMatch = normalizedPrice.match(/৳\s*([\d,]+)/)
    if (bengaliPriceMatch && bengaliPriceMatch[1]) {
      return Number.parseFloat(bengaliPriceMatch[1].replace(/,/g, "")) || 0
    }

    // For prices without ৳ symbol, try to extract any numeric value
    const numericMatch = normalizedPrice.match(/([\d,]+)/)
    if (numericMatch && numericMatch[1]) {
      return Number.parseFloat(numericMatch[1].replace(/,/g, "")) || 0
    }

    // If all else fails, try to extract any digits
    const digits = normalizedPrice.match(/\d+/g)
    if (digits && digits.length > 0) {
      return Number.parseFloat(digits.join("")) || 0
    }

    return 0
  }

  // Function to fetch cross-site prices for a component
  const fetchCrossSitePrices = async (type: string, component: PCComponent) => {
    const componentId = component.id || "default"
    setCrossSiteLoading((prev) => ({ ...prev, [componentId]: true }))

    try {
      console.log(`Fetching cross-site prices for ${component.name} (${componentId})`)

      // Add timeout to prevent hanging requests
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

      const response = await fetch(
        `/api/cross-site-search?query=${encodeURIComponent(component.name)}&excludeSource=${encodeURIComponent(component.source)}`,
        { signal: controller.signal },
      ).catch((error) => {
        console.error(`Error fetching cross-site prices: ${error.message}`)
        return null
      })

      clearTimeout(timeoutId)

      if (!response || !response.ok) {
        throw new Error(`Failed to fetch cross-site prices: ${response?.status || "No response"}`)
      }

      const data = await response.json()
      console.log(`Received cross-site prices for ${component.name}:`, data)

      setCrossSitePrices((prev) => {
        // Create a deep copy of the previous state
        const updated = JSON.parse(JSON.stringify(prev))

        // Initialize the type object if it doesn't exist
        if (!updated[type]) {
          updated[type] = {}
        }

        // Store the prices using the component's ID
        updated[type][componentId] = data.crossSiteProducts

        // Also store under "default" if this is the first component of its type
        if (!updated[type].default || componentId === "default") {
          updated[type].default = data.crossSiteProducts
        }

        // Save to localStorage
        localStorage.setItem("pcBuildCrossSitePrices", JSON.stringify(updated))
        console.log(`Updated cross-site prices for ${component.name}`, updated)

        return updated
      })
    } catch (error) {
      console.error(`Error fetching cross-site prices for ${component.name}:`, error)
      toast({
        title: "Error fetching prices",
        description: `Could not fetch prices for ${component.name}. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setCrossSiteLoading((prev) => ({ ...prev, [componentId]: false }))
    }
  }

  // Update the removeComponent function to handle component IDs
  const removeComponent = (categoryId: string, componentId: string) => {
    const updatedComponents = { ...selectedComponents }

    if (updatedComponents[categoryId]) {
      // Filter out the component with the matching ID
      updatedComponents[categoryId] = updatedComponents[categoryId].filter((comp) => comp.id !== componentId)

      // If there are no more components of this type, remove the category
      if (updatedComponents[categoryId].length === 0) {
        delete updatedComponents[categoryId]
      }
    }

    setSelectedComponents(updatedComponents)
    localStorage.setItem("pcBuild", JSON.stringify(updatedComponents))
  }

  // Add a function to add a new component slot
  const addComponentSlot = (categoryId: string) => {
    router.push(`/build/components/${categoryId}`)
  }

  // Function to handle price display
  const renderPrice = (price: string, source: string) => {
    // If the component is not from this source, return N/A
    if (
      !price ||
      (source !== "Startech" &&
        source !== "Techland" &&
        source !== "UltraTech" &&
        source !== "Potaka IT" &&
        source !== "PC House" &&
        source !== "Skyland")
    ) {
      return "N/A"
    }

    // Check if price contains multiple prices (e.g., "৳ 12,500 ৳ 13,000")
    if (price.includes("৳") && price.split("৳").length > 2) {
      const prices = price.split("৳").filter((p) => p.trim())

      // If we have at least two prices
      if (prices.length >= 2) {
        return `৳ ${prices[0].trim()}`
      }
    }

    // Ensure consistent format with space after ৳
    if (price.startsWith("৳") && !price.startsWith("৳ ")) {
      return price.replace("৳", "৳ ")
    }

    // Regular price display
    return price
  }

  // Function to refresh cross-site prices for a component
  const refreshCrossSitePrices = (type: string, component: PCComponent) => {
    fetchCrossSitePrices(type, component)
  }

  // Function to select a cross-site component
  const selectCrossSiteComponent = (type: string, component: CrossSiteComponent, componentId = "default") => {
    const newComponent: PCComponent = {
      type,
      name: component.name,
      price: component.price,
      image: component.image,
      source: component.source,
      url: component.url,
      availability: component.availability,
      specs: component.specs,
      id: Math.random().toString(36).substring(2, 9),
    }

    const updatedComponents = { ...selectedComponents }

    // If this is a multi-component type (RAM, storage, monitor), add to array
    if ((type === "memory" || type === "storage" || type === "monitor") && updatedComponents[type]) {
      updatedComponents[type] = [...updatedComponents[type], newComponent]
    } else {
      // Otherwise replace existing component
      updatedComponents[type] = [newComponent]
    }

    setSelectedComponents(updatedComponents)
    localStorage.setItem("pcBuild", JSON.stringify(updatedComponents))

    // Fetch cross-site prices for the new component
    fetchCrossSitePrices(type, newComponent)
  }

  // Toggle category expansion for mobile view
  const toggleCategory = (categoryId: string) => {
    if (expandedCategory === categoryId) {
      setExpandedCategory(null)
    } else {
      setExpandedCategory(categoryId)
    }
  }

  // Update the handleShareBuild function
  const handleShareBuild = async () => {
    if (Object.keys(selectedComponents).length === 0) return

    setIsSharing(true)

    try {
      // Create a simplified version of the build with just the essential info
      const shareBuild = Object.entries(selectedComponents).reduce(
        (acc, [type, components]) => {
          if (components && components.length > 0) {
            acc[type] = components.map((component) => ({
              id: component.id,
              name: component.name,
              price: component.price,
              source: component.source,
              url: component.url,
            }))
          }
          return acc
        },
        {} as Record<string, any[]>,
      )

      // Send the build data to our API to get a short ID
      const response = await fetch("/api/builds", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(shareBuild),
      })

      if (!response.ok) {
        throw new Error(`Failed to create share link: ${response.status}`)
      }

      const { buildId } = await response.json()

      // Create the short share URL
      const shareUrl = `${window.location.origin}/build?build=${buildId}`

      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl)

      toast({
        title: "Short link copied to clipboard!",
        description: "You can now share this link with your friends.",
        duration: 3000,
      })
    } catch (error) {
      console.error("Error sharing build:", error)
      toast({
        title: "Error creating share link",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsSharing(false)
    }
  }
  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-6 md:py-8 px-4">
        <div className="bg-card rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4 justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Your PC Build</h2>
              <p className="text-muted-foreground text-sm">Select components to build your PC</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Clear all selected components
                  setSelectedComponents({})
                  setCrossSitePrices({})
                  localStorage.removeItem("pcBuild")
                  localStorage.removeItem("pcBuildCrossSitePrices")
                  toast({
                    title: "Build cleared",
                    description: "All components have been removed from your build.",
                  })
                }}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Clear Build</span>
                <span className="sm:hidden">Clear</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShareBuild}
                disabled={Object.keys(selectedComponents).length === 0 || isSharing}
              >
                {isSharing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Share className="mr-2 h-4 w-4" />}
                <span className="hidden sm:inline">{isSharing ? "Creating..." : "Share"}</span>
                {isSharing && <span className="sm:hidden">...</span>}
                {!isSharing && <span className="sm:hidden">Share</span>}
              </Button>
              <Button size="sm">
                <ShoppingCart className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Buy Parts</span>
                <span className="sm:hidden">Buy</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile view */}
        <div className="md:hidden">
          <div className="bg-card rounded-lg shadow-sm p-3 mb-3">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-sm">Total Price</h3>
              <div className="font-bold text-base text-primary">
                {totalBase > 0 ? `৳ ${totalBase.toLocaleString()}` : "N/A"}
              </div>
            </div>
          </div>

          {componentCategories.map((category) => (
            <div key={category.id} className="bg-card rounded-lg shadow-sm mb-3 overflow-hidden">
              <div
                className="p-4 flex justify-between items-center cursor-pointer"
                onClick={() => toggleCategory(category.id)}
              >
                <div className="flex items-center gap-2">
                  <category.icon className="h-5 w-5 text-primary" />
                  <span className="font-medium">{category.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {selectedComponents[category.id] && selectedComponents[category.id].length > 0 && (
                    <span className="text-sm font-medium text-primary">
                      {selectedComponents[category.id].length > 1
                        ? `${selectedComponents[category.id].length} items`
                        : renderPrice(
                            selectedComponents[category.id][0]?.price || "",
                            selectedComponents[category.id][0]?.source || "",
                          )}
                    </span>
                  )}
                  {expandedCategory === category.id ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </div>

              {expandedCategory === category.id && (
                <div className="p-4 pt-0 border-t mt-2">
                  {loading ? (
                    <div className="flex items-start gap-3">
                      <Skeleton className="w-12 h-12 rounded" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  ) : selectedComponents[category.id] && selectedComponents[category.id].length > 0 ? (
                    <div className="space-y-4">
                      {selectedComponents[category.id].map((component, index) => (
                        <div key={component.id || index} className="space-y-4">
                          {index > 0 && <div className="border-t pt-4"></div>}
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 bg-white rounded relative flex-shrink-0">
                              {component.image ? (
                                <Image
                                  src={component.image || ""}
                                  alt={component.name || ""}
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
                              <ProductTooltip product={component}>
                                <div className="font-medium text-sm truncate">
                                  {truncateName(component.name || "", 4)}
                                </div>
                              </ProductTooltip>
                              <div className="flex gap-2 mt-1">
                                <Link href={`/build/components/${category.id}`}>
                                  <Button variant="link" className="p-0 h-auto text-xs text-muted-foreground">
                                    Change
                                  </Button>
                                </Link>
                                <Button
                                  variant="link"
                                  className="p-0 h-auto text-xs text-red-500"
                                  onClick={() => removeComponent(category.id, component.id || "")}
                                >
                                  Remove
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Add button for multiple components */}
                      {(category.id === "memory" || category.id === "storage" || category.id === "monitor") && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-2 text-xs h-7"
                          onClick={() => addComponentSlot(category.id)}
                        >
                          <Plus className="mr-1 h-3 w-3" />
                          Add Another {category.label}
                        </Button>
                      )}
                    </div>
                  ) : (
                    <Link href={`/build/components/${category.id}`}>
                      <Button size="sm" variant="secondary" className="flex items-center w-full">
                        <Plus className="mr-1 h-4 w-4" />
                        Choose {category.label === "Memory" || category.label === "Storage" ? "" : "A"} {category.label}
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Mobile retailer totals */}
          <div className="bg-card rounded-lg shadow-sm p-4 mt-6">
            <h3 className="font-medium mb-3">Retailer Totals</h3>
            <div className="space-y-2">
              {[
                { name: "Startech", total: totalStartech, icon: "ST", color: "bg-blue-900" },
                { name: "Techland", total: totalTechland, icon: "TL", color: "bg-gray-900" },
                { name: "UltraTech", total: totalUltraTech, icon: "UT", color: "bg-purple-900" },
                { name: "Potaka IT", total: totalPotakaIT, icon: "PI", color: "bg-green-900" },
                { name: "PC House", total: totalPCHouse, icon: "PC", color: "bg-red-900" },
                { name: "Skyland", total: totalSkyland, icon: "SK", color: "bg-teal-900" },
              ].map((retailer) => (
                <div key={retailer.name} className="flex justify-between items-center py-2 border-b">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-6 w-6 rounded ${retailer.color} flex items-center justify-center text-white text-xs`}
                    >
                      {retailer.icon}
                    </div>
                    <span>{retailer.name}</span>
                  </div>
                  <div className="font-medium">
                    {retailer.total > 0 ? `৳ ${retailer.total.toLocaleString()}` : "N/A"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Replace the desktop view section with this updated version */}
        {/* Desktop view */}
        <div className="hidden md:block overflow-x-auto rounded-lg border">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted rounded-t-lg">
                <th className="p-2 text-center font-medium text-xs">Component</th>
                <th className="p-2 text-center font-medium text-xs">Selection</th>
                <th className="p-2 text-center font-medium text-xs">Base</th>
                <th className="p-2 text-center font-medium text-xs">
                  <div className="flex items-center justify-center">
                    <div className="h-5 w-5 rounded-full bg-blue-900 flex items-center justify-center text-white text-[10px] mr-1.5 shadow-sm">
                      ST
                    </div>
                    <span>Startech</span>
                  </div>
                </th>
                <th className="p-2 text-center font-medium text-xs">
                  <div className="flex items-center justify-center">
                    <div className="h-5 w-5 rounded-full bg-gray-900 flex items-center justify-center text-white text-[10px] mr-1.5 shadow-sm">
                      TL
                    </div>
                    <span>Techland</span>
                  </div>
                </th>
                <th className="p-2 text-center font-medium text-xs">
                  <div className="flex items-center justify-center">
                    <div className="h-5 w-5 rounded-full bg-purple-900 flex items-center justify-center text-white text-[10px] mr-1.5 shadow-sm">
                      UT
                    </div>
                    <span>UltraTech</span>
                  </div>
                </th>
                <th className="p-2 text-center font-medium text-xs">
                  <div className="flex items-center justify-center">
                    <div className="h-5 w-5 rounded-full bg-green-900 flex items-center justify-center text-white text-[10px] mr-1.5 shadow-sm">
                      PI
                    </div>
                    <span>Potaka IT</span>
                  </div>
                </th>
                <th className="p-2 text-center font-medium text-xs">
                  <div className="flex items-center justify-center">
                    <div className="h-5 w-5 rounded-full bg-red-900 flex items-center justify-center text-white text-[10px] mr-1.5 shadow-sm">
                      PC
                    </div>
                    <span>PC House</span>
                  </div>
                </th>
                <th className="p-2 text-center font-medium text-xs">
                  <div className="flex items-center justify-center">
                    <div className="h-5 w-5 rounded-full bg-teal-900 flex items-center justify-center text-white text-[10px] mr-1.5 shadow-sm">
                      SK
                    </div>
                    <span>Skyland</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {componentCategories.map((category) => {
                // Check if we have components for this category
                const hasComponents = selectedComponents[category.id] && selectedComponents[category.id].length > 0

                return (
                  <React.Fragment key={category.id}>
                    {/* Main category row */}
                    <tr className="border-b">
                      <td className="p-2">
                        <div className="flex flex-col gap-1">
                          <Link
                            href={`/build/components/${category.id}`}
                            className="text-primary hover:underline flex items-center"
                          >
                            <category.icon className="mr-1.5 h-3 w-3" />
                            <span className="text-xs">{category.label}</span>
                          </Link>

                          {/* Add another button for specific components */}
                          {(category.id === "memory" || category.id === "storage" || category.id === "monitor") &&
                            hasComponents && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-5 px-1.5 text-xs text-primary border-primary/30 hover:bg-primary/5 hover:text-primary hover:border-primary mt-1"
                                onClick={() => addComponentSlot(category.id)}
                              >
                                <Plus className="h-3 w-3 mr-0.5" />
                                Add another
                              </Button>
                            )}
                        </div>
                      </td>
                      <td className="p-2">
                        {loading ? (
                          <div className="flex items-start gap-2">
                            <Skeleton className="w-10 h-10 rounded" />
                            <div className="flex-1">
                              <Skeleton className="h-3 w-28 mb-1" />
                              <Skeleton className="h-2 w-16" />
                            </div>
                          </div>
                        ) : hasComponents ? (
                          <div className="flex flex-col gap-2">
                            <div className="flex items-start gap-2">
                              <div className="w-10 h-10 bg-white rounded relative flex-shrink-0">
                                {selectedComponents[category.id][0]?.image ? (
                                  <Image
                                    src={selectedComponents[category.id][0]?.image || ""}
                                    alt={selectedComponents[category.id][0]?.name || ""}
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
                                <ProductTooltip product={selectedComponents[category.id][0]!}>
                                  <div className="font-medium text-xs truncate max-w-[180px]">
                                    {truncateName(selectedComponents[category.id][0]?.name || "", 4)}
                                    {selectedComponents[category.id].length > 1 && (
                                      <span className="ml-1 text-primary">
                                        +{selectedComponents[category.id].length - 1} more
                                      </span>
                                    )}
                                  </div>
                                </ProductTooltip>
                                <div className="flex gap-1 mt-1">
                                  <Link href={`/build/components/${category.id}`}>
                                    <Button variant="link" className="p-0 h-auto text-[10px] text-muted-foreground">
                                      Change
                                    </Button>
                                  </Link>
                                  <Button
                                    variant="link"
                                    className="p-0 h-auto text-[10px] text-red-500"
                                    onClick={() =>
                                      removeComponent(category.id, selectedComponents[category.id][0]?.id || "")
                                    }
                                  >
                                    Remove
                                  </Button>
                                  <Button
                                    variant="link"
                                    className="p-0 h-auto text-[10px] text-primary"
                                    onClick={() =>
                                      refreshCrossSitePrices(category.id, selectedComponents[category.id][0]!)
                                    }
                                    disabled={crossSiteLoading[selectedComponents[category.id][0]?.id || ""]}
                                  >
                                    {crossSiteLoading[selectedComponents[category.id][0]?.id || ""] ? (
                                      <RefreshCw className="h-2 w-2 mr-0.5 animate-spin" />
                                    ) : (
                                      <RefreshCw className="h-2 w-2 mr-0.5" />
                                    )}
                                    Compare
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <Link href={`/build/components/${category.id}`}>
                            <Button size="sm" variant="secondary" className="flex items-center h-7 text-xs">
                              <Plus className="mr-1 h-3 w-3" />
                              Choose {category.label === "Memory" || category.label === "Storage" ? "" : "A"}{" "}
                              {category.label}
                            </Button>
                          </Link>
                        )}
                      </td>
                      <td className="p-2 text-center">
                        {loading ? (
                          <Skeleton className="h-5 w-16 mx-auto" />
                        ) : hasComponents ? (
                          <div className="text-center font-medium text-sm">
                            {renderPrice(
                              selectedComponents[category.id][0]?.price || "",
                              selectedComponents[category.id][0]?.source || "",
                            )}
                          </div>
                        ) : (
                          <div className="text-center">-</div>
                        )}
                      </td>
                      <td className="p-2 text-center">
                        {/* Startech column content */}
                        {loading ? (
                          <Skeleton className="h-5 w-16 mx-auto" />
                        ) : hasComponents && selectedComponents[category.id][0]?.source === "Startech" ? (
                          <div className="flex flex-col space-y-1 items-center">
                            <div className="font-medium text-sm text-center">
                              {renderPrice(selectedComponents[category.id][0]?.price || "", "Startech")}
                            </div>
                            <div className="flex items-center justify-center gap-1 mt-1">
                              <div className="px-1.5 py-0.5 bg-primary/10 text-xs rounded text-primary">Selected</div>
                              <a
                                href={selectedComponents[category.id][0]?.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button variant="ghost" size="sm" className="h-5 px-1.5 text-xs">
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              </a>
                            </div>
                          </div>
                        ) : (selectedComponents[category.id]?.[0]?.id &&
                            crossSitePrices[category.id]?.[selectedComponents[category.id][0]?.id]?.Startech) ||
                          crossSitePrices[category.id]?.default?.Startech ? (
                          <div className="flex flex-col space-y-1 items-center">
                            <div className="font-medium text-sm text-center">
                              {renderPrice(crossSitePrices[category.id]?.default?.Startech?.price || "", "Startech")}
                            </div>
                            <div className="flex items-center justify-center gap-1 mt-1">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-5 px-1.5 text-xs text-primary border-primary/30 hover:bg-primary/5 hover:text-primary hover:border-primary"
                                onClick={() =>
                                  selectCrossSiteComponent(
                                    category.id,
                                    crossSitePrices[category.id]?.default?.Startech!,
                                  )
                                }
                              >
                                <Check className="h-3 w-3 mr-0.5" />
                                Select
                              </Button>
                              <a
                                href={crossSitePrices[category.id]?.default?.Startech?.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button variant="ghost" size="sm" className="h-5 px-1.5 text-xs">
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              </a>
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm text-center block">N/A</span>
                        )}
                      </td>
                      {/* Other retailer columns follow the same pattern */}
                      <td className="p-2 text-center">
                        {/* Techland column content - similar to Startech */}
                        {loading ? (
                          <Skeleton className="h-5 w-16 mx-auto" />
                        ) : hasComponents && selectedComponents[category.id][0]?.source === "Techland" ? (
                          <div className="flex flex-col space-y-1 items-center">
                            <div className="font-medium text-sm text-center">
                              {renderPrice(selectedComponents[category.id][0]?.price || "", "Techland")}
                            </div>
                            <div className="flex items-center justify-center gap-1 mt-1">
                              <div className="px-1.5 py-0.5 bg-primary/10 text-xs rounded text-primary">Selected</div>
                              <a
                                href={selectedComponents[category.id][0]?.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button variant="ghost" size="sm" className="h-5 px-1.5 text-xs">
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              </a>
                            </div>
                          </div>
                        ) : (selectedComponents[category.id]?.[0]?.id &&
                            crossSitePrices[category.id]?.[selectedComponents[category.id][0]?.id]?.Techland) ||
                          crossSitePrices[category.id]?.default?.Techland ? (
                          <div className="flex flex-col space-y-1 items-center">
                            <div className="font-medium text-sm text-center">
                              {renderPrice(crossSitePrices[category.id]?.default?.Techland?.price || "", "Techland")}
                            </div>
                            <div className="flex items-center justify-center gap-1 mt-1">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-5 px-1.5 text-xs text-primary border-primary/30 hover:bg-primary/5 hover:text-primary hover:border-primary"
                                onClick={() =>
                                  selectCrossSiteComponent(
                                    category.id,
                                    crossSitePrices[category.id]?.default?.Techland!,
                                  )
                                }
                              >
                                <Check className="h-3 w-3 mr-0.5" />
                                Select
                              </Button>
                              <a
                                href={crossSitePrices[category.id]?.default?.Techland?.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button variant="ghost" size="sm" className="h-5 px-1.5 text-xs">
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              </a>
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm text-center block">N/A</span>
                        )}
                      </td>
                      <td className="p-2 text-center">
                        {/* UltraTech column content - similar to Startech */}
                        {loading ? (
                          <Skeleton className="h-5 w-16 mx-auto" />
                        ) : hasComponents && selectedComponents[category.id][0]?.source === "UltraTech" ? (
                          <div className="flex flex-col space-y-1 items-center">
                            <div className="font-medium text-sm text-center">
                              {renderPrice(selectedComponents[category.id][0]?.price || "", "UltraTech")}
                            </div>
                            <div className="flex items-center justify-center gap-1 mt-1">
                              <div className="px-1.5 py-0.5 bg-primary/10 text-xs rounded text-primary">Selected</div>
                              <a
                                href={selectedComponents[category.id][0]?.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button variant="ghost" size="sm" className="h-5 px-1.5 text-xs">
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              </a>
                            </div>
                          </div>
                        ) : (selectedComponents[category.id]?.[0]?.id &&
                            crossSitePrices[category.id]?.[selectedComponents[category.id][0]?.id]?.UltraTech) ||
                          crossSitePrices[category.id]?.default?.UltraTech ? (
                          <div className="flex flex-col space-y-1 items-center">
                            <div className="font-medium text-sm text-center">
                              {renderPrice(crossSitePrices[category.id]?.default?.UltraTech?.price || "", "UltraTech")}
                            </div>
                            <div className="flex items-center justify-center gap-1 mt-1">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-5 px-1.5 text-xs text-primary border-primary/30 hover:bg-primary/5 hover:text-primary hover:border-primary"
                                onClick={() =>
                                  selectCrossSiteComponent(
                                    category.id,
                                    crossSitePrices[category.id]?.default?.UltraTech!,
                                  )
                                }
                              >
                                <Check className="h-3 w-3 mr-0.5" />
                                Select
                              </Button>
                              <a
                                href={crossSitePrices[category.id]?.default?.UltraTech?.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button variant="ghost" size="sm" className="h-5 px-1.5 text-xs">
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              </a>
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm text-center block">N/A</span>
                        )}
                      </td>
                      <td className="p-2 text-center">
                        {/* Potaka IT column content - similar to Startech */}
                        {loading ? (
                          <Skeleton className="h-5 w-16 mx-auto" />
                        ) : hasComponents && selectedComponents[category.id][0]?.source === "Potaka IT" ? (
                          <div className="flex flex-col space-y-1 items-center">
                            <div className="font-medium text-sm text-center">
                              {renderPrice(selectedComponents[category.id][0]?.price || "", "Potaka IT")}
                            </div>
                            <div className="flex items-center justify-center gap-1 mt-1">
                              <div className="px-1.5 py-0.5 bg-primary/10 text-xs rounded text-primary">Selected</div>
                              <a
                                href={selectedComponents[category.id][0]?.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button variant="ghost" size="sm" className="h-5 px-1.5 text-xs">
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              </a>
                            </div>
                          </div>
                        ) : (selectedComponents[category.id]?.[0]?.id &&
                            crossSitePrices[category.id]?.[selectedComponents[category.id][0]?.id]?.["Potaka IT"]) ||
                          crossSitePrices[category.id]?.default?.["Potaka IT"] ? (
                          <div className="flex flex-col space-y-1 items-center">
                            <div className="font-medium text-sm text-center">
                              {renderPrice(
                                crossSitePrices[category.id]?.default?.["Potaka IT"]?.price || "",
                                "Potaka IT",
                              )}
                            </div>
                            <div className="flex items-center justify-center gap-1 mt-1">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-5 px-1.5 text-xs text-primary border-primary/30 hover:bg-primary/5 hover:text-primary hover:border-primary"
                                onClick={() =>
                                  selectCrossSiteComponent(
                                    category.id,
                                    crossSitePrices[category.id]?.default?.["Potaka IT"]!,
                                  )
                                }
                              >
                                <Check className="h-3 w-3 mr-0.5" />
                                Select
                              </Button>
                              <a
                                href={crossSitePrices[category.id]?.default?.["Potaka IT"]?.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button variant="ghost" size="sm" className="h-5 px-1.5 text-xs">
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              </a>
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm text-center block">N/A</span>
                        )}
                      </td>
                      <td className="p-2 text-center">
                        {/* PC House column content - similar to Startech */}
                        {loading ? (
                          <Skeleton className="h-5 w-16 mx-auto" />
                        ) : hasComponents && selectedComponents[category.id][0]?.source === "PC House" ? (
                          <div className="flex flex-col space-y-1 items-center">
                            <div className="font-medium text-sm text-center">
                              {renderPrice(selectedComponents[category.id][0]?.price || "", "PC House")}
                            </div>
                            <div className="flex items-center justify-center gap-1 mt-1">
                              <div className="px-1.5 py-0.5 bg-primary/10 text-xs rounded text-primary">Selected</div>
                              <a
                                href={selectedComponents[category.id][0]?.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button variant="ghost" size="sm" className="h-5 px-1.5 text-xs">
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              </a>
                            </div>
                          </div>
                        ) : (selectedComponents[category.id]?.[0]?.id &&
                            crossSitePrices[category.id]?.[selectedComponents[category.id][0]?.id]?.["PC House"]) ||
                          crossSitePrices[category.id]?.default?.["PC House"] ? (
                          <div className="flex flex-col space-y-1 items-center">
                            <div className="font-medium text-sm text-center">
                              {renderPrice(
                                crossSitePrices[category.id]?.default?.["PC House"]?.price || "",
                                "PC House",
                              )}
                            </div>
                            <div className="flex items-center justify-center gap-1 mt-1">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-5 px-1.5 text-xs text-primary border-primary/30 hover:bg-primary/5 hover:text-primary hover:border-primary"
                                onClick={() =>
                                  selectCrossSiteComponent(
                                    category.id,
                                    crossSitePrices[category.id]?.default?.["PC House"]!,
                                  )
                                }
                              >
                                <Check className="h-3 w-3 mr-0.5" />
                                Select
                              </Button>
                              <a
                                href={crossSitePrices[category.id]?.default?.["PC House"]?.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button variant="ghost" size="sm" className="h-5 px-1.5 text-xs">
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              </a>
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm text-center block">N/A</span>
                        )}
                      </td>
                      <td className="p-2 text-center">
                        {/* Skyland column content - similar to Startech */}
                        {loading ? (
                          <Skeleton className="h-5 w-16 mx-auto" />
                        ) : hasComponents && selectedComponents[category.id][0]?.source === "Skyland" ? (
                          <div className="flex flex-col space-y-1 items-center">
                            <div className="font-medium text-sm text-center">
                              {renderPrice(selectedComponents[category.id][0]?.price || "", "Skyland")}
                            </div>
                            <div className="flex items-center justify-center gap-1 mt-1">
                              <div className="px-1.5 py-0.5 bg-primary/10 text-xs rounded text-primary">Selected</div>
                              <a
                                href={selectedComponents[category.id][0]?.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button variant="ghost" size="sm" className="h-5 px-1.5 text-xs">
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              </a>
                            </div>
                          </div>
                        ) : (selectedComponents[category.id]?.[0]?.id &&
                            crossSitePrices[category.id]?.[selectedComponents[category.id][0]?.id]?.["Skyland"]) ||
                          crossSitePrices[category.id]?.default?.["Skyland"] ? (
                          <div className="flex flex-col space-y-1 items-center">
                            <div className="font-medium text-sm text-center">
                              {renderPrice(crossSitePrices[category.id]?.default?.["Skyland"]?.price || "", "Skyland")}
                            </div>
                            <div className="flex items-center justify-center gap-1 mt-1">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-5 px-1.5 text-xs text-primary border-primary/30 hover:bg-primary/5 hover:text-primary hover:border-primary"
                                onClick={() =>
                                  selectCrossSiteComponent(
                                    category.id,
                                    crossSitePrices[category.id]?.default?.["Skyland"]!,
                                  )
                                }
                              >
                                <Check className="h-3 w-3 mr-0.5" />
                                Select
                              </Button>
                              <a
                                href={crossSitePrices[category.id]?.default?.["Skyland"]?.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button variant="ghost" size="sm" className="h-5 px-1.5 text-xs">
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              </a>
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm text-center block">N/A</span>
                        )}
                      </td>
                    </tr>

                    {/* Additional rows for multiple components */}
                    {hasComponents &&
                      selectedComponents[category.id].length > 1 &&
                      selectedComponents[category.id].slice(1).map((component, index) => (
                        <tr key={component.id || `${category.id}-${index + 1}`} className="border-b bg-muted/20">
                          <td className="p-2 pl-6 text-xs text-muted-foreground">
                            {category.label} #{index + 2}
                          </td>
                          <td className="p-2">
                            <div className="flex items-start gap-2">
                              <div className="w-10 h-10 bg-white rounded relative flex-shrink-0">
                                {component.image ? (
                                  <Image
                                    src={component.image || ""}
                                    alt={component.name || ""}
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
                                <ProductTooltip product={component}>
                                  <div className="font-medium text-xs truncate max-w-[180px]">
                                    {truncateName(component.name || "", 4)}
                                  </div>
                                </ProductTooltip>
                                <div className="flex gap-1 mt-1">
                                  <Link href={`/build/components/${category.id}`}>
                                    <Button variant="link" className="p-0 h-auto text-[10px] text-muted-foreground">
                                      Change
                                    </Button>
                                  </Link>
                                  <Button
                                    variant="link"
                                    className="p-0 h-auto text-[10px] text-red-500"
                                    onClick={() => removeComponent(category.id, component.id || "")}
                                  >
                                    Remove
                                  </Button>
                                  <Button
                                    variant="link"
                                    className="p-0 h-auto text-[10px] text-primary"
                                    onClick={() => refreshCrossSitePrices(category.id, component)}
                                    disabled={crossSiteLoading[component.id || ""]}
                                  >
                                    {crossSiteLoading[component.id || ""] ? (
                                      <RefreshCw className="h-2 w-2 mr-0.5 animate-spin" />
                                    ) : (
                                      <RefreshCw className="h-2 w-2 mr-0.5" />
                                    )}
                                    Compare
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-2 text-center">
                            <div className="text-center font-medium text-sm">
                              {renderPrice(component.price || "", component.source || "")}
                            </div>
                          </td>
                          {/* Retailer columns for additional components */}
                          <td className="p-2 text-center">
                            {/* Startech column */}
                            {component.source === "Startech" ? (
                              <div className="flex flex-col space-y-1 items-center">
                                <div className="font-medium text-sm text-center">
                                  {renderPrice(component.price || "", "Startech")}
                                </div>
                                <div className="flex items-center justify-center gap-1 mt-1">
                                  <div className="px-1.5 py-0.5 bg-primary/10 text-xs rounded text-primary">
                                    Selected
                                  </div>
                                  <a href={component.url} target="_blank" rel="noopener noreferrer">
                                    <Button variant="ghost" size="sm" className="h-5 px-1.5 text-xs">
                                      <ExternalLink className="h-3 w-3" />
                                    </Button>
                                  </a>
                                </div>
                              </div>
                            ) : (component.id && crossSitePrices[category.id]?.[component.id]?.Startech) ||
                              crossSitePrices[category.id]?.[component.id || ""]?.Startech ? (
                              <div className="flex flex-col space-y-1 items-center">
                                <div className="font-medium text-sm text-center">
                                  {renderPrice(
                                    crossSitePrices[category.id]?.[component.id || ""]?.Startech?.price || "",
                                    "Startech",
                                  )}
                                </div>
                                <div className="flex items-center justify-center gap-1 mt-1">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-5 px-1.5 text-xs text-primary border-primary/30 hover:bg-primary/5 hover:text-primary hover:border-primary"
                                    onClick={() =>
                                      selectCrossSiteComponent(
                                        category.id,
                                        crossSitePrices[category.id]?.[component.id || ""]?.Startech!,
                                        component.id,
                                      )
                                    }
                                  >
                                    <Check className="h-3 w-3 mr-0.5" />
                                    Select
                                  </Button>
                                  <a
                                    href={crossSitePrices[category.id]?.[component.id || ""]?.Startech?.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <Button variant="ghost" size="sm" className="h-5 px-1.5 text-xs">
                                      <ExternalLink className="h-3 w-3" />
                                    </Button>
                                  </a>
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm text-center block">N/A</span>
                            )}
                          </td>
                          <td className="p-2 text-center">
                            {/* Techland column */}
                            {component.source === "Techland" ? (
                              <div className="flex flex-col space-y-1 items-center">
                                <div className="font-medium text-sm text-center">
                                  {renderPrice(component.price || "", "Techland")}
                                </div>
                                <div className="flex items-center justify-center gap-1 mt-1">
                                  <div className="px-1.5 py-0.5 bg-primary/10 text-xs rounded text-primary">
                                    Selected
                                  </div>
                                  <a href={component.url} target="_blank" rel="noopener noreferrer">
                                    <Button variant="ghost" size="sm" className="h-5 px-1.5 text-xs">
                                      <ExternalLink className="h-3 w-3" />
                                    </Button>
                                  </a>
                                </div>
                              </div>
                            ) : (component.id && crossSitePrices[category.id]?.[component.id]?.Techland) ||
                              crossSitePrices[category.id]?.[component.id || ""]?.Techland ? (
                              <div className="flex flex-col space-y-1 items-center">
                                <div className="font-medium text-sm text-center">
                                  {renderPrice(
                                    crossSitePrices[category.id]?.[component.id || ""]?.Techland?.price || "",
                                    "Techland",
                                  )}
                                </div>
                                <div className="flex items-center justify-center gap-1 mt-1">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-5 px-1.5 text-xs text-primary border-primary/30 hover:bg-primary/5 hover:text-primary hover:border-primary"
                                    onClick={() =>
                                      selectCrossSiteComponent(
                                        category.id,
                                        crossSitePrices[category.id]?.[component.id || ""]?.Techland!,
                                        component.id,
                                      )
                                    }
                                  >
                                    <Check className="h-3 w-3 mr-0.5" />
                                    Select
                                  </Button>
                                  <a
                                    href={crossSitePrices[category.id]?.[component.id || ""]?.Techland?.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <Button variant="ghost" size="sm" className="h-5 px-1.5 text-xs">
                                      <ExternalLink className="h-3 w-3" />
                                    </Button>
                                  </a>
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm text-center block">N/A</span>
                            )}
                          </td>
                          <td className="p-2 text-center">
                            {/* UltraTech column */}
                            {component.source === "UltraTech" ? (
                              <div className="flex flex-col space-y-1 items-center">
                                <div className="font-medium text-sm text-center">
                                  {renderPrice(component.price || "", "UltraTech")}
                                </div>
                                <div className="flex items-center justify-center gap-1 mt-1">
                                  <div className="px-1.5 py-0.5 bg-primary/10 text-xs rounded text-primary">
                                    Selected
                                  </div>
                                  <a href={component.url} target="_blank" rel="noopener noreferrer">
                                    <Button variant="ghost" size="sm" className="h-5 px-1.5 text-xs">
                                      <ExternalLink className="h-3 w-3" />
                                    </Button>
                                  </a>
                                </div>
                              </div>
                            ) : (component.id && crossSitePrices[category.id]?.[component.id]?.UltraTech) ||
                              crossSitePrices[category.id]?.[component.id || ""]?.UltraTech ? (
                              <div className="flex flex-col space-y-1 items-center">
                                <div className="font-medium text-sm text-center">
                                  {renderPrice(
                                    crossSitePrices[category.id]?.[component.id || ""]?.UltraTech?.price || "",
                                    "UltraTech",
                                  )}
                                </div>
                                <div className="flex items-center justify-center gap-1 mt-1">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-5 px-1.5 text-xs text-primary border-primary/30 hover:bg-primary/5 hover:text-primary hover:border-primary"
                                    onClick={() =>
                                      selectCrossSiteComponent(
                                        category.id,
                                        crossSitePrices[category.id]?.[component.id || ""]?.UltraTech!,
                                        component.id,
                                      )
                                    }
                                  >
                                    <Check className="h-3 w-3 mr-0.5" />
                                    Select
                                  </Button>
                                  <a
                                    href={crossSitePrices[category.id]?.[component.id || ""]?.UltraTech?.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <Button variant="ghost" size="sm" className="h-5 px-1.5 text-xs">
                                      <ExternalLink className="h-3 w-3" />
                                    </Button>
                                  </a>
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm text-center block">N/A</span>
                            )}
                          </td>
                          <td className="p-2 text-center">
                            {/* Potaka IT column */}
                            {component.source === "Potaka IT" ? (
                              <div className="flex flex-col space-y-1 items-center">
                                <div className="font-medium text-sm text-center">
                                  {renderPrice(component.price || "", "Potaka IT")}
                                </div>
                                <div className="flex items-center justify-center gap-1 mt-1">
                                  <div className="px-1.5 py-0.5 bg-primary/10 text-xs rounded text-primary">
                                    Selected
                                  </div>
                                  <a href={component.url} target="_blank" rel="noopener noreferrer">
                                    <Button variant="ghost" size="sm" className="h-5 px-1.5 text-xs">
                                      <ExternalLink className="h-3 w-3" />
                                    </Button>
                                  </a>
                                </div>
                              </div>
                            ) : (component.id && crossSitePrices[category.id]?.[component.id]?.["Potaka IT"]) ||
                              crossSitePrices[category.id]?.[component.id || ""]?.["Potaka IT"] ? (
                              <div className="flex flex-col space-y-1 items-center">
                                <div className="font-medium text-sm text-center">
                                  {renderPrice(
                                    crossSitePrices[category.id]?.[component.id || ""]?.["Potaka IT"]?.price || "",
                                    "Potaka IT",
                                  )}
                                </div>
                                <div className="flex items-center justify-center gap-1 mt-1">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-5 px-1.5 text-xs text-primary border-primary/30 hover:bg-primary/5 hover:text-primary hover:border-primary"
                                    onClick={() =>
                                      selectCrossSiteComponent(
                                        category.id,
                                        crossSitePrices[category.id]?.[component.id || ""]?.["Potaka IT"]!,
                                        component.id,
                                      )
                                    }
                                  >
                                    <Check className="h-3 w-3 mr-0.5" />
                                    Select
                                  </Button>
                                  <a
                                    href={crossSitePrices[category.id]?.[component.id || ""]?.["Potaka IT"]?.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <Button variant="ghost" size="sm" className="h-5 px-1.5 text-xs">
                                      <ExternalLink className="h-3 w-3" />
                                    </Button>
                                  </a>
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm text-center block">N/A</span>
                            )}
                          </td>
                          <td className="p-2 text-center">
                            {/* PC House column */}
                            {component.source === "PC House" ? (
                              <div className="flex flex-col space-y-1 items-center">
                                <div className="font-medium text-sm text-center">
                                  {renderPrice(component.price || "", "PC House")}
                                </div>
                                <div className="flex items-center justify-center gap-1 mt-1">
                                  <div className="px-1.5 py-0.5 bg-primary/10 text-xs rounded text-primary">
                                    Selected
                                  </div>
                                  <a href={component.url} target="_blank" rel="noopener noreferrer">
                                    <Button variant="ghost" size="sm" className="h-5 px-1.5 text-xs">
                                      <ExternalLink className="h-3 w-3" />
                                    </Button>
                                  </a>
                                </div>
                              </div>
                            ) : (component.id && crossSitePrices[category.id]?.[component.id]?.["PC House"]) ||
                              crossSitePrices[category.id]?.[component.id || ""]?.["PC House"] ? (
                              <div className="flex flex-col space-y-1 items-center">
                                <div className="font-medium text-sm text-center">
                                  {renderPrice(
                                    crossSitePrices[category.id]?.[component.id || ""]?.["PC House"]?.price || "",
                                    "PC House",
                                  )}
                                </div>
                                <div className="flex items-center justify-center gap-1 mt-1">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-5 px-1.5 text-xs text-primary border-primary/30 hover:bg-primary/5 hover:text-primary hover:border-primary"
                                    onClick={() =>
                                      selectCrossSiteComponent(
                                        category.id,
                                        crossSitePrices[category.id]?.[component.id || ""]?.["PC House"]!,
                                        component.id,
                                      )
                                    }
                                  >
                                    <Check className="h-3 w-3 mr-0.5" />
                                    Select
                                  </Button>
                                  <a
                                    href={crossSitePrices[category.id]?.[component.id || ""]?.["PC House"]?.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <Button variant="ghost" size="sm" className="h-5 px-1.5 text-xs">
                                      <ExternalLink className="h-3 w-3" />
                                    </Button>
                                  </a>
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm text-center block">N/A</span>
                            )}
                          </td>
                          <td className="p-2 text-center">
                            {/* Skyland column */}
                            {component.source === "Skyland" ? (
                              <div className="flex flex-col space-y-1 items-center">
                                <div className="font-medium text-sm text-center">
                                  {renderPrice(component.price || "", "Skyland")}
                                </div>
                                <div className="flex items-center justify-center gap-1 mt-1">
                                  <div className="px-1.5 py-0.5 bg-primary/10 text-xs rounded text-primary">
                                    Selected
                                  </div>
                                  <a href={component.url} target="_blank" rel="noopener noreferrer">
                                    <Button variant="ghost" size="sm" className="h-5 px-1.5 text-xs">
                                      <ExternalLink className="h-3 w-3" />
                                    </Button>
                                  </a>
                                </div>
                              </div>
                            ) : (component.id && crossSitePrices[category.id]?.[component.id]?.["Skyland"]) ||
                              crossSitePrices[category.id]?.[component.id || ""]?.["Skyland"] ? (
                              <div className="flex flex-col space-y-1 items-center">
                                <div className="font-medium text-sm text-center">
                                  {renderPrice(
                                    crossSitePrices[category.id]?.[component.id || ""]?.["Skyland"]?.price || "",
                                    "Skyland",
                                  )}
                                </div>
                                <div className="flex items-center justify-center gap-1 mt-1">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-5 px-1.5 text-xs text-primary border-primary/30 hover:bg-primary/5 hover:text-primary hover:border-primary"
                                    onClick={() =>
                                      selectCrossSiteComponent(
                                        category.id,
                                        crossSitePrices[category.id]?.[component.id || ""]?.["Skyland"]!,
                                        component.id,
                                      )
                                    }
                                  >
                                    <Check className="h-3 w-3 mr-0.5" />
                                    Select
                                  </Button>
                                  <a
                                    href={crossSitePrices[category.id]?.[component.id || ""]?.["Skyland"]?.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <Button variant="ghost" size="sm" className="h-5 px-1.5 text-xs">
                                      <ExternalLink className="h-3 w-3" />
                                    </Button>
                                  </a>
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm text-center block">N/A</span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </React.Fragment>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="bg-muted border-t-2 border-border">
                <td colSpan={2} className="p-2 text-right font-bold text-sm">
                  Total:
                </td>
                <td className="p-2 text-center">
                  {loading ? (
                    <Skeleton className="h-6 w-20 mx-auto" />
                  ) : totalBase > 0 ? (
                    <div className="font-bold text-base text-primary text-center">৳ {totalBase.toLocaleString()}</div>
                  ) : (
                    <span className="text-muted-foreground text-center block">N/A</span>
                  )}
                </td>
                <td className="p-2 text-center">
                  {loading ? (
                    <Skeleton className="h-6 w-20 mx-auto" />
                  ) : totalStartech > 0 ? (
                    <div className="font-bold text-base text-primary text-center">
                      ৳ {totalStartech.toLocaleString()}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-center block">N/A</span>
                  )}
                </td>
                <td className="p-2 text-center">
                  {loading ? (
                    <Skeleton className="h-6 w-20 mx-auto" />
                  ) : totalTechland > 0 ? (
                    <div className="font-bold text-base text-primary text-center">
                      ৳ {totalTechland.toLocaleString()}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-center block">N/A</span>
                  )}
                </td>
                <td className="p-2 text-center">
                  {loading ? (
                    <Skeleton className="h-6 w-20 mx-auto" />
                  ) : totalUltraTech > 0 ? (
                    <div className="font-bold text-base text-primary text-center">
                      ৳ {totalUltraTech.toLocaleString()}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-center block">N/A</span>
                  )}
                </td>
                <td className="p-2 text-center">
                  {loading ? (
                    <Skeleton className="h-6 w-20 mx-auto" />
                  ) : totalPotakaIT > 0 ? (
                    <div className="font-bold text-base text-primary text-center">
                      ৳ {totalPotakaIT.toLocaleString()}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-center block">N/A</span>
                  )}
                </td>
                <td className="p-2 text-center">
                  {loading ? (
                    <Skeleton className="h-6 w-20 mx-auto" />
                  ) : totalPCHouse > 0 ? (
                    <div className="font-bold text-base text-primary text-center">
                      ৳ {totalPCHouse.toLocaleString()}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-center block">N/A</span>
                  )}
                </td>
                <td className="p-2 text-center">
                  {loading ? (
                    <Skeleton className="h-6 w-20 mx-auto" />
                  ) : totalSkyland > 0 ? (
                    <div className="font-bold text-base text-primary text-center">
                      ৳ {totalSkyland.toLocaleString()}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-center block">N/A</span>
                  )}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
