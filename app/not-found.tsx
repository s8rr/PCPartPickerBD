import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, AlertTriangle } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="mb-6">
        <AlertTriangle className="h-24 w-24 text-yellow-500 mx-auto" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight mb-2">404 - Page Not Found</h1>
      <p className="text-xl text-muted-foreground mb-8 max-w-md">
        Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild size="lg">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/build">Browse PC Parts</Link>
        </Button>
      </div>
    </div>
  )
}
