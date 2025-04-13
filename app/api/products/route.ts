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

// Update the GET function to include the new shops
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get("query")

  if (!query) {
    return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
  }

  try {
    // Fetch products from all sources
    const startechProducts = await fetchStartechProducts(query)
    const techlandProducts = await fetchTechlandProducts(query)
    const ultratechProducts = await fetchUltratechProducts(query)
    const potakaitProducts = await fetchPotakaitProducts(query)
    const pchouseProducts = await fetchPCHouseProducts(query)

    // Combine results
    const products = [
      ...startechProducts,
      ...techlandProducts,
      ...ultratechProducts,
      ...potakaitProducts,
      ...pchouseProducts,
    ]

    return NextResponse.json({ products })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

// Update the fetchStartechProducts function to fetch availability from product pages

async function fetchStartechProducts(query: string): Promise<Product[]> {
  const products: Product[] = []
  const url = `https://www.startech.com.bd/product/search?search=${encodeURIComponent(query)}`

  try {
    const response = await fetch(url, { next: { revalidate: 3600 } })
    const html = await response.text()
    const $ = cheerio.load(html)

    const productPromises = $(".p-item")
      .map(async (_, element) => {
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

        // Fetch the product page to get accurate availability
        let availability = "Unknown"
        try {
          const productResponse = await fetch(productUrl, { next: { revalidate: 3600 } })
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
          if (availability === "Unknown") {
            availability =
              product$(".product-status").text().trim() ||
              product$(".stock-status-text").text().trim() ||
              product$(".stock").text().trim()
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
          const listingAvailability = $(element).find(".p-item-stock").text().trim()
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
          source: "Startech",
          url: productUrl,
        }
      })
      .get()

    const results = await Promise.all(productPromises)
    products.push(...results)

    return products
  } catch (error) {
    console.error("Error fetching from Startech:", error)
    return []
  }
}

// Update the fetchTechlandProducts function to fetch availability from product pages

async function fetchTechlandProducts(query: string): Promise<Product[]> {
  const products: Product[] = []
  const url = `https://www.techlandbd.com/index.php?route=product/search&search=${encodeURIComponent(query)}`

  try {
    const response = await fetch(url, { next: { revalidate: 3600 } })
    const html = await response.text()
    const $ = cheerio.load(html)

    const productPromises = $(".product-layout")
      .map(async (_, element) => {
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
        }
      })
      .get()

    const results = await Promise.all(productPromises)
    products.push(...results)

    return products
  } catch (error) {
    console.error("Error fetching from Techland:", error)
    return []
  }
}

// Add the new scraping functions after the existing ones

async function fetchUltratechProducts(query: string): Promise<Product[]> {
  const products: Product[] = []
  const url = `https://www.ultratech.com.bd/index.php?route=product/search&search=${encodeURIComponent(query)}`

  try {
    const response = await fetch(url, { next: { revalidate: 3600 } })
    const html = await response.text()
    const $ = cheerio.load(html)

    const productPromises = $(".product-layout")
      .map(async (_, element) => {
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
        }
      })
      .get()

    const results = await Promise.all(productPromises)
    products.push(...results)

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

    const productPromises = $(".product-layout")
      .map(async (_, element) => {
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
        }
      })
      .get()

    const results = await Promise.all(productPromises)
    products.push(...results)

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

    const productPromises = $(".product-layout")
      .map(async (_, element) => {
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

        // Skip fetching product page if URL is missing
        if (!productUrl) {
          return {
            name,
            price,
            image,
            availability: "Unknown",
            source: "PC House",
            url: productUrl,
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
        }
      })
      .get()

    // Use Promise.allSettled instead of Promise.all to handle individual promise rejections
    const settledResults = await Promise.allSettled(productPromises)

    // Filter out rejected promises and extract values from fulfilled ones
    const results = settledResults
      .filter((result): result is PromiseFulfilledResult<Product> => result.status === "fulfilled")
      .map((result) => result.value)

    products.push(...results)

    return products
  } catch (error) {
    console.error("Error fetching from PC House:", error)
    // Return an empty array instead of throwing an error
    return []
  }
}
