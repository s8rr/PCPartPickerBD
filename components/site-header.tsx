"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { Cpu, ShoppingCart } from "lucide-react"

const navItems = [
  { name: "Home", href: "/" },
  { name: "Build", href: "/build" },
  { name: "Guides", href: "/guides" },
]

export function SiteHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Logo />

        <nav className="hidden md:flex gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === item.href ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button asChild variant="outline" size="sm" className="hidden md:flex">
            <Link href="/build">
              <Cpu className="mr-2 h-4 w-4" />
              PC Builder
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/compare">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Compare
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
