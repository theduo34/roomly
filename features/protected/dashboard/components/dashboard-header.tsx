"use client"

import { usePathname } from "next/navigation"
import { BellIcon, SidebarSimpleIcon } from "@phosphor-icons/react/ssr"

const sectionTitles: Record<string, string> = {
  dashboard: "Dashboard",
  arrivals: "Arrivals",
  rooms: "Rooms",
  guests: "Guests",
  bookings: "Bookings",
  staff: "Staff",
  policies: "Policies",
  audit: "Audit trail",
}

function useSectionTitle() {
  const pathname = usePathname()
  const section = pathname.split("/").filter(Boolean)[2]
  return sectionTitles[section ?? "dashboard"] ?? "Dashboard"
}

export function DashboardHeader({
  collapsed,
  onToggleCollapsed,
}: {
  collapsed: boolean
  onToggleCollapsed: () => void
}) {
  const title = useSectionTitle()

  return (
    <header className="flex shrink-0 items-center justify-between border-b border-border bg-background px-6 py-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-pressed={collapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <SidebarSimpleIcon size={20} />
        </button>
        <h1 className="font-heading text-sm font-semibold tracking-[0.15em] text-foreground uppercase">
          {title}
        </h1>
      </div>
      <span className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground">
        <BellIcon size={20} />
      </span>
    </header>
  );
}
