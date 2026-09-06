"use client"

import { useMemo, useState } from "react"
import { TrendChart } from "@/features/protected/dashboard/components/trend-chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { roomStatusConfig } from "@/components/shared/status-badge"
import { useLocalBookings } from "@/features/protected/dashboard/hooks/use-local-bookings"
import { useRooms } from "@/features/protected/rooms/hooks/use-rooms"

const DAYS_BEFORE = 3
const DAYS_AFTER = 3
const periodOptions = ["This week", "This month"]

function dateRange(): string[] {
  const days: string[] = []
  for (let i = -DAYS_BEFORE; i <= DAYS_AFTER; i++) {
    const date = new Date()
    date.setDate(date.getDate() + i)
    days.push(date.toISOString().slice(0, 10))
  }
  return days
}

function dayLabel(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", { weekday: "short" }).format(new Date(iso))
}

export function OccupancyTrendChart() {
  const bookings = useLocalBookings()
  const rooms = useRooms()
  const [period, setPeriod] = useState(periodOptions[0])

  const { labels, occupied, available } = useMemo(() => {
    const days = dateRange()
    const activeBookings = bookings.filter((b) => b.status !== "cancelled")
    const occupiedPerDay = days.map(
      (iso) => activeBookings.filter((b) => b.checkIn <= iso && iso < b.checkOut).length
    )
    return {
      labels: days.map(dayLabel),
      occupied: occupiedPerDay,
      available: occupiedPerDay.map((count) => Math.max(0, rooms.length - count)),
    };
  }, [bookings, rooms]);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-base font-semibold text-foreground">Room occupancy trend</h2>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger size="sm" className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {periodOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-2">
        <TrendChart
          labels={labels}
          series={[
            { id: "occupied", label: "Occupied", color: roomStatusConfig.occupied.dotColor, values: occupied },
            { id: "available", label: "Available", color: roomStatusConfig.available.dotColor, values: available },
          ]}
          splitIndex={DAYS_BEFORE}
        />
      </div>
    </div>
  );
}
