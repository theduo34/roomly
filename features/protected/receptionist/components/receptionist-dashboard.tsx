"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  BedIcon,
  BroomIcon,
  CalendarCheckIcon,
  DoorOpenIcon,
  DotsThreeIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  SortAscendingIcon,
} from "@phosphor-icons/react/ssr"
import { Input } from "@/components/ui/input"
import { StatCard } from "@/features/protected/dashboard/components/stat-card"
import { DonutChart } from "@/features/protected/dashboard/components/donut-chart"
import { OccupancyTrendChart } from "@/features/protected/receptionist/components/occupancy-trend-chart"
import { UpcomingCalendarCard } from "@/features/protected/receptionist/components/upcoming-calendar-card"
import { roomStatusConfig } from "@/components/shared/status-badge"
import { useLocalBookings } from "@/features/protected/dashboard/hooks/use-local-bookings"
import { useRooms } from "@/features/protected/rooms/hooks/use-rooms"
import { cn, formatDate } from "@/lib/utils"
import type { RoomStatus } from "@/lib/types"

const dateFilters = ["Today", "This week", "This month"]

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export function ReceptionistDashboard() {
  const { dashboardToken } = useParams<{ dashboardToken: string }>()
  const bookings = useLocalBookings()
  const rooms = useRooms()
  const today = todayIso()
  const [activeFilter, setActiveFilter] = useState(dateFilters[0])
  const arrivalsToday = bookings.filter((b) => b.checkIn === today && b.status === "confirmed")

  const occupied = rooms.filter((r) => r.status === "occupied").length
  const available = rooms.filter((r) => r.status === "available").length
  const needsCleaning = rooms.filter((r) => r.status === "needs_cleaning").length

  const roomSegments = (Object.keys(roomStatusConfig) as RoomStatus[]).map((status) => ({
    id: status,
    label: roomStatusConfig[status].label,
    value: rooms.filter((r) => r.status === status).length,
    color: roomStatusConfig[status].dotColor,
  }))

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
        <Link
          href={`/admin/${dashboardToken}/arrivals`}
          className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80"
        >
          <PlusIcon size={16} />
          New reservation
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Arrivals today" value={String(arrivalsToday.length)} icon={CalendarCheckIcon} tone="primary" />
        <StatCard label="Occupied rooms" value={String(occupied)} icon={DoorOpenIcon} tone="destructive" />
        <StatCard label="Available rooms" value={String(available)} icon={BedIcon} tone="success" />
        <StatCard label="Needs cleaning" value={String(needsCleaning)} icon={BroomIcon} tone="purple" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <OccupancyTrendChart />
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-heading text-base font-semibold text-foreground">Room distribution</h2>
          <div className="mt-4">
            <DonutChart segments={roomSegments} centerLabel="rooms" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-heading text-base font-semibold text-foreground">Today&apos;s reservations</h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search…" className="h-8 w-36 pl-8 text-sm" />
              </div>
              <button
                type="button"
                className="flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted"
              >
                <FunnelIcon size={16} />
              </button>
              <button
                type="button"
                className="flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted"
              >
                <SortAscendingIcon size={16} />
              </button>
              <button
                type="button"
                className="flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted"
              >
                <DotsThreeIcon size={16} />
              </button>
            </div>
          </div>
          {arrivalsToday.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No arrivals booked for today yet.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground uppercase">
                    <th className="pb-2 font-medium">Guest</th>
                    <th className="pb-2 font-medium">Room</th>
                    <th className="pb-2 font-medium">Check-in</th>
                    <th className="pb-2 font-medium">Check-out</th>
                  </tr>
                </thead>
                <tbody>
                  {arrivalsToday.map((booking) => (
                    <tr key={booking.id} className="border-b border-border last:border-0">
                      <td className="py-3 pr-4 font-medium text-foreground">{booking.guestName}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{booking.roomName}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{formatDate(booking.checkIn)}</td>
                      <td className="py-3 text-muted-foreground">{formatDate(booking.checkOut)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Link
            href={`/admin/${dashboardToken}/arrivals`}
            className="mt-4 flex w-fit items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            View arrivals
          </Link>
        </div>

        <UpcomingCalendarCard />
      </div>
    </div>
  );
}
