import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { SiteHeader } from "@/components/site-header"
import { AttentionBanner } from "@/components/attention-banner"
import { Button } from "@/components/ui/button"
import { Cpu, Fan, Layers, MemoryStickIcon, HardDrive, Tv2, Box, Zap, ArrowRight, BookOpen } from "lucide-react"

// Define guide categories with icons and descriptions
const guideCategories = [
  {
    id: "cpu",
    title: "CPU Installation",
    description: "Learn how to properly install a CPU without damaging pins or socket",
    icon: Cpu,
    image: "https://docs.oracle.com/cd/E19140-01/html/821-0282/figures/R128019_CPU_install.png",
    difficulty: "Moderate",
    videoUrl: "https://www.youtube.com/embed/_zojIW-2DD8",
  },
  {
    id: "cpu-cooler",
    title: "CPU Cooler Installation",
    description: "Properly mount air or liquid coolers for optimal thermal performance",
    icon: Fan,
    image: "https://www.wikihow.com/images/thumb/d/d2/Install-a-CPU-Cooler-in-an-AMD-Motherboard-Step-4-Version-3.jpg/v4-460px-Install-a-CPU-Cooler-in-an-AMD-Motherboard-Step-4-Version-3.jpg",
    difficulty: "Moderate",
    videoUrl: "https://www.youtube.com/embed/WbvKjsuznBk",
  },
  {
    id: "motherboard",
    title: "Motherboard Installation",
    description: "Install your motherboard safely into your case with proper standoffs",
    icon: Layers,
    image: "https://img.freepik.com/premium-photo/line-drawing-motherboard-components-vector-style_1304121-4187.jpg",
    difficulty: "Easy",
    videoUrl: "https://www.youtube.com/embed/XSTKVZcp5sQ",
  },
  {
    id: "memory",
    title: "RAM Installation",
    description: "Install memory modules in the correct slots for optimal performance",
    icon: MemoryStickIcon,
    image: "https://pubs.lenovo.com/sn550/installdimm-450.png",
    difficulty: "Easy",
    videoUrl: "https://www.youtube.com/embed/kRMJwiXhrEU",
  },
  {
    id: "storage",
    title: "Storage Installation",
    description: "Mount and connect SSDs, HDDs, and M.2 drives properly",
    icon: HardDrive,
    image: "https://docs.oracle.com/cd/E19127-01/ultra27.ws/820-6776/images/123263.gif",
    difficulty: "Easy",
    videoUrl: "https://www.youtube.com/embed/uUk-WxBDgjw",
  },
  {
    id: "video-card",
    title: "Graphics Card Installation",
    description: "Safely install your GPU and connect power cables correctly",
    icon: Tv2,
    image: "https://km-ap.asus.com/uploads/PhotoLibrarys/8b6897a7-27e5-4451-84a2-b4aee2b25f15/20240229152408449_2024022915_23_35ASUSKnowledgeManagement.png",
    difficulty: "Easy",
    videoUrl: "https://www.youtube.com/embed/YVbjl69z3HE",
  },
  {
    id: "case",
    title: "PC Case Setup",
    description: "Prepare your case with proper cable management and airflow",
    icon: Box,
    image: "https://northernmicro.com/spirit-manuals/spirit-x399-as-user-manual/Graphics/X99-A_MB_Installation.png",
    difficulty: "Moderate",
    videoUrl: "https://www.youtube.com/embed/s1fxZ-VWs2U",
  },
  {
    id: "power-supply",
    title: "Power Supply Installation",
    description: "Install and connect your PSU with proper cable management",
    icon: Zap,
    image: "https://support.moonpoint.com/pc/hardware/power-supply/gs550/550W_manual_html_1f38870b.png",
    difficulty: "Easy",
    videoUrl: "https://www.youtube.com/embed/7SjQo7wrWq4",
  },
  {
    id: "full-build",
    title: "Complete PC Build Guide",
    description: "Step-by-step guide to building a complete PC from scratch",
    icon: BookOpen,
    image: "https://i.ytimg.com/vi/s1fxZ-VWs2U/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLDvGDcROE02ydlnR1qLSWGm9AImcQ",
    difficulty: "Advanced",
    videoUrl: "https://www.youtube.com/embed/s1fxZ-VWs2U",
  },
]

export default function GuidesPage() {
  return (
    <div className="min-h-screen">
      <AttentionBanner />
      <SiteHeader />

      <div className="container mx-auto py-8 px-4">
        {/* Hero section */}
        <div className="bg-gradient-to-b from-background to-muted/50 border rounded-lg p-8 mb-12">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold mb-4">PC Building Guides</h1>
            <p className="text-muted-foreground mb-6">
              Learn how to build your PC with our comprehensive installation guides. Whether you're a first-time builder
              or an experienced enthusiast, our step-by-step instructions will help you assemble your components safely
              and efficiently.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild>
                <Link
                  href="https://www.youtube.com/watch?v=s1fxZ-VWs2U&pp=ygUSbHR0IHBjIGd1aWxkIGd1aWRl"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Watch PC Build Guide
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/build">PC Builder Tool</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Guides section */}
        <div id="guides" className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Installation Guides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guideCategories.map((guide) => (
              <Link key={guide.id} href={`/guides/${guide.id}`} className="block">
                <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
                  <div className="relative h-48 bg-muted">
                    <Image src={guide.image || "/placeholder.svg"} alt={guide.title} fill className="object-cover" />
                    <div className="absolute top-2 right-2 bg-background/90 text-foreground px-2 py-1 rounded text-xs font-medium">
                      {guide.difficulty}
                    </div>
                    {/* Removed play button overlay */}
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <guide.icon className="h-5 w-5 text-primary" />
                      <h3 className="font-bold">{guide.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 flex-1">{guide.description}</p>
                    <div className="flex items-center text-primary text-sm font-medium">
                      <span>Read guide</span>
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Tips section */}
        <div className="bg-card rounded-lg p-6 shadow-sm mb-12">
          <h2 className="text-2xl font-bold mb-4">PC Building Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Before You Start</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-sm">Work on a clean, static-free surface</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-sm">Ground yourself to prevent static discharge</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-sm">Organize your components and screws</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-sm">Read your component manuals before starting</span>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Common Mistakes to Avoid</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-destructive/10 p-1 mt-0.5">
                    <X className="h-3 w-3 text-destructive" />
                  </div>
                  <span className="text-sm">Forgetting to install I/O shield before motherboard</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-destructive/10 p-1 mt-0.5">
                    <X className="h-3 w-3 text-destructive" />
                  </div>
                  <span className="text-sm">Applying too much thermal paste</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-destructive/10 p-1 mt-0.5">
                    <X className="h-3 w-3 text-destructive" />
                  </div>
                  <span className="text-sm">Not connecting all necessary power cables</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-destructive/10 p-1 mt-0.5">
                    <X className="h-3 w-3 text-destructive" />
                  </div>
                  <span className="text-sm">Installing RAM in incorrect slots (check motherboard manual)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Tools section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Essential PC Building Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Phillips Screwdriver", description: "Size #1 and #2 for most PC screws" },
              { name: "Anti-Static Wrist Strap", description: "Prevents damage from static electricity" },
              { name: "Thermal Paste", description: "For CPU and cooler installation" },
              { name: "Cable Ties", description: "For clean cable management" },
            ].map((tool, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h3 className="font-medium mb-1">{tool.name}</h3>
                <p className="text-sm text-muted-foreground">{tool.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Check(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function X(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}
