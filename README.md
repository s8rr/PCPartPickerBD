# PCPartPickerBD

A Bangladeshi PC part price comparison and builder web application.

This project allows users to compare prices from different tech retailers in Bangladesh and build custom PC configurations.

- Live: [pcpartpicker.sabbir.lol](https://pcpartpicker.sabbir.lol)
- API docs: https://partpicker.sabbir.lol/
## Features

- Compare prices of PC components from various Bangladeshi retail websites
- Build and save custom PC configurations
- Simple, clean and fast UI
- Easily expandable to support more retailers

## Tech Stack

- **Framework:** Next.js
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Package Manager:** pnpm

## Getting Started

### Installation

```bash
git clone https://github.com/s8rr/PCPartPickerBD.git
cd PCPartPickerBD
```
2. Iinstall dependencies:

```shellscript
npm install
# or
yarn install
```

3. Run the development server:


```shellscript
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.


## Contributing

Contributions are welcome! Here's how you can contribute to PCPartPickerBD:

### Adding a New Retail Site

To add a new retail site to PCPartPickerBD, follow these steps:

1. **Create Scraper Functions**:

1. Add a new scraper function in `app/api/products/route.ts`
2. Add a new scraper function in `app/api/components/route.ts`
3. Add a new scraper function in `app/api/cross-site-search/route.ts`



2. **Update API Routes**:

1. Add your new scraper function to the GET function in each API route
2. Include the new retailer in the combined results



3. **Update UI Components**:

1. Add the new retailer to the product grouping on the home page
2. Update the compare page to display products from the new retailer
3. Add the new retailer to the PC Builder page





### Example: Adding Skyland

Here's an example of how Skyland was added to the project:

1. **Create Scraper Function in products API**:


```typescript
async function fetchSkylandProducts(query: string): Promise<Product[]> {
  const products: Product[] = []
  const url = `https://www.skyland.com.bd/index.php?route=product/search&search=${encodeURIComponent(query)}`

  try {
    // Add timeout to prevent hanging requests
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

    const response = await fetch(url, {
      next: { revalidate: 3600 },
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        // Other headers...
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

    // Process only the first 20 items to avoid timeouts
    const maxItems = 20
    let itemCount = 0

    // Skyland uses a similar structure to other OpenCart-based sites
    $(".product-layout")
      .slice(0, maxItems)
      .each((_, element) => {
        if (itemCount >= maxItems) return
        itemCount++

        const name = $(element).find(".name a").text().trim()
        let price = $(element).find(".price").text().trim().replace(/\s+/g, " ")
        const image = $(element).find(".image img").attr("src") || ""
        const productUrl = $(element).find(".name a").attr("href") || ""
        const availability = $(element).find(".stock").text().includes("In Stock") ? "In Stock" : "Out of Stock"

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
```

2. **Update the GET function**:


```typescript
export async function GET(request: NextRequest) {
  // ...existing code...
  
  try {
    // Fetch products from all sources
    const startechProducts = await fetchStartechProducts(query)
    const techlandProducts = await fetchTechlandProducts(query)
    const ultratechProducts = await fetchUltratechProducts(query)
    const potakaitProducts = await fetchPotakaitProducts(query)
    const pchouseProducts = await fetchPCHouseProducts(query)
    const skylandProducts = await fetchSkylandProducts(query)  // Add this line

    // Combine results
    const products = [
      ...startechProducts,
      ...techlandProducts,
      ...ultratechProducts,
      ...potakaitProducts,
      ...pchouseProducts,
      ...skylandProducts,  // Add this line
    ]

    return NextResponse.json({ products })
  } catch (error) {
    // ...error handling...
  }
}
```

3. **Update UI Components**:


```typescriptreact
{/* Skyland Products */}
{skylandProducts.length > 0 && (
  <div className="bg-card rounded-lg p-6 shadow-sm">
    <div className="flex items-center gap-3 mb-6">
      <div className="bg-teal-900 p-2 rounded-md flex items-center justify-center h-10 w-10">
        <span className="text-white font-bold">SK</span>
      </div>
      <h2 className="text-2xl font-semibold">Skyland</h2>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {skylandProducts.map((product, index) => (
        <ProductCard key={`skyland-${index}`} product={product} addToCompare={addToCompare} />
      ))}
    </div>
  </div>
)}
```

### Other Ways to Contribute

- **Improve Error Handling**: Enhance error handling in the scrapers for better reliability
- **Add User Accounts**: Implement user accounts to save builds and track price history
- **Create a Mobile App**: Develop a mobile app version of PCPartPickerBD
- **Add Price History Tracking**: Implement price history tracking for components


## Code Style

- Use ESLint and Prettier for code formatting
- Follow the Next.js App Router conventions
- Use TypeScript for type safety
- Use React Server Components where appropriate


## Deployment

The application can be deployed to Vercel:

```shellscript
npm run build
# or
vercel
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Lucide React](https://lucide.dev/)
- [Cheerio](https://cheerio.js.org/)


## Contact

For questions or feedback, please open an issue on GitHub or contact the maintainer at [hi@sabbir.lol](mailto:hi@sabbir.lol).
