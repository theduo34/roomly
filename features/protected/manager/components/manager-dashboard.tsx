"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  ArrowRightIcon,
  ArrowUUpLeftIcon,
  BuildingsIcon,
  ChartLineUpIcon,
  ReceiptXIcon,
  WalletIcon,
} from "@phosphor-icons/react/ssr"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatCard } from "@/features/protected/dashboard/components/stat-card"
import { RadialMeter } from "@/features/protected/dashboard/components/radial-meter"
import { roomStatusConfig } from "@/components/shared/status-badge"
import { RevenueTrendChart } from "@/features/protected/manager/components/revenue-trend-chart"
import { BookingStatusBars } from "@/features/protected/manager/components/booking-status-bars"
import { BookingsTable } from "@/features/protected/manager/components/bookings-table"
import { useLocalBookings } from "@/features/protected/dashboard/hooks/use-local-bookings"
import { useRooms } from "@/features/protected/rooms/hooks/use-rooms"
import { cn, formatCurrency } from "@/lib/utils"
import type { RoomStatus } from "@/lib/types"

const REFUND_RATE = 0.05
const PENALTY_RATE = 0.02

const occupancyBreakdown: { status: RoomStatus; label: string }[] = [
  { status: "available", label: "Available" },
  { status: "occupied", label: "Occupied" },
  { status: "reserved", label: "Reserved" },
  { status: "needs_cleaning", label: "Needs cleaning" },
  { status: "maintenance", label: "Maintenance" },
]

type Period = "week" | "month" | "year" | "all"

const periodOptions: { value: Period; label: string }[] = [
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
  { value: "year", label: "This year" },
  { value: "all", label: "All time" },
]

function isWithinPeriod(dateIso: string, period: Period): boolean {
  if (period === "all") return true
  const date = new Date(dateIso)
  const now = new Date()
  if (period === "week") {
    const weekAgo = new Date(now)
    weekAgo.setDate(now.getDate() - 7)
    return date >= weekAgo
  }
  if (period === "month") {
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()
  }
  return date.getFullYear() === now.getFullYear()
}

export function ManagerDashboard() {
  const bookings = useLocalBookings()
  const rooms = useRooms()
  const { dashboardToken } = useParams<{ dashboardToken: string }>()
  const [period, setPeriod] = useState<Period>("all")

  const activeBookings = bookings
    .filter((b) => b.status !== "cancelled")
    .filter((b) => isWithinPeriod(b.bookedAt, period))
  const collected = activeBookings.reduce((sum, b) => sum + b.depositPaid, 0)
  const totalDue = activeBookings.reduce((sum, b) => sum + b.totalAmount, 0)
  const refunds = Math.round(collected * REFUND_RATE)
  const penalties = Math.round(collected * PENALTY_RATE)
  const netRevenue = collected - refunds + penalties

  const occupiedRooms = rooms.filter((r) => r.status === "occupied").length
  const occupancyRate = rooms.length > 0 ? (occupiedRooms / rooms.length) * 100 : 0
  const collectionRate = totalDue > 0 ? (collected / totalDue) * 100 : 0

  const recent = [...bookings]
    .sort((a, b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime())
    .slice(0, 5)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-heading text-base font-semibold text-foreground">Financial overview</h2>
        <Select value={period} onValueChange={(value) => setPeriod(value as Period)}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {periodOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Revenue collected" value={formatCurrency(collected)} icon={WalletIcon} />
        <StatCard label="Refunds" value={formatCurrency(refunds)} icon={ArrowUUpLeftIcon} tone="destructive" />
        <StatCard label="Penalties" value={formatCurrency(penalties)} icon={ReceiptXIcon} tone="purple" />
        <StatCard label="Net revenue" value={formatCurrency(netRevenue)} icon={ChartLineUpIcon} tone="success" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueTrendChart bookings={bookings} />
        </div>
        <div className="flex items-center justify-around rounded-xl border border-border bg-card p-5">
          <RadialMeter value={occupancyRate} label="Occupancy rate" color="var(--chart-2)" />
          <RadialMeter value={collectionRate} label="Collection rate" color="var(--primary)" />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-base font-semibold text-foreground">Occupancy overview</h2>
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <BuildingsIcon size={16} />
            {rooms.length} total rooms
          </span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {occupancyBreakdown.map(({ status, label }) => {
            const count = rooms.filter((r) => r.status === status).length
            return (
              <div key={status} className="rounded-lg border border-border p-3">
                <span
                  className={cn("mb-2 inline-block size-2 rounded-full")}
                  style={{ backgroundColor: roomStatusConfig[status].dotColor }}
                />
                <p className="font-heading text-xl font-bold text-foreground">{count}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            );
          })}
        </div>
      </div>

      <BookingStatusBars bookings={bookings} />

      <div className="flex flex-col gap-3">
        <BookingsTable bookings={recent} title="Recent bookings" />
        <Link
          href={`/admin/${dashboardToken}/bookings`}
          className="flex w-fit items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          View all bookings
          <ArrowRightIcon className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}
