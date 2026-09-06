import type { Booking, BookingStatus } from "@/lib/types"

const statusOrder: { status: BookingStatus; label: string; barColor: string }[] = [
  { status: "confirmed", label: "Confirmed", barColor: "var(--primary)" },
  { status: "checked_in", label: "Checked in", barColor: "#16a34a" },
  { status: "checked_out", label: "Checked out", barColor: "var(--muted-foreground)" },
  { status: "cancelled", label: "Cancelled", barColor: "var(--destructive)" },
]

export function BookingStatusBars({ bookings }: { bookings: Booking[] }) {
  const total = Math.max(1, bookings.length)

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h2 className="font-heading text-base font-semibold text-foreground">Bookings by status</h2>
      <div className="mt-4 flex flex-col gap-3">
        {statusOrder.map(({ status, label, barColor }) => {
          const count = bookings.filter((b) => b.status === status).length
          const percent = (count / total) * 100
          return (
            <div key={status} className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium text-foreground">{count}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-[width]"
                  style={{ width: `${percent}%`, backgroundColor: barColor }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
