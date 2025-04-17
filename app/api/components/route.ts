import { type NextRequest, NextResponse } from "next/server"
import * as cheerio from "cheerio"

// Define the component interface
interface Component {
  name: string
  price: string
  image: string
  availability: string
  source: string
  url: string
  specs?: Record<string, string>
}

// Update the GET function to include better error handling and performance optimizations
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const type = searchParams.get("type")
  const search = searchParams.get("search")
  const limit = Number.parseInt(searchParams.get("limit") || "20", 10) // Default to 20 components per retailer

  if (!type) {
    return NextResponse.json({ error: "Component type parameter is required" }, { status: 400 })
  }

  try {
    // Create an array of promises for parallel fetching
    const fetchPromises = [
      fetchStartechComponents(type, search, limit),
      fetchTechlandComponents(type, search, limit),
      fetchUltratechComponents(type, search, limit),
      fetchPotakaitComponents(type, search, limit),
      fetchPCHouseComponents(type, search, limit),
      fetchSkylandComponents(type, search, limit),
    ]

    // Use Promise.allSettled to handle individual promise failures
    const results = await Promise.allSettled(fetchPromises)

    // Extract components from fulfilled promises
    const components = results
      .filter((result): result is PromiseFulfilledResult<Component[]> => result.status === "fulfilled")
      .flatMap((result) => result.value)

    // If searching, sort by relevance
    if (search) {
      components.sort((a, b) => {
        const scoreA = calculateSearchRelevance(a.name, search)
        const scoreB = calculateSearchRelevance(b.name, search)
        return scoreB - scoreA // Higher score first
      })
    }

    return NextResponse.json({ components })
  } catch (error) {
    console.error("Error fetching components:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch components",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// Optimized version of fetchStartechComponents
async function fetchStartechComponents(type: string, search?: string | null, limit = 20): Promise<Component[]> {
  const components: Component[] = []
  let url = ""

  // If search is provided, use search URL instead of category URL
  if (search) {
    url = `https://www.startech.com.bd/product/search?search=${encodeURIComponent(search)}`
  } else {
    // Map component type to Startech URL
    switch (type) {
      case "cpu":
        url = "https://www.startech.com.bd/component/processor"
        break
      case "cpu-cooler":
        url = "https://www.startech.com.bd/component/cooler"
        break
      case "motherboard":
        url = "https://www.startech.com.bd/component/motherboard"
        break
      case "memory":
        url = "https://www.startech.com.bd/component/ram"
        break
      case "storage":
        url = "https://www.startech.com.bd/component/hard-disk-drive"
        break
      case "video-card":
        url = "https://www.startech.com.bd/component/graphics-card"
        break
      case "case":
        url = "https://www.startech.com.bd/component/casing"
        break
      case "power-supply":
        url = "https://www.startech.com.bd/component/power-supply"
        break
      case "monitor":
        url = "https://www.startech.com.bd/monitor"
        break
      default:
        return []
    }
  }

  try {
    // Add timeout to prevent hanging requests
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Cache for 1 hour
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    }).catch((error) => {
      console.error(`Error fetching from Startech: ${error.message}`)
      return null
    })

    clearTimeout(timeoutId)

    if (!response || !response.ok) {
      console.warn(`Failed to fetch from Startech: ${response?.status || "No response"}`)
      return []
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Process only up to the limit
    $(".p-item")
      .slice(0, limit)
      .each((_, element) => {
        const name = $(element).find(".p-item-name").text().trim()

        // If searching, filter by component type
        if (search) {
          // Skip if this doesn't match our component type
          const isMatchingType = matchesComponentType(name, type)
          if (!isMatchingType) {
            return
          }
        }

        // Get both regular and special prices if available
        let price = $(element).find(".p-item-price").text().trim()
        const regularPrice = $(element).find(".regular-price").text().trim()
        const specialPrice = $(element).find(".special-price").text().trim()

        // If both regular and special prices exist, combine them
        if (regularPrice && specialPrice) {
          price = `${specialPrice} ${regularPrice}`
        }

        const image = $(element).find(".p-item-img img").attr("src") || ""
        const productUrl = $(element).find("a").attr("href") || ""

        // Extract basic specs from the name for CPUs
        const specs: Record<string, string> = {}
        if (type === "cpu") {
          // Try to extract CPU specs from the name
          const clockSpeedMatch = name.match(/(\d+\.\d+)GHz/)
          if (clockSpeedMatch) specs["Clock Speed"] = clockSpeedMatch[0]

          const coreMatch = name.match(/(\d+)[ -]Core/)
          if (coreMatch) specs["Cores"] = coreMatch[1]

          const threadMatch = name.match(/(\d+)[ -]Thread/)
          if (threadMatch) specs["Threads"] = threadMatch[1]

          const cacheMatch = name.match(/(\d+)MB Cache/)
          if (cacheMatch) specs["Cache"] = cacheMatch[0]
        }

        // Use availability from listing page instead of fetching product page
        const listingAvailability = $(element).find(".p-item-stock").text().trim()
        const availability = listingAvailability.toLowerCase().includes("in stock") ? "In Stock" : "Out of Stock"

        components.push({
          name,
          price,
          image,
          availability,
          source: "Startech",
          url: productUrl,
          specs,
        })
      })

    return components
  } catch (error) {
    console.error(`Error fetching ${type} from Startech:`, error instanceof Error ? error.message : "Unknown error")
    return []
  }
}

// Optimized version of fetchTechlandComponents
async function fetchTechlandComponents(type: string, search?: string | null, limit = 20): Promise<Component[]> {
  const components: Component[] = []
  let url = ""

  // If search is provided, use search URL instead of category URL
  if (search) {
    url = `https://www.techlandbd.com/index.php?route=product/search&search=${encodeURIComponent(search)}`
  } else {
    // Map component type to Techland URL
    switch (type) {
      case "cpu":
        url = "https://www.techlandbd.com/pc-components/processor"
        break
      case "cpu-cooler":
        url = "https://www.techlandbd.com/pc-components/cpu-cooler"
        break
      case "motherboard":
        url = "https://www.techlandbd.com/pc-components/motherboard"
        break
      case "memory":
        url = "https://www.techlandbd.com/pc-components/ram-memory"
        break
      case "storage":
        url = "https://www.techlandbd.com/pc-components/storage-device"
        break
      case "video-card":
        url = "https://www.techlandbd.com/pc-components/graphics-card"
        break
      case "case":
        url = "https://www.techlandbd.com/pc-components/casing"
        break
      case "power-supply":
        url = "https://www.techlandbd.com/pc-components/power-supply"
        break
      case "monitor":
        url = "https://www.techlandbd.com/shop-by-brands/monitor"
        break
      default:
        return []
    }
  }

  try {
    // Add timeout to prevent hanging requests
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Cache for 1 hour
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    }).catch((error) => {
      console.error(`Error fetching from Techland: ${error.message}`)
      return null
    })

    clearTimeout(timeoutId)

    if (!response || !response.ok) {
      console.warn(`Failed to fetch from Techland: ${response?.status || "No response"}`)
      return []
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Process only up to the limit
    $(".product-layout")
      .slice(0, limit)
      .each((_, element) => {
        const name = $(element).find(".name a").text().trim()

        // If searching, filter by component type
        if (search) {
          // Skip if this doesn't match our component type
          const isMatchingType = matchesComponentType(name, type)
          if (!isMatchingType) {
            return
          }
        }

        // Get both regular and special prices if available
        let price = $(element).find(".price").text().trim().replace(/\s+/g, " ")
        const oldPrice = $(element).find(".price-old").text().trim()
        const newPrice = $(element).find(".price-new").text().trim()

        // If both old and new prices exist, combine them
        if (oldPrice && newPrice) {
          price = `${newPrice} ${oldPrice}`
        }

        const image = $(element).find(".image img").attr("src") || ""
        const productUrl = $(element).find(".name a").attr("href") || ""

        // Extract basic specs from the name for CPUs
        const specs: Record<string, string> = {}
        if (type === "cpu") {
          // Try to extract CPU specs from the name
          const clockSpeedMatch = name.match(/(\d+\.\d+)GHz/)
          if (clockSpeedMatch) specs["Clock Speed"] = clockSpeedMatch[0]

          const coreMatch = name.match(/(\d+)[ -]Core/)
          if (coreMatch) specs["Cores"] = coreMatch[1]

          const threadMatch = name.match(/(\d+)[ -]Thread/)
          if (threadMatch) specs["Threads"] = threadMatch[1]

          const cacheMatch = name.match(/(\d+)MB Cache/)
          if (cacheMatch) specs["Cache"] = cacheMatch[0]
        }

        // Use availability from listing page instead of fetching product page
        const listingAvailability = $(element).find(".stock").text().trim()
        const availability = listingAvailability.toLowerCase().includes("in stock") ? "In Stock" : "Out of Stock"

        components.push({
          name,
          price,
          image,
          availability,
          source: "Techland",
          url: productUrl,
          specs,
        })
      })

    return components
  } catch (error) {
    console.error(`Error fetching ${type} from Techland:`, error instanceof Error ? error.message : "Unknown error")
    return []
  }
}

