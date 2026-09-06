"use client"

import { useMemo } from "react"
import { CalendarBlankIcon, ChartBarIcon, XCircleIcon } from "@phosphor-icons/react/ssr"
import { StatCard } from "@/features/protected/dashboard/components/stat-card"
import { useLocalBookings } from "@/features/protected/dashboard/hooks/use-local-bookings"
import { useRooms } from "@/features/protected/rooms/hooks/use-rooms"
import type { Room, RoomType } from "@/lib/types"

const roomTypeLabels: Record<RoomType, string> = {
  standard: "Standard",
  deluxe: "Deluxe",
  suite: "Suite",
  executive: "Executive",
}

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function BarList({ rows }: { rows: { label: string; count: number }[] }) {
  const total = Math.max(1, ...rows.map((r) => r.count))
  return (
    <div className="mt-4 flex flex-col gap-3">
      {rows.map((row) => (
        <div key={row.label} className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{row.label}</span>
            <span className="font-medium text-foreground">{row.count}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-[width]"
              style={{ width: `${(row.count / total) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function BookingAnalytics() {
  const bookings = useLocalBookings()
  const rooms = useRooms()

  const { cancellationRate, roomTypeRows, weekdayRows } = useMemo(() => {
    const roomsById = new Map<string, Room>(rooms.map((r) => [r.id, r]))
    const cancelled = bookings.filter((b) => b.status === "cancelled").length
    const rate = bookings.length > 0 ? (cancelled / bookings.length) * 100 : 0

    const typeCounts = new Map<RoomType, number>()
    for (const booking of bookings) {
      const type = roomsById.get(booking.roomId)?.type
      if (!type) continue
      typeCounts.set(type, (typeCounts.get(type) ?? 0) + 1)
    }
    const typeRows = (Object.keys(roomTypeLabels) as RoomType[])
      .map((type) => ({ label: roomTypeLabels[type], count: typeCounts.get(type) ?? 0 }))
      .sort((a, b) => b.count - a.count)

    const weekdayCounts = new Array(7).fill(0)
    for (const booking of bookings) {
      const day = new Date(booking.checkIn).getDay()
      weekdayCounts[day] += 1
    }
    const dayRows = weekdayLabels.map((label, i) => ({ label, count: weekdayCounts[i] }))

    return { cancellationRate: rate, roomTypeRows: typeRows, weekdayRows: dayRows }
  }, [bookings, rooms])

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total bookings" value={String(bookings.length)} icon={ChartBarIcon} />
        <StatCard
          label="Most booked room type"
          value={roomTypeRows[0]?.count ? roomTypeRows[0].label : "—"}
          icon={CalendarBlankIcon}
        />
        <StatCard
          label="Cancellation rate"
          value={`${cancellationRate.toFixed(1)}%`}
          icon={XCircleIcon}
          tone="destructive"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-heading text-base font-semibold text-foreground">Most booked room types</h2>
          <BarList rows={roomTypeRows} />
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-heading text-base font-semibold text-foreground">Peak check-in days</h2>
          <BarList rows={weekdayRows} />
        </div>
      </div>
    </div>
  );
}
