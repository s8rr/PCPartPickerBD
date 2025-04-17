import { type NextRequest, NextResponse } from "next/server"
import * as cheerio from "cheerio"

// Define the product interface
interface Product {
  name: string
  price: string
  image: string
  availability: string
  source: string
  url: string
}

// Update the GET function to include parallel fetching and better error handling
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get("query")
  const limit = Number.parseInt(searchParams.get("limit") || "20", 10) // Default to 20 products per retailer

  if (!query) {
    return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
  }

  try {
    // Create an array of promises for parallel fetching
    const fetchPromises = [
      fetchStartechProducts(query, limit),
      fetchTechlandProducts(query, limit),
      fetchUltratechProducts(query, limit),
      fetchPotakaitProducts(query, limit),
      fetchPCHouseProducts(query, limit),
      fetchSkylandProducts(query, limit),
    ]

    // Use Promise.allSettled to handle individual promise failures
    const results = await Promise.allSettled(fetchPromises)

    // Extract products from fulfilled promises
    const products = results
      .filter((result): result is PromiseFulfilledResult<Product[]> => result.status === "fulfilled")
      .flatMap((result) => result.value)

    return NextResponse.json({ products })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

// Optimized version of fetchStartechProducts that doesn't fetch individual product pages
async function fetchStartechProducts(query: string, limit: number): Promise<Product[]> {
  const products: Product[] = []
  const url = `https://www.startech.com.bd/product/search?search=${encodeURIComponent(query)}`

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

        // Get availability directly from the listing page instead of fetching product page
        const listingAvailability = $(element).find(".p-item-stock").text().trim()
        const availability = listingAvailability.toLowerCase().includes("in stock") ? "In Stock" : "Out of Stock"

        products.push({
          name,
          price,
          image,
          availability,
          source: "Startech",
          url: productUrl,
        })
      })

    return products
  } catch (error) {
    console.error("Error fetching from Startech:", error)
    return []
  }
}

// Optimized version of fetchTechlandProducts
async function fetchTechlandProducts(query: string, limit: number): Promise<Product[]> {
  const products: Product[] = []
  const url = `https://www.techlandbd.com/index.php?route=product/search&search=${encodeURIComponent(query)}`

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

        // Get availability directly from the listing page
        const listingAvailability = $(element).find(".stock").text().trim()
        const availability = listingAvailability.toLowerCase().includes("in stock") ? "In Stock" : "Out of Stock"

        products.push({
          name,
          price,
          image,
          availability,
          source: "Techland",
          url: productUrl,
        })
      })

    return products
  } catch (error) {
    console.error("Error fetching from Techland:", error)
    return []
  }
}

// Optimized version of fetchUltratechProducts
async function fetchUltratechProducts(query: string, limit: number): Promise<Product[]> {
  const products: Product[] = []
  const url = `https://www.ultratech.com.bd/index.php?route=product/search&search=${encodeURIComponent(query)}`

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

        // Get availability directly from the listing page
        const listingAvailability = $(element).find(".stock").text().trim()
        const availability = listingAvailability.toLowerCase().includes("in stock") ? "In Stock" : "Out of Stock"

        products.push({
          name,
          price,
          image,
          availability,
          source: "UltraTech",
          url: productUrl,
        })
      })

    return products
  } catch (error) {
    console.error("Error fetching from UltraTech:", error)
    return []
  }
}

// Optimized version of fetchPotakaitProducts
async function fetchPotakaitProducts(query: string, limit: number): Promise<Product[]> {
  const products: Product[] = []
  const url = `https://www.potakait.com/index.php?route=product/search&search=${encodeURIComponent(query)}`

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

        // Get availability directly from the listing page
        const listingAvailability = $(element).find(".stock").text().trim()
        const availability = listingAvailability.toLowerCase().includes("in stock") ? "In Stock" : "Out of Stock"

        products.push({
          name,
          price,
          image,
          availability,
          source: "Potaka IT",
          url: productUrl,
        })
      })

    return products
  } catch (error) {
    console.error("Error fetching from Potaka IT:", error)
    return []
  }
}

// Optimized version of fetchPCHouseProducts
async function fetchPCHouseProducts(query: string, limit: number): Promise<Product[]> {
  const products: Product[] = []
  const url = `https://www.pchouse.com.bd/index.php?route=product/search&search=${encodeURIComponent(query)}`

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
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Cache-Control": "max-age=0",
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

        // Get availability directly from the listing page
        const listingAvailability = $(element).find(".stock").text().trim()
        const availability = listingAvailability.toLowerCase().includes("in stock") ? "In Stock" : "Out of Stock"

        products.push({
          name,
          price,
          image,
          availability,
          source: "PC House",
          url: productUrl,
        })
      })

    return products
  } catch (error) {
    console.error("Error fetching from PC House:", error)
    return []
  }
}

// Optimized version of fetchSkylandProducts
async function fetchSkylandProducts(query: string, limit: number): Promise<Product[]> {
  const products: Product[] = []
  const url = `https://www.skyland.com.bd/index.php?route=product/search&search=${encodeURIComponent(query)}`

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

        // Get availability directly from the listing page
        const listingAvailability = $(element).find(".stock").text().trim()
        const availability = listingAvailability.toLowerCase().includes("in stock") ? "In Stock" : "Out of Stock"

        products.push({
          name,
          price,
          image,
          availability,
          source: "Skyland",
          url: productUrl,
        })
      })

    return products
  } catch (error) {
    console.error("Error fetching from Skyland:", error)
    return []
  }
}
