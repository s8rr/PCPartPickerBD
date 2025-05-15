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
              target: "https://pcpartpickerbd.com/search?query={search_term_string}",
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
              "https://facebook.com/pcpartpickerbd", // Replace with actual social media URLs
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
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Compare Products",
                url: "https://pcpartpickerbd.com/compare",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: "PC Building Guides",
                url: "https://pcpartpickerbd.com/guides",
              },
              {
                "@type": "ListItem",
                position: 4,
                name: "Search PC Parts",
                url: "https://pcpartpickerbd.com/search",
              },
            ],
          }),
        }}
      />
    </>
  )
}