// Optimized versions of the other retailer functions follow the same pattern
// I'll include UltraTech, Potaka IT, PC House, and Skyland with similar optimizations

async function fetchUltratechComponents(type: string, search?: string | null, limit = 20): Promise<Component[]> {
  const components: Component[] = []
  let url = ""

  // If search is provided, use search URL instead of category URL
  if (search) {
    url = `https://www.ultratech.com.bd/index.php?route=product/search&search=${encodeURIComponent(search)}`
  } else {
    // Map component type to UltraTech URL
    switch (type) {
      case "cpu":
        url = "https://www.ultratech.com.bd/processor"
        break
      case "cpu-cooler":
        url = "https://www.ultratech.com.bd/cpu-cooler"
        break
      case "motherboard":
        url = "https://www.ultratech.com.bd/motherboard"
        break
      case "memory":
        url = "https://www.ultratech.com.bd/ram"
        break
      case "storage":
        url = "https://www.ultratech.com.bd/storage-device"
        break
      case "video-card":
        url = "https://www.ultratech.com.bd/graphics-card"
        break
      case "case":
        url = "https://www.ultratech.com.bd/casing"
        break
      case "power-supply":
        url = "https://www.ultratech.com.bd/power-supply"
        break
      case "monitor":
        url = "https://www.ultratech.com.bd/monitor"
        break
      default:
        return []
    }
  }

  try {
    // Add timeout to prevent hanging requests
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Cache for 1 hour
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    }).catch((error) => {
      console.error(`Error fetching from UltraTech: ${error.message}`)
      return null
    })

    clearTimeout(timeoutId)

    if (!response || !response.ok) {
      console.warn(`Failed to fetch from UltraTech: ${response?.status || "No response"}`)
      return []
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Process only up to the limit
    $(".product-layout")
      .slice(0, limit)
      .each((_, element) => {
        const name = $(element).find(".name a").text().trim()

        // If searching, filter by component type
        if (search) {
          // Skip if this doesn't match our component type
          const isMatchingType = matchesComponentType(name, type)
          if (!isMatchingType) {
            return
          }
        }

        // Get both regular and special prices if available
        let price = $(element).find(".price").text().trim().replace(/\s+/g, " ")
        const oldPrice = $(element).find(".price-old").text().trim()
        const newPrice = $(element).find(".price-new").text().trim()

        // If both old and new prices exist, combine them
        if (oldPrice && newPrice) {
          price = `${newPrice} ${oldPrice}`
        }

        const image = $(element).find(".image img").attr("src") || ""
        const productUrl = $(element).find(".name a").attr("href") || ""

        // Extract basic specs from the name for CPUs
        const specs: Record<string, string> = {}
        if (type === "cpu") {
          // Try to extract CPU specs from the name
          const clockSpeedMatch = name.match(/(\d+\.\d+)GHz/)
          if (clockSpeedMatch) specs["Clock Speed"] = clockSpeedMatch[0]

          const coreMatch = name.match(/(\d+)[ -]Core/)
          if (coreMatch) specs["Cores"] = coreMatch[1]

          const threadMatch = name.match(/(\d+)[ -]Thread/)
          if (threadMatch) specs["Threads"] = threadMatch[1]

          const cacheMatch = name.match(/(\d+)MB Cache/)
          if (cacheMatch) specs["Cache"] = cacheMatch[0]
        }

        // Use availability from listing page
        const listingAvailability = $(element).find(".stock").text().trim()
        const availability = listingAvailability.toLowerCase().includes("in stock") ? "In Stock" : "Out of Stock"

        components.push({
          name,
          price,
          image,
          availability,
          source: "UltraTech",
          url: productUrl,
          specs,
        })
      })

    return components
  } catch (error) {
    console.error(`Error fetching ${type} from UltraTech:`, error instanceof Error ? error.message : "Unknown error")
    return []
  }
}

