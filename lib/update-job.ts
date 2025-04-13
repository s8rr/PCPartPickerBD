import { supabase, getProductsByType } from "./supabase"
import * as cheerio from "cheerio"

// Function to update all products in the database
export async function updateAllProducts() {
  // Get all product types
  const { data: types, error } = await supabase.from("products").select("type").distinct()

  if (error) {
    console.error("Error fetching product types:", error)
    return
  }

  // Update products for each type
  for (const typeObj of types) {
    try {
      await updateProductsByType(typeObj.type)
      // Add a delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 5000))
    } catch (error) {
      console.error(`Error updating products of type ${typeObj.type}:`, error)
    }
  }
}

// Function to update products of a specific type
async function updateProductsByType(type: string) {
  // Get all products of this type
  const products = await getProductsByType(type)

  for (const product of products) {
    try {
      // For each product, update prices from all retailers
      for (const price of product.product_prices) {
        const retailer = price.retailers

        // Fetch current price from retailer website
        const currentPrice = await fetchCurrentPrice(price.url, retailer.name)

        if (currentPrice) {
          // Update price in database
          await supabase
            .from("product_prices")
            .update({
              price: currentPrice.price,
              original_price: currentPrice.originalPrice,
              availability: currentPrice.availability,
              created_at: new Date().toISOString(),
            })
            .eq("id", price.id)

          // If price has changed, add to price history
          if (price.price !== currentPrice.price) {
            await supabase.from("price_history").insert({
              product_id: product.id,
              retailer_id: retailer.id,
              price: price.price,
              recorded_at: new Date().toISOString(),
            })
          }
        }
      }

      // Add a small delay between products to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (error) {
      console.error(`Error updating product ${product.name}:`, error)
    }
  }
}

// Function to fetch current price from retailer website
async function fetchCurrentPrice(url: string, retailerName: string) {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Extract price based on retailer
    if (retailerName === "Startech") {
      return extractStartechPrice($)
    } else if (retailerName === "Techland") {
      return extractTechlandPrice($)
    } else if (retailerName === "UltraTech") {
      return extractUltratechPrice($)
    } else if (retailerName === "Potaka IT") {
      return extractPotakaitPrice($)
    } else if (retailerName === "PC House") {
      return extractPCHousePrice($)
    }

    return null
  } catch (error) {
    console.error(`Error fetching price from ${url}:`, error)
    return null
  }
}

// Functions to extract prices from different retailers
function extractStartechPrice($: cheerio.CheerioAPI) {
  const priceText = $(".product-price .price-new").text().trim() || $(".product-price").text().trim()
  const originalPriceText = $(".product-price .price-old").text().trim()
  const availability = $(".product-stock").text().includes("In Stock") ? "In Stock" : "Out of Stock"

  return {
    price: extractNumericPrice(priceText),
    originalPrice: originalPriceText ? extractNumericPrice(originalPriceText) : null,
    availability,
  }
}

function extractTechlandPrice($: cheerio.CheerioAPI) {
  const priceText = $(".price-new").text().trim() || $(".price").text().trim()
  const originalPriceText = $(".price-old").text().trim()
  const availability = $(".stock").text().includes("In Stock") ? "In Stock" : "Out of Stock"

  return {
    price: extractNumericPrice(priceText),
    originalPrice: originalPriceText ? extractNumericPrice(originalPriceText) : null,
    availability,
  }
}

function extractUltratechPrice($: cheerio.CheerioAPI) {
  const priceText = $(".price-new").text().trim() || $(".price").text().trim()
  const originalPriceText = $(".price-old").text().trim()
  const availability = $(".stock").text().includes("In Stock") ? "In Stock" : "Out of Stock"

  return {
    price: extractNumericPrice(priceText),
    originalPrice: originalPriceText ? extractNumericPrice(originalPriceText) : null,
    availability,
  }
}

function extractPotakaitPrice($: cheerio.CheerioAPI) {
  const priceText = $(".price-new").text().trim() || $(".price").text().trim()
  const originalPriceText = $(".price-old").text().trim()
  const availability = $(".stock").text().includes("In Stock") ? "In Stock" : "Out of Stock"

  return {
    price: extractNumericPrice(priceText),
    originalPrice: originalPriceText ? extractNumericPrice(originalPriceText) : null,
    availability,
  }
}

function extractPCHousePrice($: cheerio.CheerioAPI) {
  const priceText = $(".price-new").text().trim() || $(".price").text().trim()
  const originalPriceText = $(".price-old").text().trim()
  const availability = $(".stock").text().includes("In Stock") ? "In Stock" : "Out of Stock"

  return {
    price: extractNumericPrice(priceText),
    originalPrice: originalPriceText ? extractNumericPrice(originalPriceText) : null,
    availability,
  }
}

// Helper function to extract numeric price from text
function extractNumericPrice(priceText: string): number {
  // Remove currency symbol and commas, then parse as float
  const numericString = priceText.replace(/[^\d.]/g, "")
  return Number.parseFloat(numericString) || 0
}
