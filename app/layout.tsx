import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { MobileNav } from "@/components/mobile-nav"
import { Toaster } from "@/components/toaster"
import StructuredData from "./structured-data"
import { BreadcrumbJsonLd } from "./breadcrumb-jsonld"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL("https://pcpartpickerbd.com"),
  title: "PCPartPickerBD - #1 PC Parts Price Comparison in Bangladesh | PC Builder Tool",
  description:
    "Compare PC component prices across Startech, Techland, UltraTech, Ryans, Potaka IT & more in Bangladesh. Build your custom PC with the best prices. Find CPUs, GPUs, motherboards & all PC parts in Bangladesh.",
  keywords:
    "pc parts bangladesh, pc builder bangladesh, computer parts bd, pc component price comparison, startech pc builder, techland pc parts, gaming pc bangladesh, budget pc build bd, ryzen price bangladesh, rtx price bd, pc parts price in bangladesh, pcpartpicker bangladesh, pcpartpickerbd",
  authors: [{ name: "PCPartPickerBD Team" }],
  creator: "PCPartPickerBD",
  publisher: "PCPartPickerBD",
  alternates: {
    canonical: "https://pcpartpickerbd.com",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://pcpartpickerbd.com/",
    title: "PCPartPickerBD - #1 PC Parts Price Comparison in Bangladesh",
    description:
      "Build your custom PC with the best prices from Bangladeshi retailers. Compare prices across Startech, Techland, UltraTech, Ryans & more.",
    siteName: "PCPartPickerBD",
    images: [
      {
        url: "https://cdn-up.pages.dev/pc/pcppbd-og.png",
        width: 1200,
        height: 630,
        alt: "PCPartPickerBD - PC Builder Tool for Bangladesh",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PCPartPickerBD - #1 PC Parts Price Comparison in Bangladesh",
    description:
      "Build your custom PC with the best prices from Bangladeshi retailers. Compare prices across Startech, Techland, UltraTech, Ryans & more.",
    images: ["https://cdn-up.pages.dev/pc/pcppbd-og.png"],
  },
  icons: [{ url: "https://cdn-up.pages.dev/pc/pcppbd.svg" }],
  verification: {
    google: "google-site-verification-code", // Replace with your actual verification code
  },
  category: "technology",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="https://cdn-up.pages.dev/pc/pcppbd.svg" />
        <link rel="canonical" href="https://pcpartpickerbd.com/" />
        <StructuredData />
        <BreadcrumbJsonLd />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="min-h-screen pb-16 md:pb-0">
            {children}
            <MobileNav />
            <Toaster />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
