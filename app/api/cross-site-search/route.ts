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

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get("query")
  const excludeSource = searchParams.get("excludeSource")

  if (!query) {
    return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
  }

  try {
    console.log(`Cross-site search for "${query}" excluding "${excludeSource}"`)

    // Create an array of promises for parallel fetching
    const fetchPromises = [
      excludeSource !== "Startech" ? fetchStartechComponent(query) : null,
      excludeSource !== "Techland" ? fetchTechlandComponent(query) : null,
      excludeSource !== "UltraTech" ? fetchUltraTechComponent(query) : null,
      excludeSource !== "Potaka IT" ? fetchPotakaITComponent(query) : null,
      excludeSource !== "PC House" ? fetchPCHouseComponent(query) : null,
      excludeSource !== "Skyland" ? fetchSkylandComponent(query) : null,
    ]

    // Use Promise.allSettled to handle individual promise failures
    const results = await Promise.allSettled(fetchPromises)

    // Extract components from fulfilled promises
    const crossSiteProducts: Record<string, Component | null> = {}

    results.forEach((result, index) => {
      if (result.status === "fulfilled" && result.value) {
        const source = ["Startech", "Techland", "UltraTech", "Potaka IT", "PC House", "Skyland"][index]
        crossSiteProducts[source] = result.value
      }
    })

    console.log(`Found cross-site products:`, Object.keys(crossSiteProducts))

    return NextResponse.json({ crossSiteProducts })
  } catch (error) {
    console.error("Error in cross-site search:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch cross-site products",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// Fetch component from Startech
async function fetchStartechComponent(query: string): Promise<Component | null> {
  try {
    const url = `https://www.startech.com.bd/product/search?search=${encodeURIComponent(query)}`

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
      return null
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Get the first product
    const firstProduct = $(".p-item").first()

    if (firstProduct.length === 0) {
      return null
    }

    const name = firstProduct.find(".p-item-name").text().trim()

    // Get both regular and special prices if available
    let price = firstProduct.find(".p-item-price").text().trim()
    const regularPrice = firstProduct.find(".regular-price").text().trim()
    const specialPrice = firstProduct.find(".special-price").text().trim()

    // If both regular and special prices exist, combine them
    if (regularPrice && specialPrice) {
      price = `${specialPrice} ${regularPrice}`
    }

    const image = firstProduct.find(".p-item-img img").attr("src") || ""
    const productUrl = firstProduct.find("a").attr("href") || ""

    // Use availability from listing page
    const listingAvailability = firstProduct.find(".p-item-stock").text().trim()
    const availability = listingAvailability.toLowerCase().includes("in stock") ? "In Stock" : "Out of Stock"

    return {
      name,
      price,
      image,
      availability,
      source: "Startech",
      url: productUrl,
    }
  } catch (error) {
    console.error(`Error fetching from Startech:`, error)
    return null
  }
}

// Fetch component from Techland
async function fetchTechlandComponent(query: string): Promise<Component | null> {
  try {
    const url = `https://www.techlandbd.com/index.php?route=product/search&search=${encodeURIComponent(query)}`

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
      return null
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Get the first product
    const firstProduct = $(".product-layout").first()

    if (firstProduct.length === 0) {
      return null
    }

    const name = firstProduct.find(".name a").text().trim()

    // Get both regular and special prices if available
    let price = firstProduct.find(".price").text().trim().replace(/\s+/g, " ")
    const oldPrice = firstProduct.find(".price-old").text().trim()
    const newPrice = firstProduct.find(".price-new").text().trim()

    // If both old and new prices exist, combine them
    if (oldPrice && newPrice) {
      price = `${newPrice} ${oldPrice}`
    }

    const image = firstProduct.find(".image img").attr("src") || ""
    const productUrl = firstProduct.find(".name a").attr("href") || ""

    // Use availability from listing page
    const listingAvailability = firstProduct.find(".stock").text().trim()
    const availability = listingAvailability.toLowerCase().includes("in stock") ? "In Stock" : "Out of Stock"

    return {
      name,
      price,
      image,
      availability,
      source: "Techland",
      url: productUrl,
    }
  } catch (error) {
    console.error(`Error fetching from Techland:`, error)
    return null
  }
}

// Fetch component from UltraTech
async function fetchUltraTechComponent(query: string): Promise<Component | null> {
  try {
    const url = `https://www.ultratech.com.bd/index.php?route=product/search&search=${encodeURIComponent(query)}`

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
      return null
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Get the first product
    const firstProduct = $(".product-layout").first()

    if (firstProduct.length === 0) {
      return null
    }

    const name = firstProduct.find(".name a").text().trim()

    // Get both regular and special prices if available
    let price = firstProduct.find(".price").text().trim().replace(/\s+/g, " ")
    const oldPrice = firstProduct.find(".price-old").text().trim()
    const newPrice = firstProduct.find(".price-new").text().trim()

    // If both old and new prices exist, combine them
    if (oldPrice && newPrice) {
      price = `${newPrice} ${oldPrice}`
    }

    const image = firstProduct.find(".image img").attr("src") || ""
    const productUrl = firstProduct.find(".name a").attr("href") || ""

    // Use availability from listing page
    const listingAvailability = firstProduct.find(".stock").text().trim()
    const availability = listingAvailability.toLowerCase().includes("in stock") ? "In Stock" : "Out of Stock"

    return {
      name,
      price,
      image,
      availability,
      source: "UltraTech",
      url: productUrl,
    }
  } catch (error) {
    console.error(`Error fetching from UltraTech:`, error)
    return null
  }
}

// Fetch component from Potaka IT
async function fetchPotakaITComponent(query: string): Promise<Component | null> {
  try {
    const url = `https://www.potakait.com/index.php?route=product/search&search=${encodeURIComponent(query)}`

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
      return null
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Get the first product
    const firstProduct = $(".product-layout").first()

    if (firstProduct.length === 0) {
      return null
    }

    const name = firstProduct.find(".name a").text().trim()

    // Get both regular and special prices if available
    let price = firstProduct.find(".price").text().trim().replace(/\s+/g, " ")
    const oldPrice = firstProduct.find(".price-old").text().trim()
    const newPrice = firstProduct.find(".price-new").text().trim()

    // If both old and new prices exist, combine them
    if (oldPrice && newPrice) {
      price = `${newPrice} ${oldPrice}`
    }

    const image = firstProduct.find(".image img").attr("src") || ""
    const productUrl = firstProduct.find(".name a").attr("href") || ""

    // Use availability from listing page
    const listingAvailability = firstProduct.find(".stock").text().trim()
    const availability = listingAvailability.toLowerCase().includes("in stock") ? "In Stock" : "Out of Stock"

    return {
      name,
      price,
      image,
      availability,
      source: "Potaka IT",
      url: productUrl,
    }
  } catch (error) {
    console.error(`Error fetching from Potaka IT:`, error)
    return null
  }
}

// Fetch component from PC House
async function fetchPCHouseComponent(query: string): Promise<Component | null> {
  try {
    const url = `https://www.pchouse.com.bd/index.php?route=product/search&search=${encodeURIComponent(query)}`

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
      return null
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Get the first product
    const firstProduct = $(".product-layout").first()

    if (firstProduct.length === 0) {
      return null
    }

    const name = firstProduct.find(".name a").text().trim()

    // Get both regular and special prices if available
    let price = firstProduct.find(".price").text().trim().replace(/\s+/g, " ")
    const oldPrice = firstProduct.find(".price-old").text().trim()
    const newPrice = firstProduct.find(".price-new").text().trim()

    // If both old and new prices exist, combine them
    if (oldPrice && newPrice) {
      price = `${newPrice} ${oldPrice}`
    }

    const image = firstProduct.find(".image img").attr("src") || ""
    const productUrl = firstProduct.find(".name a").attr("href") || ""

    // Use availability from listing page
    const listingAvailability = firstProduct.find(".stock").text().trim()
    const availability = listingAvailability.toLowerCase().includes("in stock") ? "In Stock" : "Out of Stock"

    return {
      name,
      price,
      image,
      availability,
      source: "PC House",
      url: productUrl,
    }
  } catch (error) {
    console.error(`Error fetching from PC House:`, error)
    return null
  }
}

// Fetch component from Skyland
async function fetchSkylandComponent(query: string): Promise<Component | null> {
  try {
    const url = `https://www.skyland.com.bd/index.php?route=product/search&search=${encodeURIComponent(query)}`

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
      return null
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Get the first product
    const firstProduct = $(".product-layout").first()

    if (firstProduct.length === 0) {
      return null
    }

    const name = firstProduct.find(".name a").text().trim()

    // Get both regular and special prices if available
    let price = firstProduct.find(".price").text().trim().replace(/\s+/g, " ")
    const oldPrice = firstProduct.find(".price-old").text().trim()
    const newPrice = firstProduct.find(".price-new").text().trim()

    // If both old and new prices exist, combine them
    if (oldPrice && newPrice) {
      price = `${newPrice} ${oldPrice}`
    }

    const image = firstProduct.find(".image img").attr("src") || ""
    const productUrl = firstProduct.find(".name a").attr("href") || ""

    // Use availability from listing page
    const listingAvailability = firstProduct.find(".stock").text().trim()
    const availability = listingAvailability.toLowerCase().includes("in stock") ? "In Stock" : "Out of Stock"

    return {
      name,
      price,
      image,
      availability,
      source: "Skyland",
      url: productUrl,
    }
  } catch (error) {
    console.error(`Error fetching from Skyland:`, error)
    return null
  }
}
