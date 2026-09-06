"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react/ssr"
import { cn, formatCurrency, formatDate } from "@/lib/utils"
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

export function BookingsTable({
  bookings,
  title = "Bookings",
  getHref,
  paginate = false,
}: {
  bookings: Booking[]
  title?: string
  /** When provided, each row navigates to this href — used to open the booking detail page. */
  getHref?: (booking: Booking) => string
  paginate?: boolean
}) {
  const router = useRouter()
  const [page, setPage] = useState(0)

  const pageSize = paginate ? PAGE_SIZE : bookings.length
  const totalPages = paginate ? Math.max(1, Math.ceil(bookings.length / pageSize)) : 1
  const currentPage = Math.min(page, totalPages - 1)
  const pageBookings = paginate
    ? bookings.slice(currentPage * pageSize, currentPage * pageSize + pageSize)
    : bookings

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h2 className="font-heading text-base font-semibold text-foreground">{title}</h2>
      {bookings.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          No bookings yet in this session. Bookings made on the guest site will appear here.
        </p>
      ) : (
        <>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground uppercase">
                  <th className="pb-2 font-medium">Guest</th>
                  <th className="pb-2 font-medium">Room</th>
                  <th className="pb-2 font-medium">Dates</th>
                  <th className="pb-2 font-medium">Deposit</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {pageBookings.map((booking) => {
                  const href = getHref?.(booking)
                  return (
                    <tr
                      key={booking.id}
                      role={href ? "link" : undefined}
                      tabIndex={href ? 0 : undefined}
                      onClick={href ? () => router.push(href) : undefined}
                      onKeyDown={
                        href
                          ? (e) => {
                              if (e.key === "Enter") router.push(href)
                            }
                          : undefined
                      }
                      className={cn(
                        "border-b border-border last:border-0",
                        href && "cursor-pointer transition-colors hover:bg-muted"
                      )}
                    >
                      <td className="py-3 pr-4 font-medium text-foreground">{booking.guestName}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{booking.roomName}</td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {formatDate(booking.checkIn)} – {formatDate(booking.checkOut)}
                      </td>
                      <td className="py-3 pr-4 text-foreground">{formatCurrency(booking.depositPaid)}</td>
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
                  );
                })}
              </tbody>
            </table>
          </div>

          {paginate && totalPages > 1 && (
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
