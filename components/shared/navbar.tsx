import Link from "next/link"
import { DeviceMobileIcon } from "@phosphor-icons/react/ssr"
import { SavedNavLink } from "@/components/shared/saved-nav-link"

export function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-secondary/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-6 py-3">
        <Link href="/" className="font-heading text-xl font-semibold text-foreground">
          Roomly
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          <SavedNavLink />
          <a
            href="https://apps.apple.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-full border border-border px-4 py-1.5 font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <DeviceMobileIcon className="size-4" />
            Become a member
          </a>
        </nav>
      </div>
    </header>
  );
}
