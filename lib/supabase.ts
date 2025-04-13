import { createClient } from "@supabase/supabase-js"

// Create a single supabase client for the entire app
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export interface DbProduct {
  id: string
  name: string
  type: string
  image_url: string
  specs?: Record<string, string>
  created_at: string
  updated_at: string
}

export interface DbProductPrice {
  id: string
  product_id: string
  retailer_id: string
  price: number
  original_price: number | null
  availability: string
  url: string
  created_at: string
}

export interface DbRetailer {
  id: string
  name: string
  website: string
  logo_url?: string
}

export interface DbPriceHistory {
  id: string
  product_id: string
  retailer_id: string
  price: number
  recorded_at: string
}

// Helper functions for database operations

// Get a product by name and type
export async function getProductByName(name: string, type: string) {
  const { data, error } = await supabase.from("products").select("*").eq("name", name).eq("type", type).single()

  if (error) return null
  return data as DbProduct
}

// Get product prices by product ID
export async function getProductPrices(productId: string) {
  const { data, error } = await supabase
    .from("product_prices")
    .select(`
      *,
      retailers (*)
    `)
    .eq("product_id", productId)

  if (error) return []
  return data
}

// Get price history for a product from a specific retailer
export async function getPriceHistory(productId: string, retailerId: string) {
  const { data, error } = await supabase
    .from("price_history")
    .select("*")
    .eq("product_id", productId)
    .eq("retailer_id", retailerId)
    .order("recorded_at", { ascending: true })

  if (error) return []
  return data as DbPriceHistory[]
}

// Get all products of a specific type
export async function getProductsByType(type: string) {
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      product_prices (
        *,
        retailers (*)
      )
    `)
    .eq("type", type)

  if (error) return []
  return data
}

// Search products
export async function searchProducts(query: string) {
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      product_prices (
        *,
        retailers (*)
      )
    `)
    .ilike("name", `%${query}%`)

  if (error) return []
  return data
}

// Add or update a product
export async function upsertProduct(product: Omit<DbProduct, "id" | "created_at" | "updated_at">) {
  // Check if product exists
  const existingProduct = await getProductByName(product.name, product.type)

  if (existingProduct) {
    // Update existing product
    const { data, error } = await supabase
      .from("products")
      .update({
        ...product,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingProduct.id)
      .select()

    if (error) throw error
    return data[0] as DbProduct
  } else {
    // Insert new product
    const { data, error } = await supabase
      .from("products")
      .insert({
        ...product,
        updated_at: new Date().toISOString(),
      })
      .select()

    if (error) throw error
    return data[0] as DbProduct
  }
}

// Add or update a product price
export async function upsertProductPrice(
  productId: string,
  retailerId: string,
  price: number,
  originalPrice: number | null,
  availability: string,
  url: string,
) {
  // Check if price record exists
  const { data: existingPrice, error: fetchError } = await supabase
    .from("product_prices")
    .select("*")
    .eq("product_id", productId)
    .eq("retailer_id", retailerId)
    .single()

  if (fetchError && fetchError.code !== "PGRST116") throw fetchError // PGRST116 is "no rows returned"

  if (existingPrice) {
    // If price has changed, add to price history
    if (existingPrice.price !== price) {
      await supabase.from("price_history").insert({
        product_id: productId,
        retailer_id: retailerId,
        price: existingPrice.price,
        recorded_at: new Date().toISOString(),
      })
    }

    // Update existing price
    const { data, error } = await supabase
      .from("product_prices")
      .update({
        price,
        original_price: originalPrice,
        availability,
        url,
        created_at: new Date().toISOString(),
      })
      .eq("id", existingPrice.id)
      .select()

    if (error) throw error
    return data[0]
  } else {
    // Insert new price
    const { data, error } = await supabase
      .from("product_prices")
      .insert({
        product_id: productId,
        retailer_id: retailerId,
        price,
        original_price: originalPrice,
        availability,
        url,
        created_at: new Date().toISOString(),
      })
      .select()

    if (error) throw error
    return data[0]
  }
}

// Get or create retailer
export async function getOrCreateRetailer(name: string, website: string) {
  // Check if retailer exists
  const { data: existingRetailer, error: fetchError } = await supabase
    .from("retailers")
    .select("*")
    .eq("name", name)
    .single()

  if (fetchError && fetchError.code !== "PGRST116") throw fetchError

  if (existingRetailer) {
    return existingRetailer as DbRetailer
  } else {
    // Insert new retailer
    const { data, error } = await supabase
      .from("retailers")
      .insert({
        name,
        website,
      })
      .select()

    if (error) throw error
    return data[0] as DbRetailer
  }
}