async function fetchPotakaitComponents(type: string, search?: string | null, limit = 20): Promise<Component[]> {
  const components: Component[] = []
  let url = ""

  // If search is provided, use search URL instead of category URL
  if (search) {
    url = `https://www.potakait.com/index.php?route=product/search&search=${encodeURIComponent(search)}`
  } else {
    // Map component type to Potaka IT URL
    switch (type) {
      case "cpu":
        url = "https://www.potakait.com/processor"
        break
      case "cpu-cooler":
        url = "https://www.potakait.com/cpu-cooler"
        break
      case "motherboard":
        url = "https://www.potakait.com/motherboard"
        break
      case "memory":
        url = "https://www.potakait.com/ram"
        break
      case "storage":
        url = "https://www.potakait.com/storage-device"
        break
      case "video-card":
        url = "https://www.potakait.com/graphics-card"
        break
      case "case":
        url = "https://www.potakait.com/casing"
        break
      case "power-supply":
        url = "https://www.potakait.com/power-supply"
        break
      case "monitor":
        url = "https://www.potakait.com/monitor"
        break
      default:
        return []
    }
  }

  try {
    // Add timeout to prevent hanging requests
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Cache for 1 hour
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    }).catch((error) => {
      console.error(`Error fetching from Potaka IT: ${error.message}`)
      return null
    })

    clearTimeout(timeoutId)

    if (!response || !response.ok) {
      console.warn(`Failed to fetch from Potaka IT: ${response?.status || "No response"}`)
      return []
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Process only up to the limit
    $(".product-layout")
      .slice(0, limit)
      .each((_, element) => {
        const name = $(element).find(".name a").text().trim()

        // If searching, filter by component type
        if (search) {
          // Skip if this doesn't match our component type
          const isMatchingType = matchesComponentType(name, type)
          if (!isMatchingType) {
            return
          }
        }

        // Get both regular and special prices if available
        let price = $(element).find(".price").text().trim().replace(/\s+/g, " ")
        const oldPrice = $(element).find(".price-old").text().trim()
        const newPrice = $(element).find(".price-new").text().trim()

        // If both old and new prices exist, combine them
        if (oldPrice && newPrice) {
          price = `${newPrice} ${oldPrice}`
        }

        const image = $(element).find(".image img").attr("src") || ""
        const productUrl = $(element).find(".name a").attr("href") || ""

        // Extract basic specs from the name for CPUs
        const specs: Record<string, string> = {}
        if (type === "cpu") {
          // Try to extract CPU specs from the name
          const clockSpeedMatch = name.match(/(\d+\.\d+)GHz/)
          if (clockSpeedMatch) specs["Clock Speed"] = clockSpeedMatch[0]

          const coreMatch = name.match(/(\d+)[ -]Core/)
          if (coreMatch) specs["Cores"] = coreMatch[1]

          const threadMatch = name.match(/(\d+)[ -]Thread/)
          if (threadMatch) specs["Threads"] = threadMatch[1]

          const cacheMatch = name.match(/(\d+)MB Cache/)
          if (cacheMatch) specs["Cache"] = cacheMatch[0]
        }

        // Use availability from listing page
        const listingAvailability = $(element).find(".stock").text().trim()
        const availability = listingAvailability.toLowerCase().includes("in stock") ? "In Stock" : "Out of Stock"

        components.push({
          name,
          price,
          image,
          availability,
          source: "Potaka IT",
          url: productUrl,
          specs,
        })
      })

    return components
  } catch (error) {
    console.error(`Error fetching ${type} from Potaka IT:`, error instanceof Error ? error.message : "Unknown error")
    return []
  }
}

