"use client"

import { usePathname } from "next/navigation"

export function BreadcrumbJsonLd() {
  const pathname = usePathname()

  // Skip for homepage
  if (pathname === "/") return null

  // Create breadcrumb items based on the current path
  const pathSegments = pathname.split("/").filter(Boolean)
  const breadcrumbItems = pathSegments.map((segment, index) => {
    const url = `/${pathSegments.slice(0, index + 1).join("/")}`
    const name = segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
      .replace("Cpu", "CPU")
      .replace("Gpu", "GPU")

    return {
      "@type": "ListItem",
      position: index + 2, // +2 because home is position 1
      name: name,
      item: `https://pcpartpickerbd.com${url}`,
    }
  })

  // Add home as the first item
  breadcrumbItems.unshift({
    "@type": "ListItem",
    position: 1,
    name: "Home",
    item: "https://pcpartpickerbd.com",
  })

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems,
  }

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }} />
}
