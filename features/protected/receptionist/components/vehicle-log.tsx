"use client"

import { useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { CarIcon, CaretLeftIcon, CaretRightIcon, MagnifyingGlassIcon } from "@phosphor-icons/react/ssr"
import { Input } from "@/components/ui/input"
import { useDashboardRole } from "@/features/protected/dashboard/context/role-context"
import { useLocalBookings } from "@/features/protected/dashboard/hooks/use-local-bookings"
import { cn, formatDateTime } from "@/lib/utils"
import type { Booking, BookingStatus } from "@/lib/types"

const PAGE_SIZE = 8

const statusStyles: Record<BookingStatus, string> = {
  confirmed: "bg-primary/10 text-primary",
  checked_in: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  checked_out: "bg-muted text-muted-foreground",
  cancelled: "bg-destructive/10 text-destructive",
}

const statusLabels: Record<BookingStatus, string> = {
  confirmed: "Confirmed",
  checked_in: "Checked in",
  checked_out: "Checked out",
  cancelled: "Cancelled",
}

export function VehicleLog() {
  const { dashboardToken } = useParams<{ dashboardToken: string }>()
  const router = useRouter()
  const role = useDashboardRole()
  const canOpenBooking = role === "receptionist"
  const bookings = useLocalBookings()
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(0)

  const entries = useMemo(() => {
    const q = query.trim().toLowerCase()
    return bookings
      .filter((b): b is Booking & { vehiclePlate: string } => Boolean(b.vehiclePlate))
      .filter((b) => !q || `${b.vehiclePlate} ${b.guestName} ${b.qrCode}`.toLowerCase().includes(q))
      .sort((a, b) => (b.checkedInAt ?? b.bookedAt).localeCompare(a.checkedInAt ?? a.bookedAt))
  }, [bookings, query])

  const totalPages = Math.max(1, Math.ceil(entries.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages - 1)
  const pageEntries = entries.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE)

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-base font-semibold text-foreground">Vehicle log</h2>
        <span className="text-xs text-muted-foreground">{entries.length} vehicles</span>
      </div>

      <div className="relative mt-4 max-w-sm">
        <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by plate, guest, or booking code…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setPage(0)
          }}
          className="pl-9"
        />
      </div>

      {pageEntries.length === 0 ? (
        <div className="mt-4 flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-12 text-center">
          <span className="flex size-10 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <CarIcon size={18} />
          </span>
          <p className="text-sm font-medium text-foreground">No vehicles recorded</p>
          <p className="max-w-xs text-xs text-muted-foreground">
            Plates recorded on a guest&apos;s booking will show up here.
          </p>
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground uppercase">
                <th className="pb-2 font-medium">Plate</th>
                <th className="pb-2 font-medium">Guest</th>
                <th className="pb-2 font-medium">Room</th>
                <th className="pb-2 font-medium">Booking ref</th>
                <th className="pb-2 font-medium">Entry time</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {pageEntries.map((booking) => (
                <tr
                  key={booking.id}
                  role={canOpenBooking ? "link" : undefined}
                  tabIndex={canOpenBooking ? 0 : undefined}
                  onClick={
                    canOpenBooking
                      ? () => router.push(`/admin/${dashboardToken}/arrivals/${booking.id}`)
                      : undefined
                  }
                  onKeyDown={
                    canOpenBooking
                      ? (e) => {
                          if (e.key === "Enter") router.push(`/admin/${dashboardToken}/arrivals/${booking.id}`)
                        }
                      : undefined
                  }
                  className={cn(
                    "border-b border-border last:border-0",
                    canOpenBooking && "cursor-pointer transition-colors hover:bg-muted"
                  )}
                >
                  <td className="py-3 pr-4 font-mono font-medium text-foreground">{booking.vehiclePlate}</td>
                  <td className="py-3 pr-4 text-foreground">{booking.guestName}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{booking.roomName}</td>
                  <td className="py-3 pr-4 font-mono text-xs text-muted-foreground uppercase">{booking.qrCode}</td>
                  <td className="py-3 pr-4 text-muted-foreground">
                    {booking.checkedInAt ? formatDateTime(booking.checkedInAt) : "Not yet arrived"}
                  </td>
                  <td className="py-3">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
                        statusStyles[booking.status]
                      )}
                    >
                      {statusLabels[booking.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
          <span className="text-xs text-muted-foreground">
            Page {currentPage + 1} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="flex size-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
              aria-label="Previous page"
            >
              <CaretLeftIcon size={14} />
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage >= totalPages - 1}
              className="flex size-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
              aria-label="Next page"
            >
              <CaretRightIcon size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
