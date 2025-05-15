import type React from "react"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { SiteHeader } from "@/components/site-header"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "PC Builder Bangladesh - Build Your Custom PC | PCPartPickerBD",
  description:
    "Build your custom PC with PCPartPickerBD's PC Builder tool. Compare prices from top Bangladeshi retailers like Startech, Techland, and more. Find the best deals on PC parts in Bangladesh.",
  keywords:
    "pc builder bangladesh, custom pc builder bd, build pc online bangladesh, pc configurator bangladesh, gaming pc builder bangladesh",
  alternates: {
    canonical: "https://pcpartpickerbd.com/build",
  },
}

export default function BuildLayout({
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
