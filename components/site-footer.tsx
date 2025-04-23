import Link from "next/link"
import { Github } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} PCPartPickerBD. All rights reserved.
          </p>
        </div>
        <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Developed by</span>
            <Link
              href="https://sabbir.lol"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium hover:underline"
            >
              sabbir.lol
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Supported by</span>
            <Link
              href="https://unknownport.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium hover:underline"
            >
              unknownport.com
            </Link>
          </div>
          <Link
            href="https://github.com/s8rr/pcpartpickerbd"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-sm font-medium hover:underline"
          >
            <Github className="h-4 w-4" />
            <span>GitHub</span>
          </Link>
          <nav className="flex gap-4 text-sm">
            <Link href="/suggestions" className="hover:underline">
              Suggestions
            </Link>
            <Link href="/bug-report" className="hover:underline">
              Report a Bug
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
