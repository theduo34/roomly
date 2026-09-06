"use client"

import { useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { MagnifyingGlassIcon } from "@phosphor-icons/react/ssr"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { BookingsTable } from "@/features/protected/manager/components/bookings-table"
import { useDashboardRole } from "@/features/protected/dashboard/context/role-context"
import { useLocalBookings } from "@/features/protected/dashboard/hooks/use-local-bookings"
import type { Booking, BookingStatus } from "@/lib/types"

const statusFilters: { value: BookingStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "confirmed", label: "Confirmed" },
  { value: "checked_in", label: "Checked in" },
  { value: "checked_out", label: "Checked out" },
  { value: "cancelled", label: "Cancelled" },
]

export function BookingsView() {
  const { dashboardToken } = useParams<{ dashboardToken: string }>()
  const role = useDashboardRole()
  const bookings = useLocalBookings()
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<BookingStatus | "all">("all")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return bookings
      .filter((b) => status === "all" || b.status === status)
      .filter((b) => !q || `${b.guestName} ${b.roomName} ${b.qrCode}`.toLowerCase().includes(q))
      .sort((a, b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime())
  }, [bookings, query, status])

  function getHref(booking: Booking) {
    return `/admin/${dashboardToken}/arrivals/${booking.id}`
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by guest, room, or booking code"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={(value) => setStatus(value as BookingStatus | "all")}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusFilters.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <BookingsTable
        bookings={filtered}
        paginate
        getHref={role === "receptionist" ? getHref : undefined}
      />
    </div>
  );
}
