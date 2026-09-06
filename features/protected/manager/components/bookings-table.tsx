import { cn, formatCurrency, formatDate } from "@/lib/utils"
import type { Booking, BookingStatus } from "@/lib/types"

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
}: {
  bookings: Booking[]
  title?: string
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h2 className="font-heading text-base font-semibold text-foreground">{title}</h2>
      {bookings.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          No bookings yet in this session. Bookings made on the guest site will appear here.
        </p>
      ) : (
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
              {bookings.map((booking) => (
                <tr key={booking.id} className="border-b border-border last:border-0">
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
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
