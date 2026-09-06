import Link from "next/link"
import {
  EnvelopeSimpleIcon,
  FacebookLogoIcon,
  InstagramLogoIcon,
  MapPinIcon,
  PhoneIcon,
} from "@phosphor-icons/react/ssr"

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary">
      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-8 px-6 py-10 sm:grid-cols-3">
        <div>
          <p className="font-heading text-lg font-semibold text-foreground">Roomly</p>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            A boutique hotel built around one idea: a quiet stay, done right.
          </p>
          <div className="mt-4 flex items-center gap-3 text-muted-foreground">
            <Link href="#" aria-label="Roomly on Instagram" className="hover:text-primary">
              <InstagramLogoIcon className="size-5" />
            </Link>
            <Link href="#" aria-label="Roomly on Facebook" className="hover:text-primary">
              <FacebookLogoIcon className="size-5" />
            </Link>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-foreground">Explore</p>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
            <li>
              <Link href="/" className="hover:text-primary">
                Home
              </Link>
            </li>
            <li>
              <Link href="/rooms" className="hover:text-primary">
                Rooms
              </Link>
            </li>
            <li>
              <Link href="/saved" className="hover:text-primary">
                Saved rooms
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-medium text-foreground">Contact</p>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <MapPinIcon className="size-4 shrink-0" />
              12 Harbour Road, Accra
            </li>
            <li className="flex items-center gap-2">
              <PhoneIcon className="size-4 shrink-0" />
              +233 20 000 0000
            </li>
            <li className="flex items-center gap-2">
              <EnvelopeSimpleIcon className="size-4 shrink-0" />
              stay@roomly.example
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <p className="mx-auto w-full max-w-[1440px] px-6 py-4 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Roomly. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