async function fetchPCHouseComponents(type: string, search?: string | null, limit = 20): Promise<Component[]> {
  const components: Component[] = []
  let url = ""

  // If search is provided, use search URL instead of category URL
  if (search) {
    url = `https://www.pchouse.com.bd/index.php?route=product/search&search=${encodeURIComponent(search)}`
  } else {
    // Map component type to PC House URL
    switch (type) {
      case "cpu":
        url = "https://www.pchouse.com.bd/processor"
        break
      case "cpu-cooler":
        url = "https://www.pchouse.com.bd/cpu-cooler"
        break
      case "motherboard":
        url = "https://www.pchouse.com.bd/motherboard"
        break
      case "memory":
        url = "https://www.pchouse.com.bd/ram"
        break
      case "storage":
        url = "https://www.pchouse.com.bd/storage-device"
        break
      case "video-card":
        url = "https://www.pchouse.com.bd/graphics-card"
        break
      case "case":
        url = "https://www.pchouse.com.bd/casing"
        break
      case "power-supply":
        url = "https://www.pchouse.com.bd/power-supply"
        break
      case "monitor":
        url = "https://www.pchouse.com.bd/monitor"
        break
      default:
        return []
    }
  }

  try {
    // Add timeout to prevent hanging requests
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Cache for 1 hour
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    }).catch((error) => {
      console.error(`Error fetching from PC House: ${error.message}`)
      return null
    })

    clearTimeout(timeoutId)

    if (!response || !response.ok) {
      console.warn(`Failed to fetch from PC House: ${response?.status || "No response"}`)
      return []
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Process only up to the limit
    $(".product-layout")
      .slice(0, limit)
      .each((_, element) => {
        const name = $(element).find(".name a").text().trim()

        // If searching, filter by component type
        if (search) {
          // Skip if this doesn't match our component type
          const isMatchingType = matchesComponentType(name, type)
          if (!isMatchingType) {
            return
          }
        }

        // Get both regular and special prices if available
        let price = $(element).find(".price").text().trim().replace(/\s+/g, " ")
        const oldPrice = $(element).find(".price-old").text().trim()
        const newPrice = $(element).find(".price-new").text().trim()

        // If both old and new prices exist, combine them
        if (oldPrice && newPrice) {
          price = `${newPrice} ${oldPrice}`
        }

        const image = $(element).find(".image img").attr("src") || ""
        const productUrl = $(element).find(".name a").attr("href") || ""

        // Extract basic specs from the name for CPUs
        const specs: Record<string, string> = {}
        if (type === "cpu") {
          // Try to extract CPU specs from the name
          const clockSpeedMatch = name.match(/(\d+\.\d+)GHz/)
          if (clockSpeedMatch) specs["Clock Speed"] = clockSpeedMatch[0]

          const coreMatch = name.match(/(\d+)[ -]Core/)
          if (coreMatch) specs["Cores"] = coreMatch[1]

          const threadMatch = name.match(/(\d+)[ -]Thread/)
          if (threadMatch) specs["Threads"] = threadMatch[1]

          const cacheMatch = name.match(/(\d+)MB Cache/)
          if (cacheMatch) specs["Cache"] = cacheMatch[0]
        }

        // Use availability from listing page
        const listingAvailability = $(element).find(".stock").text().trim()
        const availability = listingAvailability.toLowerCase().includes("in stock") ? "In Stock" : "Out of Stock"

        components.push({
          name,
          price,
          image,
          availability,
          source: "PC House",
          url: productUrl,
          specs,
        })
      })

    return components
  } catch (error) {
    console.error(`Error fetching ${type} from PC House:`, error instanceof Error ? error.message : "Unknown error")
    return []
  }
}

