export default function StructuredData() {
  return (
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
        }),
      }}
    />
  )
}
