import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://pcpartpickerbd.com"
  const lastModified = new Date()

  // Main pages
  const mainPages = [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/build`,
      lastModified,
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/compare`,
      lastModified,
      changeFrequency: "daily" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/guides`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/search`,
      lastModified,
      changeFrequency: "daily" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/suggestions`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/bug-report`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
  ]

  // Component pages
  const componentTypes = [
    "cpu",
    "video-card",
    "motherboard",
    "memory",
    "storage",
    "case",
    "power-supply",
    "monitor",
    "keyboard",
    "mouse",
    "headphones",
    "speakers",
    "cpu-cooler",
    "case-fan",
  ]

  const componentPages = componentTypes.map((type) => ({
    url: `${baseUrl}/build/components/${type}`,
    lastModified,
    changeFrequency: "daily" as const,
    priority: 0.7,
  }))

  // Guide pages - assuming you have guide IDs 1-10
  const guideIds = Array.from({ length: 10 }, (_, i) => i + 1)
  const guidePages = guideIds.map((id) => ({
    url: `${baseUrl}/guides/${id}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }))

  // Popular search terms pages
  const popularSearchTerms = [
    "ryzen",
    "intel",
    "rtx",
    "nvidia",
    "amd",
    "gaming-pc",
    "budget-pc",
    "workstation",
    "monitor",
    "ssd",
  ]

  const searchPages = popularSearchTerms.map((term) => ({
    url: `${baseUrl}/search?query=${term}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }))

  return [...mainPages, ...componentPages, ...guidePages, ...searchPages]
}