// Add this new function after the existing fetchPCHouseComponents function:

async function fetchSkylandComponents(type: string, search?: string | null, limit = 20): Promise<Component[]> {
  const components: Component[] = []
  let url = ""

  // If search is provided, use search URL instead of category URL
  if (search) {
    url = `https://www.skyland.com.bd/index.php?route=product/search&search=${encodeURIComponent(search)}`
  } else {
    // Map component type to Skyland URL
    switch (type) {
      case "cpu":
        url = "https://www.skyland.com.bd/processor"
        break
      case "cpu-cooler":
        url = "https://www.skyland.com.bd/cpu-cooler"
        break
      case "motherboard":
        url = "https://www.skyland.com.bd/motherboard"
        break
      case "memory":
        url = "https://www.skyland.com.bd/ram"
        break
      case "storage":
        url = "https://www.skyland.com.bd/storage-device"
        break
      case "video-card":
        url = "https://www.skyland.com.bd/graphics-card"
        break
      case "case":
        url = "https://www.skyland.com.bd/casing"
        break
      case "power-supply":
        url = "https://www.skyland.com.bd/power-supply"
        break
      case "monitor":
        url = "https://www.skyland.com.bd/monitor"
        break
      default:
        return []
    }
  }

  try {
    // Add timeout to prevent hanging requests
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Cache for 1 hour
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    }).catch((error) => {
      console.error(`Error fetching from Skyland: ${error.message}`)
      return null
    })

    clearTimeout(timeoutId)

    if (!response || !response.ok) {
      console.warn(`Failed to fetch from Skyland: ${response?.status || "No response"}`)
      return []
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Process only up to the limit
    $(".product-layout")
      .slice(0, limit)
      .each((_, element) => {
        const name = $(element).find(".name a").text().trim()

        // If searching, filter by component type
        if (search) {
          // Skip if this doesn't match our component type
          const isMatchingType = matchesComponentType(name, type)
          if (!isMatchingType) {
            return
          }
        }

        // Get both regular and special prices if available
        let price = $(element).find(".price").text().trim().replace(/\s+/g, " ")
        const oldPrice = $(element).find(".price-old").text().trim()
        const newPrice = $(element).find(".price-new").text().trim()

        // If both old and new prices exist, combine them
        if (oldPrice && newPrice) {
          price = `${newPrice} ${oldPrice}`
        }

        const image = $(element).find(".image img").attr("src") || ""
        const productUrl = $(element).find(".name a").attr("href") || ""

        // Extract basic specs from the name for CPUs
        const specs: Record<string, string> = {}
        if (type === "cpu") {
          // Try to extract CPU specs from the name
          const clockSpeedMatch = name.match(/(\d+\.\d+)GHz/)
          if (clockSpeedMatch) specs["Clock Speed"] = clockSpeedMatch[0]

          const coreMatch = name.match(/(\d+)[ -]Core/)
          if (coreMatch) specs["Cores"] = coreMatch[1]

          const threadMatch = name.match(/(\d+)[ -]Thread/)
          if (threadMatch) specs["Threads"] = threadMatch[1]

          const cacheMatch = name.match(/(\d+)MB Cache/)
          if (cacheMatch) specs["Cache"] = cacheMatch[0]
        }

        // Use availability from listing page
        const listingAvailability = $(element).find(".stock").text().trim()
        const availability = listingAvailability.toLowerCase().includes("in stock") ? "In Stock" : "Out of Stock"

        components.push({
          name,
          price,
          image,
          availability,
          source: "Skyland",
          url: productUrl,
          specs,
        })
      })

    return components
  } catch (error) {
    console.error(`Error fetching ${type} from Skyland:`, error instanceof Error ? error.message : "Unknown error")
    return []
  }
}

