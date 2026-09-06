"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowRightIcon } from "@phosphor-icons/react/ssr"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLocalBookings } from "@/features/protected/dashboard/hooks/use-local-bookings"
import { cn } from "@/lib/utils"

const typeFilters = ["Standard", "Suite", "Deluxe", "Executive"]
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function formatDayLabel(iso: string) {
  const date = new Date(iso)
  return {
    day: new Intl.DateTimeFormat("en-GB", { day: "numeric" }).format(date),
    weekday: new Intl.DateTimeFormat("en-GB", { weekday: "short" }).format(date),
  };
}

export function UpcomingCalendarCard() {
  const bookings = useLocalBookings()
  const { dashboardToken } = useParams<{ dashboardToken: string }>()
  const today = todayIso()

  const [month, setMonth] = useState(months[new Date().getMonth()])
  const [activeType, setActiveType] = useState(typeFilters[0])

  const upcoming = useMemo(() => {
    const byDate = new Map<string, number>()
    for (const booking of bookings) {
      if (booking.status === "cancelled" || booking.checkIn < today) continue
      byDate.set(booking.checkIn, (byDate.get(booking.checkIn) ?? 0) + 1)
    }
    return [...byDate.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(0, 5)
  }, [bookings, today]);

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-base font-semibold text-foreground">Calendar</h2>
        <Select value={month} onValueChange={setMonth}>
          <SelectTrigger size="sm" className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {months.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {typeFilters.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setActiveType(type)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              type === activeType ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {type}
          </button>
        ))}
      </div>

      <ul className="mt-4 flex flex-1 flex-col divide-y divide-border">
        {upcoming.length === 0 ? (
          <p className="py-3 text-sm text-muted-foreground">No upcoming bookings yet.</p>
        ) : (
          upcoming.map(([iso, count]) => {
            const { day, weekday } = formatDayLabel(iso)
            return (
              <li key={iso} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="flex w-10 flex-col items-center">
                    <span className="font-heading text-lg font-bold text-foreground">{day}</span>
                    <span className="text-[10px] text-muted-foreground uppercase">{weekday}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {count} booking{count === 1 ? "" : "s"}
                  </span>
                </div>
                <Link
                  href={`/admin/${dashboardToken}/arrivals`}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  More
                </Link>
              </li>
            );
          })
        )}
      </ul>

      <Link
        href={`/admin/${dashboardToken}/arrivals`}
        className="mt-3 flex w-fit items-center gap-1.5 text-sm font-medium text-primary hover:underline"
      >
        View all arrivals
        <ArrowRightIcon className="size-3.5" />
      </Link>
    </div>
  );
}
