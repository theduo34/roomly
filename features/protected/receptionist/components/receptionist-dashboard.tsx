"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  CaretLeftIcon,
  CaretRightIcon,
  MagnifyingGlassIcon,
  SortAscendingIcon,
  SortDescendingIcon,
} from "@phosphor-icons/react/ssr"
import { Input } from "@/components/ui/input"
import { StatCard } from "@/features/protected/dashboard/components/stat-card"
import { NewReservationDialog } from "@/features/protected/receptionist/components/new-reservation-dialog"
import { OccupancyTrendChart } from "@/features/protected/receptionist/components/occupancy-trend-chart"
import { RoomDistributionCard } from "@/features/protected/receptionist/components/room-distribution-card"
import { UpcomingCalendarCard } from "@/features/protected/receptionist/components/upcoming-calendar-card"
import { roomStatusConfig } from "@/components/shared/status-badge"
import { useLocalBookings } from "@/features/protected/dashboard/hooks/use-local-bookings"
import { useRooms } from "@/features/protected/rooms/hooks/use-rooms"
import { cn, formatDate } from "@/lib/utils"
import type { RoomStatus } from "@/lib/types"

const dateFilters = ["Today", "This week", "This month"]
const RESERVATIONS_PAGE_SIZE = 5

const comparedToLabel: Record<string, string> = {
  Today: "today",
  "This week": "this week",
  "This month": "this month",
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export function ReceptionistDashboard() {
  const { dashboardToken } = useParams<{ dashboardToken: string }>()
  const router = useRouter()
  const bookings = useLocalBookings()
  const rooms = useRooms()
  const today = todayIso()
  const [activeFilter, setActiveFilter] = useState(dateFilters[0])
  const [reservationQuery, setReservationQuery] = useState("")
  const [sortDescending, setSortDescending] = useState(false)
  const [reservationsPage, setReservationsPage] = useState(0)
  const arrivalsToday = bookings.filter((b) => b.checkIn === today && b.status === "confirmed")

  const visibleReservations = useMemo(() => {
    const q = reservationQuery.trim().toLowerCase()
    const filtered = arrivalsToday.filter(
      (b) => !q || `${b.guestName} ${b.roomName}`.toLowerCase().includes(q)
    )
    return [...filtered].sort((a, b) => {
      const diff = a.checkOut.localeCompare(b.checkOut)
      return sortDescending ? -diff : diff
    })
  }, [arrivalsToday, reservationQuery, sortDescending])

  const reservationsTotalPages = Math.max(1, Math.ceil(visibleReservations.length / RESERVATIONS_PAGE_SIZE))
  const reservationsCurrentPage = Math.min(reservationsPage, reservationsTotalPages - 1)
  const pageReservations = visibleReservations.slice(
    reservationsCurrentPage * RESERVATIONS_PAGE_SIZE,
    reservationsCurrentPage * RESERVATIONS_PAGE_SIZE + RESERVATIONS_PAGE_SIZE
  )

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
        <NewReservationDialog />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Arrivals today"
          value={String(arrivalsToday.length)}
          tone="primary"
          trend={{ direction: "up", value: "+12.0%", comparedTo: comparedToLabel[activeFilter] }}
        />
        <StatCard
          label="Occupied rooms"
          value={String(occupied)}
          tone="destructive"
          trend={{ direction: "down", value: "-5.2%", comparedTo: comparedToLabel[activeFilter] }}
        />
        <StatCard
          label="Available rooms"
          value={String(available)}
          tone="success"
          trend={{ direction: "up", value: "+8.7%", comparedTo: comparedToLabel[activeFilter] }}
        />
        <StatCard
          label="Needs cleaning"
          value={String(needsCleaning)}
          tone="purple"
          trend={{ direction: "up", value: "+3.9%", comparedTo: comparedToLabel[activeFilter] }}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="h-full lg:col-span-2">
          <OccupancyTrendChart activeFilter={activeFilter} />
        </div>
        <RoomDistributionCard segments={roomSegments} centerLabel="rooms" activeFilter={activeFilter} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-heading text-base font-semibold text-foreground">Today&apos;s reservations</h2>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:flex-none">
                <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search guest or room…"
                  value={reservationQuery}
                  onChange={(e) => {
                    setReservationQuery(e.target.value)
                    setReservationsPage(0)
                  }}
                  className="h-8 w-full pl-8 text-sm sm:w-56"
                />
              </div>
              <button
                type="button"
                onClick={() => setSortDescending((v) => !v)}
                title="Sort by check-out date"
                className="flex h-8 items-center gap-1.5 rounded-lg border border-border px-2 text-muted-foreground hover:bg-muted sm:px-3"
              >
                {sortDescending ? <SortDescendingIcon size={16} /> : <SortAscendingIcon size={16} />}
                <span className="hidden text-xs font-medium sm:inline">Sort</span>
              </button>
            </div>
          </div>
          {arrivalsToday.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No arrivals booked for today yet.</p>
          ) : pageReservations.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No reservations match your search.</p>
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
                  {pageReservations.map((booking) => (
                    <tr
                      key={booking.id}
                      role="link"
                      tabIndex={0}
                      onClick={() => router.push(`/admin/${dashboardToken}/arrivals/${booking.id}`)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") router.push(`/admin/${dashboardToken}/arrivals/${booking.id}`)
                      }}
                      className="cursor-pointer border-b border-border transition-colors last:border-0 hover:bg-muted"
                    >
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
          {reservationsTotalPages > 1 && (
            <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
              <span className="text-xs text-muted-foreground">
                Page {reservationsCurrentPage + 1} of {reservationsTotalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setReservationsPage((p) => Math.max(0, p - 1))}
                  disabled={reservationsCurrentPage === 0}
                  className="flex size-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <CaretLeftIcon size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setReservationsPage((p) => Math.min(reservationsTotalPages - 1, p + 1))}
                  disabled={reservationsCurrentPage >= reservationsTotalPages - 1}
                  className="flex size-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                  aria-label="Next page"
                >
                  <CaretRightIcon size={14} />
                </button>
              </div>
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
