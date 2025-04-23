import type React from "react"
import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export const metadata: Metadata = {
  title: "Report a Bug - PCPartPickerBD",
  description:
    "Help us improve by reporting bugs on PCPartPickerBD - the #1 PC parts price comparison tool in Bangladesh",
}

export default function BugReportLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <SiteHeader />
      {children}
      <SiteFooter />
    </div>
  )
}
