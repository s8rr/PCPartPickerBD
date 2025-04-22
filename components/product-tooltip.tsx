import type React from "react"
import { TooltipProvider, TooltipRoot, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import Image from "next/image"

interface ProductTooltipProps {
  product: {
    name: string
    image: string
    price?: string
    source?: string
    availability?: string
    url?: string
    specs?: Record<string, string>
  }
  children: React.ReactNode
}

export function ProductTooltip({ product, children }: ProductTooltipProps) {
  return (
    <TooltipProvider delayDuration={100}>
      <TooltipRoot>
        <TooltipTrigger asChild>
          <span className="hover:underline cursor-pointer">{children}</span>
        </TooltipTrigger>
        <TooltipContent side="right" align="start" className="p-3 max-w-[300px]">
          <div className="space-y-2">
            <div className="font-medium text-sm">{product.name}</div>
            {product.image && (
              <div className="relative h-32 w-full bg-white rounded">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-contain p-2"
                />
              </div>
            )}
          </div>
        </TooltipContent>
      </TooltipRoot>
    </TooltipProvider>
  )
}
