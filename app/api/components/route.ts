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

// Update the GET function to sort results by relevance when searching
// Modify the GET function to include sorting:

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const type = searchParams.get("type")
  const search = searchParams.get("search")

  if (!type) {
    return NextResponse.json({ error: "Component type parameter is required" }, { status: 400 })
  }

  try {
    // Fetch components from all sources
    const startechComponents = await fetchStartechComponents(type, search)
    const techlandComponents = await fetchTechlandComponents(type, search)
    const ultratechComponents = await fetchUltratechComponents(type, search)
    const potakaitComponents = await fetchPotakaitComponents(type, search)
    const pchouseComponents = await fetchPCHouseComponents(type, search)

    // Combine results
    const components = [
      ...startechComponents,
      ...techlandComponents,
      ...ultratechComponents,
      ...potakaitComponents,
      ...pchouseComponents,
    ]

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
    return NextResponse.json({ error: "Failed to fetch components" }, { status: 500 })
  }
}

// Modify the fetchPotakaitComponents function to better handle fetch errors
async function fetchPotakaitComponents(type: string, search?: string | null): Promise<Component[]> {
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
    const response = await fetch(url, {
      next: { revalidate: 3600 },
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(10000),
    }).catch((error) => {
      console.error(`Error fetching Potaka IT listing page: ${error.message}`)
      return null
    })

    if (!response || !response.ok) {
      console.warn(`Failed to fetch from Potaka IT: ${response?.status || "No response"}`)
      return []
    }

    const html = await response.text().catch((error) => {
      console.error(`Error reading Potaka IT response: ${error.message}`)
      return ""
    })

    if (!html) return []

    const $ = cheerio.load(html)

    const productPromises = $(".product-layout")
      .map(async (_, element) => {
        const name = $(element).find(".name a").text().trim()

        // If searching, filter by component type
        if (search) {
          // Skip if this doesn't match our component type
          const isMatchingType = matchesComponentType(name, type)
          if (!isMatchingType) {
            return null
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

        // Use availability from listing page as fallback
        const listingAvailability = $(element).find(".stock").text().trim()
        let availability = listingAvailability.toLowerCase().includes("in stock") ? "In Stock" : "Out of Stock"

        // Only try to fetch product page if URL exists and is valid
        if (productUrl && productUrl.startsWith("http")) {
          try {
            const productResponse = await fetch(productUrl, {
              next: { revalidate: 3600 },
              // Add timeout to prevent hanging requests
              signal: AbortSignal.timeout(5000),
            }).catch((error) => {
              console.warn(`Skipping product page fetch for ${name}: ${error.message}`)
              return null
            })

            if (productResponse && productResponse.ok) {
              const productHtml = await productResponse.text()
              const product$ = cheerio.load(productHtml)

              // Look for the Status field in the product details
              product$(".product-stats li").each((_, infoItem) => {
                const label = product$(infoItem).find(".product-stats-title").text().trim()
                if (label === "Status:") {
                  availability = product$(infoItem).find(".product-stats-text").text().trim()
                }
              })

              // If we couldn't find the status, check other common locations
              if (!availability) {
                const stockText =
                  product$(".stock").text().trim() ||
                  product$(".availability").text().trim() ||
                  product$(".product-stock").text().trim()

                if (stockText) {
                  availability = stockText.toLowerCase().includes("in stock") ? "In Stock" : "Out of Stock"
                }
              }
            }
          } catch (error) {
            console.warn(
              `Error processing product page for ${name}: ${error instanceof Error ? error.message : "Unknown error"}`,
            )
            // We'll use the fallback availability from above
          }
        }

        // Normalize availability
        if (!availability) {
          availability = "Out of Stock"
        } else if (
          availability.toLowerCase().includes("in stock") ||
          availability.toLowerCase().includes("available") ||
          availability.toLowerCase().includes("pre order")
        ) {
          availability = "In Stock"
        } else {
          availability = "Out of Stock"
        }

        return {
          name,
          price,
          image,
          availability,
          source: "Potaka IT",
          url: productUrl,
          specs,
        }
      })
      .get()

    // Use Promise.allSettled to handle any rejected promises
    const settledResults = await Promise.allSettled(productPromises)

    // Filter out rejected promises and extract values from fulfilled ones
    const results = settledResults
      .filter((result): result is PromiseFulfilledResult<Component | null> => result.status === "fulfilled")
      .map((result) => result.value)
      .filter((result): result is Component => result !== null)

    components.push(...results)

    return components
  } catch (error) {
    console.error(`Error fetching ${type} from Potaka IT:`, error instanceof Error ? error.message : "Unknown error")
    return []
  }
}

// Apply similar error handling improvements to the other fetch functions
async function fetchStartechComponents(type: string, search?: string | null): Promise<Component[]> {
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
    const response = await fetch(url, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(10000),
    }).catch((error) => {
      console.error(`Error fetching Startech listing page: ${error.message}`)
      return null
    })

    if (!response || !response.ok) {
      console.warn(`Failed to fetch from Startech: ${response?.status || "No response"}`)
      return []
    }

    const html = await response.text().catch((error) => {
      console.error(`Error reading Startech response: ${error.message}`)
      return ""
    })

    if (!html) return []

    const $ = cheerio.load(html)

    const productPromises = $(".p-item")
      .map(async (_, element) => {
        const name = $(element).find(".p-item-name").text().trim()

        // If searching, filter by component type and relevance
        if (search) {
          // Skip if this doesn't match our component type
          const isMatchingType = matchesComponentType(name, type)
          if (!isMatchingType) {
            return null
          }

          // Calculate search relevance score
          const relevanceScore = calculateSearchRelevance(name, search)

          // Only include results with a minimum relevance
          if (relevanceScore < 10) {
            return null
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

        // Use availability from listing page as fallback
        const listingAvailability = $(element).find(".p-item-stock").text().trim()
        let availability = listingAvailability.toLowerCase().includes("in stock") ? "In Stock" : "Out of Stock"

        // Only try to fetch product page if URL exists and is valid
        if (productUrl && productUrl.startsWith("http")) {
          try {
            const productResponse = await fetch(productUrl, {
              next: { revalidate: 3600 },
              signal: AbortSignal.timeout(5000),
            }).catch((error) => {
              console.warn(`Skipping product page fetch for ${name}: ${error.message}`)
              return null
            })

            if (productResponse && productResponse.ok) {
              const productHtml = await productResponse.text()
              const product$ = cheerio.load(productHtml)

              // Look for the Status field in the product details
              product$(".product-info li").each((_, infoItem) => {
                const label = product$(infoItem).find("span:first-child").text().trim()
                if (label === "Status:") {
                  availability = product$(infoItem).find("span:last-child").text().trim()
                }
              })

              // If we couldn't find the status, check other common locations
              if (!availability) {
                const stockText =
                  product$(".product-status").text().trim() ||
                  product$(".stock-status-text").text().trim() ||
                  product$(".stock").text().trim()

                if (stockText) {
                  availability = stockText.toLowerCase().includes("in stock") ? "In Stock" : "Out of Stock"
                }
              }
            }
          } catch (error) {
            console.warn(
              `Error processing product page for ${name}: ${error instanceof Error ? error.message : "Unknown error"}`,
            )
            // We'll use the fallback availability from above
          }
        }

        // Normalize availability
        if (!availability) {
          availability = "Out of Stock"
        } else if (
          availability.toLowerCase().includes("in stock") ||
          availability.toLowerCase().includes("available") ||
          availability.toLowerCase().includes("pre order")
        ) {
          availability = "In Stock"
        } else {
          availability = "Out of Stock"
        }

        return {
          name,
          price,
          image,
          availability,
          source: "Startech",
          url: productUrl,
          specs,
        }
      })
      .get()

    // Use Promise.allSettled to handle any rejected promises
    const settledResults = await Promise.allSettled(productPromises)

    // Filter out rejected promises and extract values from fulfilled ones
    const results = settledResults
      .filter((result): result is PromiseFulfilledResult<Component | null> => result.status === "fulfilled")
      .map((result) => result.value)
      .filter((result): result is Component => result !== null)

    components.push(...results)

    return components
  } catch (error) {
    console.error(`Error fetching ${type} from Startech:`, error instanceof Error ? error.message : "Unknown error")
    return []
  }
}

async function fetchTechlandComponents(type: string, search?: string | null): Promise<Component[]> {
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
    const response = await fetch(url, { next: { revalidate: 3600 } })
    const html = await response.text()
    const $ = cheerio.load(html)

    const productPromises = $(".product-layout")
      .map(async (_, element) => {
        const name = $(element).find(".name a").text().trim()

        // If searching, filter by component type
        if (search) {
          // Skip if this doesn't match our component type
          const isMatchingType = matchesComponentType(name, type)
          if (!isMatchingType) {
            return null
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

        // Fetch the product page to get accurate availability
        let availability = "Unknown"
        try {
          const productResponse = await fetch(productUrl, { next: { revalidate: 3600 } })
          const productHtml = await productResponse.text()
          const product$ = cheerio.load(productHtml)

          // Look for the Status field in the product details
          product$(".product-stats li").each((_, infoItem) => {
            const label = product$(infoItem).find(".product-stats-title").text().trim()
            if (label === "Status:") {
              availability = product$(infoItem).find(".product-stats-text").text().trim()
            }
          })

          // If we couldn't find the status, check other common locations
          if (availability === "Unknown") {
            availability =
              product$(".stock").text().trim() ||
              product$(".availability").text().trim() ||
              product$(".product-stock").text().trim()
          }

          // Normalize availability
          if (!availability || availability === "Unknown") {
            availability = "Out of Stock"
          } else if (
            availability.toLowerCase().includes("in stock") ||
            availability.toLowerCase().includes("available") ||
            availability.toLowerCase().includes("pre order")
          ) {
            availability = "In Stock"
          } else {
            availability = "Out of Stock"
          }
        } catch (error) {
          console.error(`Error fetching product page for ${name}:`, error)
          // Fallback to the availability from the listing page
          const listingAvailability = $(element).find(".stock").text().trim()
          if (!listingAvailability) {
            availability = "Out of Stock"
          } else if (
            listingAvailability.toLowerCase().includes("in stock") ||
            listingAvailability.toLowerCase().includes("available")
          ) {
            availability = "In Stock"
          } else {
            availability = "Out of Stock"
          }
        }

        return {
          name,
          price,
          image,
          availability,
          source: "Techland",
          url: productUrl,
          specs,
        }
      })
      .get()

    const results = await Promise.all(productPromises)
    // Filter out null results (from search filtering)
    const validResults = results.filter((result) => result !== null) as Component[]
    components.push(...validResults)

    return components
  } catch (error) {
    console.error(`Error fetching ${type} from Techland:`, error)
    return []
  }
}

// Add the new component scraping functions with search support

async function fetchUltratechComponents(type: string, search?: string | null): Promise<Component[]> {
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
    const response = await fetch(url, { next: { revalidate: 3600 } })
    const html = await response.text()
    const $ = cheerio.load(html)

    const productPromises = $(".product-layout")
      .map(async (_, element) => {
        const name = $(element).find(".name a").text().trim()

        // If searching, filter by component type
        if (search) {
          // Skip if this doesn't match our component type
          const isMatchingType = matchesComponentType(name, type)
          if (!isMatchingType) {
            return null
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

        // Fetch the product page to get accurate availability
        let availability = "Unknown"
        try {
          const productResponse = await fetch(productUrl, { next: { revalidate: 3600 } })
          const productHtml = await productResponse.text()
          const product$ = cheerio.load(productHtml)

          // Look for the Status field in the product details
          product$(".product-stats li").each((_, infoItem) => {
            const label = product$(infoItem).find(".product-stats-title").text().trim()
            if (label === "Status:") {
              availability = product$(infoItem).find(".product-stats-text").text().trim()
            }
          })

          // If we couldn't find the status, check other common locations
          if (availability === "Unknown") {
            availability =
              product$(".stock").text().trim() ||
              product$(".availability").text().trim() ||
              product$(".product-stock").text().trim()
          }

          // Normalize availability
          if (!availability || availability === "Unknown") {
            availability = "Out of Stock"
          } else if (
            availability.toLowerCase().includes("in stock") ||
            availability.toLowerCase().includes("available") ||
            availability.toLowerCase().includes("pre order")
          ) {
            availability = "In Stock"
          } else {
            availability = "Out of Stock"
          }
        } catch (error) {
          console.error(`Error fetching product page for ${name}:`, error)
          // Fallback to the availability from the listing page
          const listingAvailability = $(element).find(".stock").text().trim()
          if (!listingAvailability) {
            availability = "Out of Stock"
          } else if (
            listingAvailability.toLowerCase().includes("in stock") ||
            listingAvailability.toLowerCase().includes("available")
          ) {
            availability = "In Stock"
          } else {
            availability = "Out of Stock"
          }
        }

        return {
          name,
          price,
          image,
          availability,
          source: "UltraTech",
          url: productUrl,
          specs,
        }
      })
      .get()

    const results = await Promise.all(productPromises)
    // Filter out null results (from search filtering)
    const validResults = results.filter((result) => result !== null) as Component[]
    components.push(...validResults)

    return components
  } catch (error) {
    console.error(`Error fetching ${type} from UltraTech:`, error)
    return []
  }
}

async function fetchPotakaitComponents_old(type: string, search?: string | null): Promise<Component[]> {
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
    const response = await fetch(url, { next: { revalidate: 3600 } })
    const html = await response.text()
    const $ = cheerio.load(html)

    const productPromises = $(".product-layout")
      .map(async (_, element) => {
        const name = $(element).find(".name a").text().trim()

        // If searching, filter by component type
        if (search) {
          // Skip if this doesn't match our component type
          const isMatchingType = matchesComponentType(name, type)
          if (!isMatchingType) {
            return null
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

        // Fetch the product page to get accurate availability
        let availability = "Unknown"
        try {
          const productResponse = await fetch(productUrl, { next: { revalidate: 3600 } })
          const productHtml = await productResponse.text()
          const product$ = cheerio.load(productHtml)

          // Look for the Status field in the product details
          product$(".product-stats li").each((_, infoItem) => {
            const label = product$(infoItem).find(".product-stats-title").text().trim()
            if (label === "Status:") {
              availability = product$(infoItem).find(".product-stats-text").text().trim()
            }
          })

          // If we couldn't find the status, check other common locations
          if (availability === "Unknown") {
            availability =
              product$(".stock").text().trim() ||
              product$(".availability").text().trim() ||
              product$(".product-stock").text().trim()
          }

          // Normalize availability
          if (!availability || availability === "Unknown") {
            availability = "Out of Stock"
          } else if (
            availability.toLowerCase().includes("in stock") ||
            availability.toLowerCase().includes("available") ||
            availability.toLowerCase().includes("pre order")
          ) {
            availability = "In Stock"
          } else {
            availability = "Out of Stock"
          }
        } catch (error) {
          console.error(`Error fetching product page for ${name}:`, error)
          // Fallback to the availability from the listing page
          const listingAvailability = $(element).find(".stock").text().trim()
          if (!listingAvailability) {
            availability = "Out of Stock"
          } else if (
            listingAvailability.toLowerCase().includes("in stock") ||
            listingAvailability.toLowerCase().includes("available")
          ) {
            availability = "In Stock"
          } else {
            availability = "Out of Stock"
          }
        }

        return {
          name,
          price,
          image,
          availability,
          source: "Potaka IT",
          url: productUrl,
          specs,
        }
      })
      .get()

    const results = await Promise.all(productPromises)
    // Filter out null results (from search filtering)
    const validResults = results.filter((result) => result !== null) as Component[]
    components.push(...validResults)

    return components
  } catch (error) {
    console.error(`Error fetching ${type} from Potaka IT:`, error)
    return []
  }
}

async function fetchPCHouseComponents(type: string, search?: string | null): Promise<Component[]> {
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
    // Add headers to mimic a browser request
    const response = await fetch(url, {
      next: { revalidate: 3600 },
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Cache-Control": "max-age=0",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    const productPromises = $(".product-layout")
      .map(async (_, element) => {
        const name = $(element).find(".name a").text().trim()

        // If searching, filter by component type
        if (search) {
          // Skip if this doesn't match our component type
          const isMatchingType = matchesComponentType(name, type)
          if (!isMatchingType) {
            return null
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

        // Skip fetching product page if URL is missing
        if (!productUrl) {
          return {
            name,
            price,
            image,
            availability: "Unknown",
            source: "PC House",
            url: productUrl,
            specs,
          }
        }

        // Fetch the product page to get accurate availability
        let availability = "Unknown"
        try {
          const productResponse = await fetch(productUrl, {
            next: { revalidate: 3600 },
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
              Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
              "Accept-Language": "en-US,en;q=0.5",
              Connection: "keep-alive",
              "Upgrade-Insecure-Requests": "1",
              "Cache-Control": "max-age=0",
            },
          })

          if (!productResponse.ok) {
            throw new Error(`HTTP error! Status: ${productResponse.status}`)
          }

          const productHtml = await productResponse.text()
          const product$ = cheerio.load(productHtml)

          // Look for the Status field in the product details
          product$(".product-stats li").each((_, infoItem) => {
            const label = product$(infoItem).find(".product-stats-title").text().trim()
            if (label === "Status:") {
              availability = product$(infoItem).find(".product-stats-text").text().trim()
            }
          })

          // If we couldn't find the status, check other common locations
          if (availability === "Unknown") {
            availability =
              product$(".stock").text().trim() ||
              product$(".availability").text().trim() ||
              product$(".product-stock").text().trim()
          }

          // Normalize availability
          if (!availability || availability === "Unknown") {
            availability = "Out of Stock"
          } else if (
            availability.toLowerCase().includes("in stock") ||
            availability.toLowerCase().includes("available") ||
            availability.toLowerCase().includes("pre order")
          ) {
            availability = "In Stock"
          } else {
            availability = "Out of Stock"
          }
        } catch (error) {
          console.error(`Error fetching product page for ${name}:`, error)
          // Fallback to the availability from the listing page
          const listingAvailability = $(element).find(".stock").text().trim()
          if (!listingAvailability) {
            availability = "Out of Stock"
          } else if (
            listingAvailability.toLowerCase().includes("in stock") ||
            listingAvailability.toLowerCase().includes("available")
          ) {
            availability = "In Stock"
          } else {
            availability = "Out of Stock"
          }
        }

        return {
          name,
          price,
          image,
          availability,
          source: "PC House",
          url: productUrl,
          specs,
        }
      })
      .get()

    // Use Promise.allSettled instead of Promise.all to handle individual promise rejections
    const settledResults = await Promise.allSettled(productPromises)

    // Filter out rejected promises and extract values from fulfilled ones
    const results = settledResults
      .filter((result): result is PromiseFulfilledResult<Component | null> => result.status === "fulfilled")
      .map((result) => result.value)
      .filter((result): result is Component => result !== null)

    components.push(...results)

    return components
  } catch (error) {
    console.error(`Error fetching ${type} from PC House:`, error)
    // Return an empty array instead of throwing an error
    return []
  }
}

// Helper function to determine if a product matches the component type
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

// Add this helper function to improve search matching in the API
// Add it right after the matchesComponentType function

// Helper function to calculate search relevance score
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
