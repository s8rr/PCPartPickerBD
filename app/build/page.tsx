"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Plus,
  Save,
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
} from "lucide-react"
import Image from "next/image"
import { SiteHeader } from "@/components/site-header"
import { AttentionBanner } from "@/components/attention-banner"

// Define component types
interface PCComponent {
  type: string
  name: string
  price: string
  image: string
  source: string
  url: string
  availability: string
}

interface CrossSiteComponent {
  name: string
  price: string
  image: string
  availability: string
  source: string
  url: string
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
  const [selectedComponents, setSelectedComponents] = useState<Record<string, PCComponent | null>>({})
  const [crossSitePrices, setCrossSitePrices] = useState<Record<string, CrossSitePrices>>({})
  const [loading, setLoading] = useState(true)
  const [crossSiteLoading, setCrossSiteLoading] = useState<Record<string, boolean>>({})

  // Load build from localStorage on component mount
  useEffect(() => {
    const savedBuild = localStorage.getItem("pcBuild")
    const savedCrossSitePrices = localStorage.getItem("pcBuildCrossSitePrices")

    if (savedBuild) {
      const parsedBuild = JSON.parse(savedBuild)
      setSelectedComponents(parsedBuild)

      // If we have saved cross-site prices, load them
      if (savedCrossSitePrices) {
        const parsedCrossSitePrices = JSON.parse(savedCrossSitePrices)
        setCrossSitePrices(parsedCrossSitePrices)
      } else {
        // Otherwise fetch cross-site prices for each component
        Object.entries(parsedBuild).forEach(([type, component]) => {
          if (component) {
            fetchCrossSitePrices(type, component)
          }
        })
      }
    }

    // Simulate loading delay for demonstration
    const timer = setTimeout(() => {
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  // Update the useEffect for calculating totals to include base total calculation
  useEffect(() => {
    let baseTotal = 0
    let startechTotal = 0
    let techlandTotal = 0
    let ultratechTotal = 0
    let potakaitTotal = 0
    let pchouseTotal = 0
    let skylandTotal = 0 // Add this line

    // Calculate base total from selected components only
    Object.entries(selectedComponents).forEach(([type, component]) => {
      if (component) {
        // Extract the numeric price value
        const priceMatch = component.price.match(/৳\s*([\d,]+)/)
        if (priceMatch && priceMatch[1]) {
          const priceValue = Number.parseFloat(priceMatch[1].replace(/,/g, ""))
          if (!isNaN(priceValue)) {
            // Add to base total regardless of source
            baseTotal += priceValue

            // Also add to the specific retailer total
            if (component.source === "Startech") {
              startechTotal += priceValue
            } else if (component.source === "Techland") {
              techlandTotal += priceValue
            } else if (component.source === "UltraTech") {
              ultratechTotal += priceValue
            } else if (component.source === "Potaka IT") {
              potakaitTotal += priceValue
            } else if (component.source === "PC House") {
              pchouseTotal += priceValue
            } else if (component.source === "Skyland") {
              skylandTotal += priceValue
            }
          }
        }
      }
    })

    // For retailer-specific totals, we need to calculate the total cost if all components were bought from that retailer
    // This means using cross-site prices for components not selected from that retailer

    // Create a map to track which component types have been counted for each retailer
    const countedTypes = {
      Startech: new Set<string>(),
      Techland: new Set<string>(),
      UltraTech: new Set<string>(),
      "Potaka IT": new Set<string>(),
      "PC House": new Set<string>(),
      Skyland: new Set<string>(), // Add this line
    }

    // First, add all selected components to their respective retailer totals and mark them as counted
    Object.entries(selectedComponents).forEach(([type, component]) => {
      if (component) {
        const source = component.source
        if (
          source &&
          (source === "Startech" ||
            source === "Techland" ||
            source === "UltraTech" ||
            source === "Potaka IT" ||
            source === "PC House" ||
            source === "Skyland")
        ) {
          countedTypes[source].add(type)
        }
      }
    })

    // Then, for each component type, add cross-site prices for retailers that don't have that component selected
    Object.entries(crossSitePrices).forEach(([type, prices]) => {
      // For each retailer, check if we need to add a cross-site price
      Object.entries(prices).forEach(([retailer, component]) => {
        if (component && !countedTypes[retailer].has(type)) {
          // Extract the numeric price value
          const priceMatch = component.price.match(/৳\s*([\d,]+)/)
          if (priceMatch && priceMatch[1]) {
            const priceValue = Number.parseFloat(priceMatch[1].replace(/,/g, ""))
            if (!isNaN(priceValue)) {
              // Add to the specific retailer total
              if (retailer === "Startech") {
                startechTotal += priceValue
                countedTypes.Startech.add(type)
              } else if (retailer === "Techland") {
                techlandTotal += priceValue
                countedTypes.Techland.add(type)
              } else if (retailer === "UltraTech") {
                ultratechTotal += priceValue
                countedTypes.UltraTech.add(type)
              } else if (retailer === "Potaka IT") {
                potakaitTotal += priceValue
                countedTypes["Potaka IT"].add(type)
              } else if (retailer === "PC House") {
                pchouseTotal += priceValue
                countedTypes["PC House"].add(type)
              } else if (retailer === "Skyland") {
                skylandTotal += priceValue
                countedTypes.Skyland.add(type)
              }
            }
          }
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

  // Function to fetch cross-site prices for a component
  const fetchCrossSitePrices = async (type: string, component: PCComponent) => {
    setCrossSiteLoading((prev) => ({ ...prev, [type]: true }))

    try {
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

      setCrossSitePrices((prev) => {
        const updated = {
          ...prev,
          [type]: data.crossSiteProducts,
        }

        // Save to localStorage
        localStorage.setItem("pcBuildCrossSitePrices", JSON.stringify(updated))

        return updated
      })
    } catch (error) {
      console.error("Error fetching cross-site prices:", error)
      // Don't update state on error to keep previous data
    } finally {
      setCrossSiteLoading((prev) => ({ ...prev, [type]: false }))
    }
  }

  // Function to remove a component from the build
  const removeComponent = (categoryId: string) => {
    const updatedComponents = { ...selectedComponents }
    delete updatedComponents[categoryId]

    // Also remove cross-site prices
    const updatedCrossSitePrices = { ...crossSitePrices }
    delete updatedCrossSitePrices[categoryId]

    setSelectedComponents(updatedComponents)
    setCrossSitePrices(updatedCrossSitePrices)

    // Update both in localStorage
    localStorage.setItem("pcBuild", JSON.stringify(updatedComponents))
    localStorage.setItem("pcBuildCrossSitePrices", JSON.stringify(updatedCrossSitePrices))
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
  const selectCrossSiteComponent = (type: string, component: CrossSiteComponent) => {
    const newComponent: PCComponent = {
      type,
      name: component.name,
      price: component.price,
      image: component.image,
      source: component.source,
      url: component.url,
      availability: component.availability,
    }

    const updatedComponents = { ...selectedComponents, [type]: newComponent }
    setSelectedComponents(updatedComponents)
    localStorage.setItem("pcBuild", JSON.stringify(updatedComponents))

    // Fetch cross-site prices for the new component
    fetchCrossSitePrices(type, newComponent)
  }

  return (
    <div className="min-h-screen">
      <AttentionBanner />
      <SiteHeader />
      <div className="container mx-auto py-8 px-4">
        <div className="bg-card rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4 justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Your PC Build</h2>
              <p className="text-muted-foreground">Select components to build your PC</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Save className="mr-2 h-4 w-4" />
                Save Build
              </Button>
              <Button variant="outline" size="sm">
                <Share className="mr-2 h-4 w-4" />
                Share
              </Button>
              <Button size="sm">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Buy Parts
              </Button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted">
                <th className="p-3 text-left font-medium text-sm">Component</th>
                <th className="p-3 text-left font-medium text-sm">Selection</th>
                <th className="p-3 text-left font-medium text-sm">Base</th>
                <th className="p-3 text-left font-medium text-sm">
                  <div className="flex items-center">
                    <div className="h-6 w-6 rounded-full bg-blue-900 flex items-center justify-center text-white text-xs mr-2 shadow-sm">
                      ST
                    </div>
                    <span>Startech</span>
                  </div>
                </th>
                <th className="p-3 text-left font-medium text-sm">
                  <div className="flex items-center">
                    <div className="h-6 w-6 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs mr-2 shadow-sm">
                      TL
                    </div>
                    <span>Techland</span>
                  </div>
                </th>
                <th className="p-3 text-left font-medium text-sm">
                  <div className="flex items-center">
                    <div className="h-6 w-6 rounded-full bg-purple-900 flex items-center justify-center text-white text-xs mr-2 shadow-sm">
                      UT
                    </div>
                    <span>UltraTech</span>
                  </div>
                </th>
                <th className="p-3 text-left font-medium text-sm">
                  <div className="flex items-center">
                    <div className="h-6 w-6 rounded-full bg-green-900 flex items-center justify-center text-white text-xs mr-2 shadow-sm">
                      PI
                    </div>
                    <span>Potaka IT</span>
                  </div>
                </th>
                <th className="p-3 text-left font-medium text-sm">
                  <div className="flex items-center">
                    <div className="h-6 w-6 rounded-full bg-red-900 flex items-center justify-center text-white text-xs mr-2 shadow-sm">
                      PC
                    </div>
                    <span>PC House</span>
                  </div>
                </th>
                <th className="p-3 text-left font-medium text-sm">
                  <div className="flex items-center">
                    <div className="h-6 w-6 rounded-full bg-teal-900 flex items-center justify-center text-white text-xs mr-2 shadow-sm">
                      SK
                    </div>
                    <span>Skyland</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {componentCategories.map((category) => (
                <tr key={category.id} className="border-b">
                  <td className="p-3">
                    <Link
                      href={`/build/components/${category.id}`}
                      className="text-primary hover:underline flex items-center"
                    >
                      <category.icon className="mr-2 h-4 w-4" />
                      {category.label}
                    </Link>
                  </td>
                  <td className="p-3">
                    {loading ? (
                      <div className="flex items-start gap-3">
                        <Skeleton className="w-12 h-12 rounded" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-32 mb-2" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                    ) : selectedComponents[category.id] ? (
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-white rounded relative flex-shrink-0">
                          {selectedComponents[category.id]?.image ? (
                            <Image
                              src={selectedComponents[category.id]?.image || ""}
                              alt={selectedComponents[category.id]?.name || ""}
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
                          <div className="font-medium text-sm">{selectedComponents[category.id]?.name}</div>
                          <div className="flex gap-2 mt-1">
                            <Link href={`/build/components/${category.id}`}>
                              <Button variant="link" className="p-0 h-auto text-xs text-muted-foreground">
                                Change
                              </Button>
                            </Link>
                            <Button
                              variant="link"
                              className="p-0 h-auto text-xs text-red-500"
                              onClick={() => removeComponent(category.id)}
                            >
                              Remove
                            </Button>
                            <Button
                              variant="link"
                              className="p-0 h-auto text-xs text-primary"
                              onClick={() => refreshCrossSitePrices(category.id, selectedComponents[category.id]!)}
                              disabled={crossSiteLoading[category.id]}
                            >
                              {crossSiteLoading[category.id] ? (
                                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                              ) : (
                                <RefreshCw className="h-3 w-3 mr-1" />
                              )}
                              Compare
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Link href={`/build/components/${category.id}`}>
                        <Button size="sm" variant="secondary" className="flex items-center">
                          <Plus className="mr-1 h-4 w-4" />
                          Choose {category.label === "Memory" || category.label === "Storage" ? "" : "A"}{" "}
                          {category.label}
                        </Button>
                      </Link>
                    )}
                  </td>
                  <td className="p-3">
                    {loading ? (
                      <Skeleton className="h-5 w-16" />
                    ) : selectedComponents[category.id] ? (
                      renderPrice(
                        selectedComponents[category.id]?.price || "",
                        selectedComponents[category.id]?.source || "",
                      )
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="p-3">
                    {loading ? (
                      <Skeleton className="h-5 w-16" />
                    ) : selectedComponents[category.id]?.source === "Startech" ? (
                      <div className="flex flex-col space-y-2">
                        <div className="font-medium text-sm">
                          {renderPrice(selectedComponents[category.id]?.price || "", "Startech")}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="px-1.5 py-0.5 bg-primary/10 text-xs rounded text-primary">Selected</div>
                          <a href={selectedComponents[category.id]?.url} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View
                            </Button>
                          </a>
                        </div>
                      </div>
                    ) : crossSitePrices[category.id]?.Startech ? (
                      <div className="flex flex-col space-y-2">
                        <div className="font-medium text-sm">
                          {renderPrice(crossSitePrices[category.id]?.Startech?.price || "", "Startech")}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 px-2 text-xs text-primary border-primary/30 hover:bg-primary/5 hover:text-primary hover:border-primary"
                            onClick={() =>
                              selectCrossSiteComponent(category.id, crossSitePrices[category.id]?.Startech!)
                            }
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Select
                          </Button>
                          <a
                            href={crossSitePrices[category.id]?.Startech?.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View
                            </Button>
                          </a>
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">N/A</span>
                    )}
                  </td>
                  <td className="p-3">
                    {loading ? (
                      <Skeleton className="h-5 w-16" />
                    ) : selectedComponents[category.id]?.source === "Techland" ? (
                      <div className="flex flex-col space-y-2">
                        <div className="font-medium text-sm">
                          {renderPrice(selectedComponents[category.id]?.price || "", "Techland")}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="px-1.5 py-0.5 bg-primary/10 text-xs rounded text-primary">Selected</div>
                          <a href={selectedComponents[category.id]?.url} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View
                            </Button>
                          </a>
                        </div>
                      </div>
                    ) : crossSitePrices[category.id]?.Techland ? (
                      <div className="flex flex-col space-y-2">
                        <div className="font-medium text-sm">
                          {renderPrice(crossSitePrices[category.id]?.Techland?.price || "", "Techland")}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 px-2 text-xs text-primary border-primary/30 hover:bg-primary/5 hover:text-primary hover:border-primary"
                            onClick={() =>
                              selectCrossSiteComponent(category.id, crossSitePrices[category.id]?.Techland!)
                            }
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Select
                          </Button>
                          <a
                            href={crossSitePrices[category.id]?.Techland?.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View
                            </Button>
                          </a>
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">N/A</span>
                    )}
                  </td>
                  <td className="p-3">
                    {loading ? (
                      <Skeleton className="h-5 w-16" />
                    ) : selectedComponents[category.id]?.source === "UltraTech" ? (
                      <div className="flex flex-col space-y-2">
                        <div className="font-medium text-sm">
                          {renderPrice(selectedComponents[category.id]?.price || "", "UltraTech")}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="px-1.5 py-0.5 bg-primary/10 text-xs rounded text-primary">Selected</div>
                          <a href={selectedComponents[category.id]?.url} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View
                            </Button>
                          </a>
                        </div>
                      </div>
                    ) : crossSitePrices[category.id]?.UltraTech ? (
                      <div className="flex flex-col space-y-2">
                        <div className="font-medium text-sm">
                          {renderPrice(crossSitePrices[category.id]?.UltraTech?.price || "", "UltraTech")}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 px-2 text-xs text-primary border-primary/30 hover:bg-primary/5 hover:text-primary hover:border-primary"
                            onClick={() =>
                              selectCrossSiteComponent(category.id, crossSitePrices[category.id]?.UltraTech!)
                            }
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Select
                          </Button>
                          <a
                            href={crossSitePrices[category.id]?.UltraTech?.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View
                            </Button>
                          </a>
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">N/A</span>
                    )}
                  </td>
                  <td className="p-3">
                    {loading ? (
                      <Skeleton className="h-5 w-16" />
                    ) : selectedComponents[category.id]?.source === "Potaka IT" ? (
                      <div className="flex flex-col space-y-2">
                        <div className="font-medium text-sm">
                          {renderPrice(selectedComponents[category.id]?.price || "", "Potaka IT")}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="px-1.5 py-0.5 bg-primary/10 text-xs rounded text-primary">Selected</div>
                          <a href={selectedComponents[category.id]?.url} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View
                            </Button>
                          </a>
                        </div>
                      </div>
                    ) : crossSitePrices[category.id]?.["Potaka IT"] ? (
                      <div className="flex flex-col space-y-2">
                        <div className="font-medium text-sm">
                          {renderPrice(crossSitePrices[category.id]?.["Potaka IT"]?.price || "", "Potaka IT")}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 px-2 text-xs text-primary border-primary/30 hover:bg-primary/5 hover:text-primary hover:border-primary"
                            onClick={() =>
                              selectCrossSiteComponent(category.id, crossSitePrices[category.id]?.["Potaka IT"]!)
                            }
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Select
                          </Button>
                          <a
                            href={crossSitePrices[category.id]?.["Potaka IT"]?.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View
                            </Button>
                          </a>
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">N/A</span>
                    )}
                  </td>
                  <td className="p-3">
                    {loading ? (
                      <Skeleton className="h-5 w-16" />
                    ) : selectedComponents[category.id]?.source === "PC House" ? (
                      <div className="flex flex-col space-y-2">
                        <div className="font-medium text-sm">
                          {renderPrice(selectedComponents[category.id]?.price || "", "PC House")}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="px-1.5 py-0.5 bg-primary/10 text-xs rounded text-primary">Selected</div>
                          <a href={selectedComponents[category.id]?.url} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View
                            </Button>
                          </a>
                        </div>
                      </div>
                    ) : crossSitePrices[category.id]?.["PC House"] ? (
                      <div className="flex flex-col space-y-2">
                        <div className="font-medium text-sm">
                          {renderPrice(crossSitePrices[category.id]?.["PC House"]?.price || "", "PC House")}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 px-2 text-xs text-primary border-primary/30 hover:bg-primary/5 hover:text-primary hover:border-primary"
                            onClick={() =>
                              selectCrossSiteComponent(category.id, crossSitePrices[category.id]?.["PC House"]!)
                            }
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Select
                          </Button>
                          <a
                            href={crossSitePrices[category.id]?.["PC House"]?.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View
                            </Button>
                          </a>
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">N/A</span>
                    )}
                  </td>
                  <td className="p-3">
                    {loading ? (
                      <Skeleton className="h-5 w-16" />
                    ) : selectedComponents[category.id]?.source === "Skyland" ? (
                      <div className="flex flex-col space-y-2">
                        <div className="font-medium text-sm">
                          {renderPrice(selectedComponents[category.id]?.price || "", "Skyland")}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="px-1.5 py-0.5 bg-primary/10 text-xs rounded text-primary">Selected</div>
                          <a href={selectedComponents[category.id]?.url} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View
                            </Button>
                          </a>
                        </div>
                      </div>
                    ) : crossSitePrices[category.id]?.["Skyland"] ? (
                      <div className="flex flex-col space-y-2">
                        <div className="font-medium text-sm">
                          {renderPrice(crossSitePrices[category.id]?.["Skyland"]?.price || "", "Skyland")}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 px-2 text-xs text-primary border-primary/30 hover:bg-primary/5 hover:text-primary hover:border-primary"
                            onClick={() =>
                              selectCrossSiteComponent(category.id, crossSitePrices[category.id]?.["Skyland"]!)
                            }
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Select
                          </Button>
                          <a
                            href={crossSitePrices[category.id]?.["Skyland"]?.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View
                            </Button>
                          </a>
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">N/A</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-muted border-t-2 border-border">
                <td colSpan={2} className="p-3 text-right font-bold">
                  Total:
                </td>
                <td className="p-3">
                  {loading ? (
                    <Skeleton className="h-7 w-24" />
                  ) : totalBase > 0 ? (
                    <div className="font-bold text-lg text-primary">৳ {totalBase.toLocaleString()}</div>
                  ) : (
                    <span className="text-muted-foreground">N/A</span>
                  )}
                </td>
                <td className="p-3">
                  {loading ? (
                    <Skeleton className="h-7 w-24" />
                  ) : totalStartech > 0 ? (
                    <div className="font-bold text-lg text-primary">৳ {totalStartech.toLocaleString()}</div>
                  ) : (
                    <span className="text-muted-foreground">N/A</span>
                  )}
                </td>
                <td className="p-3">
                  {loading ? (
                    <Skeleton className="h-7 w-24" />
                  ) : totalTechland > 0 ? (
                    <div className="font-bold text-lg text-primary">৳ {totalTechland.toLocaleString()}</div>
                  ) : (
                    <span className="text-muted-foreground">N/A</span>
                  )}
                </td>
                <td className="p-3">
                  {loading ? (
                    <Skeleton className="h-7 w-24" />
                  ) : totalUltraTech > 0 ? (
                    <div className="font-bold text-lg text-primary">৳ {totalUltraTech.toLocaleString()}</div>
                  ) : (
                    <span className="text-muted-foreground">N/A</span>
                  )}
                </td>
                <td className="p-3">
                  {loading ? (
                    <Skeleton className="h-7 w-24" />
                  ) : totalPotakaIT > 0 ? (
                    <div className="font-bold text-lg text-primary">৳ {totalPotakaIT.toLocaleString()}</div>
                  ) : (
                    <span className="text-muted-foreground">N/A</span>
                  )}
                </td>
                <td className="p-3">
                  {loading ? (
                    <Skeleton className="h-7 w-24" />
                  ) : totalPCHouse > 0 ? (
                    <div className="font-bold text-lg text-primary">৳ {totalPCHouse.toLocaleString()}</div>
                  ) : (
                    <span className="text-muted-foreground">N/A</span>
                  )}
                </td>
                <td className="p-3">
                  {loading ? (
                    <Skeleton className="h-7 w-24" />
                  ) : totalSkyland > 0 ? (
                    <div className="font-bold text-lg text-primary">৳ {totalSkyland.toLocaleString()}</div>
                  ) : (
                    <span className="text-muted-foreground">N/A</span>
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
