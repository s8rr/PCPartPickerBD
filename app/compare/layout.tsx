import type React from "react"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { SiteHeader } from "@/components/site-header"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Compare PC Parts Prices in Bangladesh | PCPartPickerBD",
  description:
    "Compare PC component prices from different retailers in Bangladesh. Find the best deals on CPUs, GPUs, motherboards, and more from Startech, Techland, UltraTech, and other Bangladeshi retailers.",
  keywords:
    "compare pc parts bangladesh, pc component price comparison bd, best pc parts deals bangladesh, pc hardware price compare bangladesh",
  alternates: {
    canonical: "https://pcpartpickerbd.com/compare",
  },
}

export default function CompareLayout({
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
