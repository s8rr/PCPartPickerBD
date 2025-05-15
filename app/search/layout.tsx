import type React from "react"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { SiteHeader } from "@/components/site-header"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Search PC Parts in Bangladesh | PCPartPickerBD",
  description:
    "Search for PC components across all major retailers in Bangladesh. Find CPUs, GPUs, motherboards, RAM, and more at the best prices from Startech, Techland, UltraTech, and other Bangladeshi retailers.",
  keywords:
    "search pc parts bangladesh, find computer components bd, pc hardware search bangladesh, computer parts search bd",
  alternates: {
    canonical: "https://pcpartpickerbd.com/search",
  },
}

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <SiteHeader />
      <div className="container mx-auto px-4 py-4">
        <Breadcrumbs />
        {children}
      </div>
    </>
  )
}