// Keep the helper functions for component type matching and search relevance
function matchesComponentType(productName: string, type: string): boolean {
  const productNameLower = productName.toLowerCase()

  switch (type) {
    case "cpu":
      return (
        productNameLower.includes("processor") ||
        productNameLower.includes("cpu") ||
        productNameLower.includes("ryzen") ||
        productNameLower.includes("intel") ||
        productNameLower.includes("core i") ||
        productNameLower.includes("pentium") ||
        productNameLower.includes("celeron") ||
        productNameLower.includes("athlon")
      )
    case "cpu-cooler":
      return (
        productNameLower.includes("cooler") ||
        productNameLower.includes("cooling") ||
        productNameLower.includes("heatsink") ||
        productNameLower.includes("fan") ||
        productNameLower.includes("radiator") ||
        productNameLower.includes("aio")
      )
    case "motherboard":
      return (
        productNameLower.includes("motherboard") ||
        productNameLower.includes("mainboard") ||
        productNameLower.includes("mobo")
      )
    case "memory":
      return (
        productNameLower.includes("ram") ||
        productNameLower.includes("memory") ||
        productNameLower.includes("ddr") ||
        productNameLower.includes("dimm")
      )
    case "storage":
      return (
        productNameLower.includes("ssd") ||
        productNameLower.includes("hdd") ||
        productNameLower.includes("solid state") ||
        productNameLower.includes("hard drive") ||
        productNameLower.includes("storage") ||
        productNameLower.includes("nvme") ||
        productNameLower.includes("m.2")
      )
    case "video-card":
      return (
        productNameLower.includes("graphics") ||
        productNameLower.includes("gpu") ||
        productNameLower.includes("video card") ||
        productNameLower.includes("geforce") ||
        productNameLower.includes("radeon") ||
        productNameLower.includes("rtx") ||
        productNameLower.includes("gtx")
      )
    case "case":
      return (
        productNameLower.includes("case") ||
        productNameLower.includes("casing") ||
        productNameLower.includes("chassis") ||
        productNameLower.includes("tower")
      )
    case "power-supply":
      return (
        productNameLower.includes("power supply") ||
        productNameLower.includes("psu") ||
        productNameLower.includes("watt")
      )
    case "monitor":
      return (
        productNameLower.includes("monitor") ||
        productNameLower.includes("display") ||
        productNameLower.includes("screen") ||
        productNameLower.includes("inch")
      )
    default:
      return false
  }
}

function calculateSearchRelevance(productName: string, searchQuery: string): number {
  const productNameLower = productName.toLowerCase()
  const searchQueryLower = searchQuery.toLowerCase()

  // Exact match gets highest score
  if (productNameLower === searchQueryLower) {
    return 100
  }

  // Starts with query gets high score
  if (productNameLower.startsWith(searchQueryLower)) {
    return 80
  }

  // Contains exact query as a word gets medium-high score
  const words = productNameLower.split(/\s+/)
  if (words.includes(searchQueryLower)) {
    return 70
  }

  // Contains query gets medium score
  if (productNameLower.includes(searchQueryLower)) {
    return 60
  }

  // All words in query are in product name
  const queryWords = searchQueryLower.split(/\s+/)
  const allWordsMatch = queryWords.every((word) => productNameLower.includes(word))
  if (allWordsMatch) {
    return 50
  }

  // Some words in query are in product name
  const someWordsMatch = queryWords.some((word) => productNameLower.includes(word))
  if (someWordsMatch) {
    return 30
  }

  // Default low score for other matches
  return 10
}
