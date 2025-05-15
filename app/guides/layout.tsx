import type React from "react"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { SiteHeader } from "@/components/site-header"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "PC Building Guides for Bangladesh | PCPartPickerBD",
  description:
    "Learn how to build a PC in Bangladesh with our comprehensive guides. Get tips on choosing the right components, building within your budget, and finding the best deals in Bangladesh.",
  keywords:
    "pc building guide bangladesh, how to build pc bangladesh, budget pc build guide bd, gaming pc build bangladesh, pc assembly guide bangladesh",
  alternates: {
    canonical: "https://pcpartpickerbd.com/guides",
  },
}

export default function GuidesLayout({
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
