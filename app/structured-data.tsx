export default function StructuredData() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "PCPartPickerBD",
            url: "https://pcpartpickerbd.com/",
            potentialAction: {
              "@type": "SearchAction",
              target: {
                "@type": "EntryPoint",
                urlTemplate: "https://pcpartpickerbd.com/search?query={search_term_string}",
              },
              "query-input": "required name=search_term_string",
            },
            description:
              "Compare PC component prices across different e-commerce sites in Bangladesh. Find the best deals on CPUs, GPUs, motherboards, and more.",
            publisher: {
              "@type": "Organization",
              name: "PCPartPickerBD",
              logo: {
                "@type": "ImageObject",
                url: "https://cdn-up.pages.dev/pc/pcppbd.svg",
              },
            },
            sameAs: [
              "https://facebook.com/pcpartpickerbd",
              "https://twitter.com/pcpartpickerbd",
              "https://instagram.com/pcpartpickerbd",
            ],
            keywords:
              "pc parts bangladesh, pc builder bangladesh, computer parts bd, pc component price comparison, startech pc builder, techland pc parts, gaming pc bangladesh, budget pc build bd, ryzen price bangladesh, rtx price bd",
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "PCPartPickerBD",
            url: "https://pcpartpickerbd.com",
            logo: "https://cdn-up.pages.dev/pc/pcppbd.svg",
            contactPoint: {
              "@type": "ContactPoint",
              telephone: "+880-1234567890", // Replace with actual contact number
              contactType: "customer service",
              areaServed: "BD",
              availableLanguage: ["English", "Bengali"],
            },
            address: {
              "@type": "PostalAddress",
              addressCountry: "Bangladesh",
              addressRegion: "Dhaka",
            },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "PC Builder",
                url: "https://pcpartpickerbd.com/build",
                description: "Build your custom PC with components from Bangladesh retailers",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Compare Products",
                url: "https://pcpartpickerbd.com/compare",
                description: "Compare PC components side by side to find the best deals",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: "PC Building Guides",
                url: "https://pcpartpickerbd.com/guides",
                description: "Learn how to build a PC with our step-by-step guides",
              },
              {
                "@type": "ListItem",
                position: 4,
                name: "Search PC Parts",
                url: "https://pcpartpickerbd.com/search",
                description: "Search for PC components across all major Bangladesh retailers",
              },
              {
                "@type": "ListItem",
                position: 5,
                name: "CPUs",
                url: "https://pcpartpickerbd.com/build/components/cpu",
                description: "Find the best prices on CPUs in Bangladesh",
              },
              {
                "@type": "ListItem",
                position: 6,
                name: "Graphics Cards",
                url: "https://pcpartpickerbd.com/build/components/video-card",
                description: "Compare graphics card prices from all major Bangladesh retailers",
              },
              {
                "@type": "ListItem",
                position: 7,
                name: "Motherboards",
                url: "https://pcpartpickerbd.com/build/components/motherboard",
                description: "Find motherboards compatible with your CPU at the best prices",
              },
              {
                "@type": "ListItem",
                position: 8,
                name: "Storage",
                url: "https://pcpartpickerbd.com/build/components/storage",
                description: "Compare prices on SSDs and HDDs in Bangladesh",
              },
            ],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SiteNavigationElement",
            name: [
              "Home",
              "PC Builder",
              "Compare Products",
              "PC Building Guides",
              "Search PC Parts",
              "CPUs",
              "Graphics Cards",
              "Motherboards",
              "RAM",
              "Storage",
              "Cases",
              "Power Supplies",
              "Monitors",
            ],
            url: [
              "https://pcpartpickerbd.com/",
              "https://pcpartpickerbd.com/build",
              "https://pcpartpickerbd.com/compare",
              "https://pcpartpickerbd.com/guides",
              "https://pcpartpickerbd.com/search",
              "https://pcpartpickerbd.com/build/components/cpu",
              "https://pcpartpickerbd.com/build/components/video-card",
              "https://pcpartpickerbd.com/build/components/motherboard",
              "https://pcpartpickerbd.com/build/components/memory",
              "https://pcpartpickerbd.com/build/components/storage",
              "https://pcpartpickerbd.com/build/components/case",
              "https://pcpartpickerbd.com/build/components/power-supply",
              "https://pcpartpickerbd.com/build/components/monitor",
            ],
          }),
        }}
      />
    </>
  )
}
