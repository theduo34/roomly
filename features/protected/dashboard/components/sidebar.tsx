"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BuildingsIcon,
  CalendarCheckIcon,
  ChartLineUpIcon,
  ClipboardTextIcon,
  ClockCounterClockwiseIcon,
  DoorOpenIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react/ssr"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { AccountMenu } from "@/features/protected/dashboard/components/account-menu"
import { cn } from "@/lib/utils"
import type { StaffRole } from "@/lib/types"

type NavItem = { label: string; section: string; icon: typeof DoorOpenIcon }

const navByRole: Record<StaffRole, NavItem[]> = {
  receptionist: [
    { label: "Dashboard", section: "dashboard", icon: DoorOpenIcon },
    { label: "Arrivals", section: "arrivals", icon: CalendarCheckIcon },
    { label: "Rooms", section: "rooms", icon: BuildingsIcon },
    { label: "Guests", section: "guests", icon: UsersThreeIcon },
  ],
  manager: [
    { label: "Dashboard", section: "dashboard", icon: ChartLineUpIcon },
    { label: "Bookings", section: "bookings", icon: CalendarCheckIcon },
    { label: "Rooms", section: "rooms", icon: BuildingsIcon },
    { label: "Staff", section: "staff", icon: UsersThreeIcon },
  ],
  director: [
    { label: "Dashboard", section: "dashboard", icon: ChartLineUpIcon },
    { label: "Bookings", section: "bookings", icon: CalendarCheckIcon },
    { label: "Rooms", section: "rooms", icon: BuildingsIcon },
    { label: "Staff", section: "staff", icon: UsersThreeIcon },
    { label: "Policies", section: "policies", icon: ClipboardTextIcon },
    { label: "Audit trail", section: "audit", icon: ClockCounterClockwiseIcon },
  ],
}

export function Sidebar({
  role,
  token,
  collapsed,
  mobileOpen,
  onCloseMobile,
}: {
  role: StaffRole
  token: string
  collapsed: boolean
  mobileOpen: boolean
  onCloseMobile: () => void
}) {
  const pathname = usePathname()

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex h-full w-64 shrink-0 flex-col border-r border-border bg-background transition-transform duration-200 md:static md:translate-x-0 md:transition-[width]",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          collapsed ? "md:w-20" : "md:w-64"
        )}
      >
        <div className="flex h-16 items-center border-b border-border px-4">
          <div className={cn(collapsed && "md:hidden")}>
            <p className="font-sans text-sm font-semibold uppercase tracking-wide text-foreground">Roomly</p>
            <p className="text-xs text-muted-foreground">Staff Console</p>
          </div>
          {collapsed && (
            <span className="hidden size-9 items-center justify-center rounded-md bg-primary/10 font-sans text-sm font-semibold text-primary md:flex">
              R
            </span>
          )}
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
          {navByRole[role].map(({ label, section, icon: Icon }) => {
            const href = `/admin/${token}/${section}`
            const isActive = pathname.startsWith(href)

            const linkClasses = cn(
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-base font-semibold transition-colors",
              collapsed && "md:justify-center md:px-0",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )

            const navElement = (
              <Link href={href} className={linkClasses} onClick={onCloseMobile}>
                <Icon size={22} />
                <span className={cn("flex-1", collapsed && "md:hidden")}>{label}</span>
              </Link>
            )

            if (!collapsed) {
              return <div key={label}>{navElement}</div>
            }

            return (
              <Tooltip key={label}>
                <TooltipTrigger asChild>{navElement}</TooltipTrigger>
                <TooltipContent side="right">{label}</TooltipContent>
              </Tooltip>
            )
          })}
        </nav>

        <div className="border-t border-border p-3">
          <AccountMenu role={role} collapsed={collapsed} />
        </div>
      </aside>
    </>
  );
}
