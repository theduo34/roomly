"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CaretLeftIcon, CaretRightIcon, CarIcon } from "@phosphor-icons/react/ssr"
import { cn, formatDate } from "@/lib/utils"
import type { Booking, BookingStatus } from "@/lib/types"

const PAGE_SIZE = 5

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

export function ArrivalsList({
  arrivals,
  title,
  emptyMessage,
  dashboardToken,
}: {
  arrivals: Booking[]
  title: string
  emptyMessage: string
  dashboardToken: string
}) {
  const router = useRouter()
  const [page, setPage] = useState(0)

  const totalPages = Math.max(1, Math.ceil(arrivals.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages - 1)
  const pageItems = arrivals.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE)

  function goToBooking(bookingId: string) {
    router.push(`/admin/${dashboardToken}/arrivals/${bookingId}`)
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-base font-semibold text-foreground">{title}</h2>
        <span className="text-xs text-muted-foreground">{arrivals.length}</span>
      </div>
      {arrivals.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <>
          {/* Cards on mobile — a 6-column table doesn't fit a narrow screen without cramped horizontal scrolling */}
          <ul className="mt-4 flex flex-col gap-2 sm:hidden">
            {pageItems.map((booking) => (
              <li key={booking.id}>
                <button
                  type="button"
                  onClick={() => goToBooking(booking.id)}
                  className="flex w-full items-center justify-between gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:bg-muted"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-foreground">{booking.guestName}</p>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
                          statusStyles[booking.status]
                        )}
                      >
                        {statusLabels[booking.status]}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-xs text-muted-foreground">{booking.roomName}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {formatDate(booking.checkIn)} – {formatDate(booking.checkOut)}
                    </p>
                    {booking.vehiclePlate && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <CarIcon size={12} />
                        {booking.vehiclePlate}
                      </p>
                    )}
                  </div>
                  <CaretRightIcon size={16} className="shrink-0 text-muted-foreground" />
                </button>
              </li>
            ))}
          </ul>

          {/* Table from sm: up */}
          <div className="mt-4 hidden overflow-x-auto sm:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground uppercase">
                  <th className="pb-2 font-medium">Guest</th>
                  <th className="pb-2 font-medium">Room</th>
                  <th className="pb-2 font-medium">Check-in</th>
                  <th className="pb-2 font-medium">Check-out</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium" aria-hidden="true" />
                </tr>
              </thead>
              <tbody>
                {pageItems.map((booking) => (
                  <tr
                    key={booking.id}
                    role="link"
                    tabIndex={0}
                    onClick={() => goToBooking(booking.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") goToBooking(booking.id)
                    }}
                    className="cursor-pointer border-b border-border transition-colors last:border-0 hover:bg-muted"
                  >
                    <td className="py-3 pr-4">
                      <p className="font-medium text-foreground">{booking.guestName}</p>
                      {booking.vehiclePlate && (
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                          <CarIcon size={12} />
                          {booking.vehiclePlate}
                        </p>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">{booking.roomName}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{formatDate(booking.checkIn)}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{formatDate(booking.checkOut)}</td>
                    <td className="py-3 pr-4">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
                          statusStyles[booking.status]
                        )}
                      >
                        {statusLabels[booking.status]}
                      </span>
                    </td>
                    <td className="py-3 pl-2 text-right">
                      <CaretRightIcon size={16} className="inline-block text-muted-foreground" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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
        </>
      )}
    </div>
  );
}
