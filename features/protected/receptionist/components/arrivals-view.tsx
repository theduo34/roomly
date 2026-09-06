"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { ArrivalsList } from "@/features/protected/receptionist/components/arrivals-list"
import { ArrivalSearchDialog } from "@/features/protected/receptionist/components/arrival-search-dialog"
import { WalkInBookingDialog } from "@/features/protected/receptionist/components/walk-in-booking-dialog"
import { useLocalBookings } from "@/features/protected/dashboard/hooks/use-local-bookings"
import { cn } from "@/lib/utils"

const dateFilters = ["Today", "This week", "This month"]

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function addDays(iso: string, days: number): string {
  const date = new Date(iso)
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

function endOfMonthIso(): string {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10)
}

export function ArrivalsView() {
  const { dashboardToken } = useParams<{ dashboardToken: string }>()
  const bookings = useLocalBookings()
  const today = todayIso()
  const [activeFilter, setActiveFilter] = useState(dateFilters[0])

  const rangeEnd = activeFilter === "Today" ? today : activeFilter === "This week" ? addDays(today, 6) : endOfMonthIso()

  const arrivals = bookings
    .filter((b) => b.status === "confirmed" && b.checkIn >= today && b.checkIn <= rangeEnd)
    .sort((a, b) => a.checkIn.localeCompare(b.checkIn))
  const inHouse = bookings.filter((b) => b.status === "checked_in")

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 rounded-full border border-border bg-card p-1">
          {dateFilters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                filter === activeFilter
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {filter}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <ArrivalSearchDialog bookings={bookings} dashboardToken={dashboardToken} />
          <WalkInBookingDialog />
        </div>
      </div>

      <ArrivalsList
        arrivals={arrivals}
        title="Arrivals"
        emptyMessage="No confirmed arrivals in this period yet. Bookings made on the guest site will show up here."
        dashboardToken={dashboardToken}
      />
      <ArrivalsList
        arrivals={inHouse}
        title="Currently in-house"
        emptyMessage="No guests are checked in right now."
        dashboardToken={dashboardToken}
      />
    </div>
  );
}
