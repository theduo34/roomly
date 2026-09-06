"use client"

import { usePathname, useRouter } from "next/navigation"
import { ArrowLeftIcon, CalendarBlankIcon, QuestionIcon, SidebarSimpleIcon } from "@phosphor-icons/react/ssr"
import { NotificationsSheet } from "@/features/protected/dashboard/components/notifications-sheet"
import { formatOrdinalDate } from "@/lib/utils"

const sectionTitles: Record<string, string> = {
  dashboard: "Dashboard",
  arrivals: "Arrivals",
  rooms: "Rooms",
  guests: "Guests",
  bookings: "Bookings",
  "vehicle-log": "Vehicle log",
  staff: "Staff",
  maintenance: "Maintenance",
  refunds: "Refunds & promos",
  analytics: "Analytics",
  policies: "Policies",
  audit: "Audit trail",
}

function useSectionTitle() {
  const pathname = usePathname()
  const section = pathname.split("/").filter(Boolean)[2]
  return sectionTitles[section ?? "dashboard"] ?? "Dashboard"
}

/** Pages one level deeper than a sidebar section (e.g. a booking's own detail page) aren't reachable from the sidebar, so the header falls back to a back button instead of the sidebar toggle. */
function useShowBack(): boolean {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)
  return segments.length > 3
}

export function DashboardHeader({
  collapsed,
  onToggleCollapsed,
}: {
  collapsed: boolean
  onToggleCollapsed: () => void
}) {
  const title = useSectionTitle()
  const showBack = useShowBack()
  const router = useRouter()

  return (
    <header className="flex shrink-0 items-center justify-between border-b border-border bg-background px-6 py-4">
      <div className="flex items-center gap-3">
        {showBack ? (
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go back"
            className="flex size-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <ArrowLeftIcon size={14} />
          </button>
        ) : (
          <button
            type="button"
            onClick={onToggleCollapsed}
            aria-pressed={collapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <SidebarSimpleIcon size={20} />
          </button>
        )}
        <h1 className="font-heading text-sm font-semibold tracking-[0.15em] text-foreground uppercase">
          {title}
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden items-center gap-2 rounded-full border border-border px-3.5 py-2 text-sm font-semibold text-green-700 sm:flex dark:text-green-400">
          <CalendarBlankIcon size={16} weight="bold" />
          Today | {formatOrdinalDate(new Date(), "short")}
        </span>
        <NotificationsSheet />
        <button
          type="button"
          aria-label="Help"
          title="Help"
          className="flex size-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <QuestionIcon size={18} />
        </button>
      </div>
    </header>
  );
}
