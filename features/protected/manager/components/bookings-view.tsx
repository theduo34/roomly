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
import { useLocalBookings } from "@/features/protected/dashboard/hooks/use-local-bookings"
import { useRooms } from "@/features/protected/rooms/hooks/use-rooms"
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
  const bookings = useLocalBookings()
  const rooms = useRooms()
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<BookingStatus | "all">("all")
  const [roomId, setRoomId] = useState<string>("all")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return bookings
      .filter((b) => status === "all" || b.status === status)
      .filter((b) => roomId === "all" || b.roomId === roomId)
      .filter((b) => !from || b.checkIn >= from)
      .filter((b) => !to || b.checkIn <= to)
      .filter((b) => !q || `${b.guestName} ${b.roomName} ${b.qrCode}`.toLowerCase().includes(q))
      .sort((a, b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime())
  }, [bookings, query, status, roomId, from, to])

  function getHref(booking: Booking) {
    return `/admin/${dashboardToken}/arrivals/${booking.id}`
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
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
        <Select value={roomId} onValueChange={setRoomId}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All rooms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All rooms</SelectItem>
            {rooms.map((room) => (
              <SelectItem key={room.id} value={room.id}>
                {room.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-36" aria-label="Check-in from" />
          <span className="text-sm text-muted-foreground">to</span>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-36" aria-label="Check-in to" />
        </div>
      </div>

      <BookingsTable bookings={filtered} paginate getHref={getHref} />
    </div>
  );
}
