"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"
import { ArrowsClockwiseIcon } from "@phosphor-icons/react/ssr"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendChart, type TrendLabel } from "@/features/protected/dashboard/components/trend-chart"
import { formatOrdinalDate } from "@/lib/utils"
import { roomStatusConfig } from "@/components/shared/status-badge"
import { useLocalBookings } from "@/features/protected/dashboard/hooks/use-local-bookings"
import { useRooms } from "@/features/protected/rooms/hooks/use-rooms"

const periodOptions = ["Today", "This week", "This month"]

const periodLabel: Record<string, string> = {
  Today: "Today",
  "This week": "Weekly",
  "This month": "Monthly",
}

function isoDaysAround(before: number, after: number): string[] {
  const days: string[] = []
  for (let i = -before; i <= after; i++) {
    const date = new Date()
    date.setDate(date.getDate() + i)
    days.push(date.toISOString().slice(0, 10))
  }
  return days
}

function weekLabels(days: string[]): TrendLabel[] {
  return days.map((iso) => {
    const date = new Date(iso)
    return {
      label: new Intl.DateTimeFormat("en-GB", { day: "numeric" }).format(date),
      sublabel: new Intl.DateTimeFormat("en-GB", { weekday: "short" }).format(date),
      fullLabel: formatOrdinalDate(date),
    };
  })
}

function yearMonthLabels(): { months: number[]; labels: TrendLabel[]; currentMonthIndex: number } {
  const now = new Date()
  const months = Array.from({ length: 12 }, (_, i) => i)
  const labels = months.map((m) => ({
    label: new Intl.DateTimeFormat("en-GB", { month: "short" }).format(new Date(now.getFullYear(), m, 1)),
    fullLabel: new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }).format(new Date(now.getFullYear(), m, 1)),
  }))
  return { months, labels, currentMonthIndex: now.getMonth() }
}

function hourBuckets(): { hours: number[]; labels: TrendLabel[]; nowIndex: number } {
  const hours = Array.from({ length: 12 }, (_, i) => i * 2)
  const todayLabel = formatOrdinalDate(new Date())
  const labels = hours.map((h) => ({
    label: `${String(h).padStart(2, "0")}:00`,
    fullLabel: `${todayLabel} · ${String(h).padStart(2, "0")}:00`,
  }))
  const nowIndex = hours.reduce((closest, h, i) => (h <= new Date().getHours() ? i : closest), 0)
  return { hours, labels, nowIndex }
}

function formatSyncLabel(minutesAgo: number): string {
  if (minutesAgo < 1) return "Just now"
  if (minutesAgo < 60) return `${minutesAgo}m ago`
  return `${Math.round(minutesAgo / 60)}h ago`
}

export function OccupancyTrendChart({ activeFilter }: { activeFilter: string }) {
  const bookings = useLocalBookings()
  const rooms = useRooms()
  const [syncMinutesAgo, setSyncMinutesAgo] = useState(() => Math.floor(Math.random() * 50) + 5)

  // Follows the dashboard's top-level filter by default, but can be overridden just for this card.
  const [prevActiveFilter, setPrevActiveFilter] = useState(activeFilter)
  const [period, setPeriod] = useState(activeFilter)
  if (activeFilter !== prevActiveFilter) {
    setPrevActiveFilter(activeFilter)
    setPeriod(activeFilter)
  }

  function handleSync() {
    setSyncMinutesAgo(0)
    toast.success("Room occupancy trend synced")
  }

  const { labels, occupied, available, defaultIndex } = useMemo(() => {
    const activeBookings = bookings.filter((b) => b.status !== "cancelled")
    const roomCount = rooms.length

    if (period === "Today") {
      const { hours, labels, nowIndex } = hourBuckets()
      const occupiedNow = rooms.filter((r) => r.status === "occupied").length
      const occupiedPerHour = hours.map((h) => {
        const wave = Math.round(Math.sin((h / 24) * Math.PI * 2) * 1.5)
        return Math.max(0, occupiedNow + (h <= new Date().getHours() ? wave : wave - 1))
      })
      return {
        labels,
        occupied: occupiedPerHour,
        available: occupiedPerHour.map((c) => Math.max(0, roomCount - c)),
        defaultIndex: nowIndex,
      };
    }

    if (period === "This month") {
      const { months, labels, currentMonthIndex } = yearMonthLabels()
      const occupiedNow = rooms.filter((r) => r.status === "occupied").length
      const occupiedPerMonth = months.map((m) => {
        const wave = Math.round(Math.sin((m / 12) * Math.PI * 2) * Math.min(2, roomCount / 4))
        return Math.max(0, Math.min(roomCount, occupiedNow + wave))
      })
      return {
        labels,
        occupied: occupiedPerMonth,
        available: occupiedPerMonth.map((c) => Math.max(0, roomCount - c)),
        defaultIndex: currentMonthIndex,
      };
    }

    // This week
    const days = isoDaysAround(3, 3)
    const occupiedPerDay = days.map((iso) => activeBookings.filter((b) => b.checkIn <= iso && iso < b.checkOut).length)
    return {
      labels: weekLabels(days),
      occupied: occupiedPerDay,
      available: occupiedPerDay.map((c) => Math.max(0, roomCount - c)),
      defaultIndex: 3,
    };
  }, [period, bookings, rooms]);

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-heading text-base font-semibold text-foreground">Room occupancy trend</h2>
          <button
            type="button"
            onClick={handleSync}
            className="flex items-center gap-1 rounded-full px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowsClockwiseIcon size={12} />
            Last sync {formatSyncLabel(syncMinutesAgo)}
          </button>
        </div>
        <div className="flex items-center gap-4">
          <ul className="flex items-center gap-3 text-xs text-muted-foreground">
            <li className="flex items-center gap-1.5">
              <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: roomStatusConfig.occupied.dotColor }} />
              Occupied
            </li>
            <li className="flex items-center gap-1.5">
              <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: roomStatusConfig.available.dotColor }} />
              Available
            </li>
          </ul>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger size="sm" className="w-28 text-xs">
              <SelectValue>{periodLabel[period] ?? "Weekly"}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {periodOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {periodLabel[option]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-8 flex flex-1 flex-col">
        <TrendChart
          labels={labels}
          series={[
            { id: "occupied", label: "Occupied", color: roomStatusConfig.occupied.dotColor, values: occupied },
            { id: "available", label: "Available", color: roomStatusConfig.available.dotColor, values: available },
          ]}
          defaultIndex={defaultIndex}
          percentOf={rooms.length}
          fillHeight
        />
      </div>
    </div>
  );
}
