"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowRightIcon, BuildingsIcon, CalendarCheckIcon, ChartLineUpIcon, WalletIcon } from "@phosphor-icons/react/ssr"
import { StatCard } from "@/features/protected/dashboard/components/stat-card"
import { RadialMeter } from "@/features/protected/dashboard/components/radial-meter"
import { RevenueTrendChart } from "@/features/protected/manager/components/revenue-trend-chart"
import { BookingStatusBars } from "@/features/protected/manager/components/booking-status-bars"
import { BookingsTable } from "@/features/protected/manager/components/bookings-table"
import { useLocalBookings } from "@/features/protected/dashboard/hooks/use-local-bookings"
import { useRooms } from "@/features/protected/rooms/hooks/use-rooms"
import { formatCurrency } from "@/lib/utils"

const REFUND_RATE = 0.05
const PENALTY_RATE = 0.05

export function ManagerDashboard() {
  const bookings = useLocalBookings()
  const rooms = useRooms()
  const { dashboardToken } = useParams<{ dashboardToken: string }>()

  const activeBookings = bookings.filter((b) => b.status !== "cancelled")
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Revenue collected" value={formatCurrency(collected)} icon={WalletIcon} />
        <StatCard label="Net revenue" value={formatCurrency(netRevenue)} icon={ChartLineUpIcon} />
        <StatCard label="Total bookings" value={String(bookings.length)} icon={CalendarCheckIcon} />
        <StatCard label="Total rooms" value={String(rooms.length)} icon={BuildingsIcon} />
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
