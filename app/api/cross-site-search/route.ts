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

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get("query")
  const excludeSource = searchParams.get("excludeSource") || ""

  if (!query) {
    return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
  }

  try {
    // Create a simplified search term by removing common words and specifications
    const simplifiedQuery = simplifySearchTerm(query)

    // Fetch products from all sources except the excluded one
    const sources = ["Startech", "Techland", "UltraTech", "Potaka IT", "PC House"]
    const fetchPromises = sources
      .filter((source) => source !== excludeSource)
      .map((source) => {
        // Add individual error handling for each source
        try {
          switch (source) {
            case "Startech":
              return fetchStartechProducts(simplifiedQuery)
            case "Techland":
              return fetchTechlandProducts(simplifiedQuery)
            case "UltraTech":
              return fetchUltratechProducts(simplifiedQuery)
            case "Potaka IT":
              return fetchPotakaitProducts(simplifiedQuery)
            case "PC House":
              return fetchPCHouseProducts(simplifiedQuery)
            default:
              return Promise.resolve([])
          }
        } catch (error) {
          console.error(`Error setting up fetch for ${source}:`, error)
          return Promise.resolve([])
        }
      })

    // Wait for all fetches to complete with Promise.allSettled
    const settledResults = await Promise.allSettled(fetchPromises)

    // Extract results from fulfilled promises
    const results = settledResults
      .filter((result): result is PromiseFulfilledResult<any[]> => result.status === "fulfilled")
      .map((result) => result.value)

    // Flatten the results array
    const allProducts = results.flat()

    // Find the most relevant product for each source
    const crossSiteProducts: Record<string, Product | null> = {}

    sources
      .filter((source) => source !== excludeSource)
      .forEach((source, index) => {
        if (index < results.length) {
          const sourceProducts = results[index]
          if (sourceProducts && sourceProducts.length > 0) {
            // Find the most relevant product by comparing names
            const mostRelevant = findMostRelevantProduct(sourceProducts, query)
            crossSiteProducts[source] = mostRelevant
          } else {
            crossSiteProducts[source] = null
          }
        } else {
          crossSiteProducts[source] = null
        }
      })

    return NextResponse.json({ crossSiteProducts })
  } catch (error) {
    console.error("Error fetching cross-site products:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch cross-site products",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// Helper function to simplify search terms
function simplifySearchTerm(term: string): string {
  // Convert to lowercase
  let simplified = term.toLowerCase()

  // Remove common words and specifications
  const wordsToRemove = [
    "processor",
    "cpu",
    "graphics card",
    "gpu",
    "motherboard",
    "ram",
    "memory",
    "storage",
    "ssd",
    "hdd",
    "power supply",
    "psu",
    "case",
    "monitor",
    "with",
    "and",
    "for",
    "the",
    "gen",
    "generation",
    "series",
    "model",
    "ddr4",
    "ddr5",
    "gb",
    "tb",
    "mhz",
    "ghz",
    "inch",
    "inches",
    "w",
    "watt",
  ]

  wordsToRemove.forEach((word) => {
    simplified = simplified.replace(new RegExp(`\\b${word}\\b`, "gi"), "")
  })

  // Remove multiple spaces
  simplified = simplified.replace(/\s+/g, " ").trim()

  // Extract model numbers which are often the most distinctive part
  const modelNumberMatch = simplified.match(/\b[a-z0-9]+-[a-z0-9]+\b|\b[a-z][0-9]+\b|\b[0-9]{4,}\b/i)
  if (modelNumberMatch) {
    return modelNumberMatch[0]
  }

  return simplified
}

// Helper function to find the most relevant product
function findMostRelevantProduct(products: Product[], originalQuery: string): Product | null {
  if (products.length === 0) return null

  // Simplify the original query for comparison
  const simplifiedQuery = simplifySearchTerm(originalQuery)

  // Score each product based on name similarity
  const scoredProducts = products.map((product) => {
    const simplifiedName = simplifySearchTerm(product.name)
    let score = 0

    // Check if the simplified name contains the simplified query
    if (simplifiedName.includes(simplifiedQuery)) {
      score += 10
    }

    // Check for word matches
    const queryWords = simplifiedQuery.split(" ")
    const nameWords = simplifiedName.split(" ")

    queryWords.forEach((qWord) => {
      if (nameWords.some((nWord) => nWord === qWord)) {
        score += 5
      }
    })

    return { product, score }
  })

  // Sort by score (highest first)
  scoredProducts.sort((a, b) => b.score - a.score)

  // Return the highest scoring product
  return scoredProducts[0]?.score > 0 ? scoredProducts[0].product : products[0]
}

// Reuse the existing fetch functions from the products API
async function fetchStartechProducts(query: string): Promise<Product[]> {
  const products: Product[] = []
  const url = `https://www.startech.com.bd/product/search?search=${encodeURIComponent(query)}`

  try {
    const response = await fetch(url, { next: { revalidate: 3600 } })
    const html = await response.text()
    const $ = cheerio.load(html)

    $(".p-item").each((_, element) => {
      const name = $(element).find(".p-item-name").text().trim()
      const price = $(element).find(".p-item-price").text().trim()
      const image = $(element).find(".p-item-img img").attr("src") || ""
      const productUrl = $(element).find("a").attr("href") || ""
      const availability = $(element).find(".p-item-stock").text().includes("In Stock") ? "In Stock" : "Out of Stock"

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

async function fetchTechlandProducts(query: string): Promise<Product[]> {
  const products: Product[] = []
  const url = `https://www.techlandbd.com/index.php?route=product/search&search=${encodeURIComponent(query)}`

  try {
    const response = await fetch(url, { next: { revalidate: 3600 } })
    const html = await response.text()
    const $ = cheerio.load(html)

    $(".product-layout").each((_, element) => {
      const name = $(element).find(".name a").text().trim()
      const price = $(element).find(".price").text().trim().replace(/\s+/g, " ")
      const image = $(element).find(".image img").attr("src") || ""
      const productUrl = $(element).find(".name a").attr("href") || ""
      const availability = $(element).find(".stock").text().includes("In Stock") ? "In Stock" : "Out of Stock"

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

async function fetchUltratechProducts(query: string): Promise<Product[]> {
  const products: Product[] = []
  const url = `https://www.ultratech.com.bd/index.php?route=product/search&search=${encodeURIComponent(query)}`

  try {
    const response = await fetch(url, { next: { revalidate: 3600 } })
    const html = await response.text()
    const $ = cheerio.load(html)

    $(".product-layout").each((_, element) => {
      const name = $(element).find(".name a").text().trim()
      const price = $(element).find(".price").text().trim().replace(/\s+/g, " ")
      const image = $(element).find(".image img").attr("src") || ""
      const productUrl = $(element).find(".name a").attr("href") || ""
      const availability = $(element).find(".stock").text().includes("In Stock") ? "In Stock" : "Out of Stock"

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

async function fetchPotakaitProducts(query: string): Promise<Product[]> {
  const products: Product[] = []
  const url = `https://www.potakait.com/index.php?route=product/search&search=${encodeURIComponent(query)}`

  try {
    const response = await fetch(url, { next: { revalidate: 3600 } })
    const html = await response.text()
    const $ = cheerio.load(html)

    $(".product-layout").each((_, element) => {
      const name = $(element).find(".name a").text().trim()
      const price = $(element).find(".price").text().trim().replace(/\s+/g, " ")
      const image = $(element).find(".image img").attr("src") || ""
      const productUrl = $(element).find(".name a").attr("href") || ""
      const availability = $(element).find(".stock").text().includes("In Stock") ? "In Stock" : "Out of Stock"

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

async function fetchPCHouseProducts(query: string): Promise<Product[]> {
  const products: Product[] = []
  const url = `https://www.pchouse.com.bd/index.php?route=product/search&search=${encodeURIComponent(query)}`

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

    $(".product-layout").each((_, element) => {
      const name = $(element).find(".name a").text().trim()
      const price = $(element).find(".price").text().trim().replace(/\s+/g, " ")
      const image = $(element).find(".image img").attr("src") || ""
      const productUrl = $(element).find(".name a").attr("href") || ""
      const availability = $(element).find(".stock").text().includes("In Stock") ? "In Stock" : "Out of Stock"

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
