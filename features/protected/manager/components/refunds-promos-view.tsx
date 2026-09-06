"use client"

import { toast } from "sonner"
import { TagIcon } from "@phosphor-icons/react/ssr"
import { CreatePromoDialog } from "@/features/protected/manager/components/create-promo-dialog"
import { useLocalBookings } from "@/features/protected/dashboard/hooks/use-local-bookings"
import { usePromoCodes } from "@/features/protected/dashboard/hooks/use-promo-codes"
import { useStaffName } from "@/features/auth/hooks/use-role"
import { useDashboardRole } from "@/features/protected/dashboard/context/role-context"
import { appendAuditLog } from "@/lib/audit-log-store"
import { updateBooking } from "@/lib/bookings-store"
import { setPromoCodeActive } from "@/lib/promo-store"
import { cn, formatCurrency, formatDate } from "@/lib/utils"
import type { RefundStatus } from "@/lib/types"

const REFUND_RATE = 0.95
const PENALTY_RATE = 0.02

const refundStatusStyles: Record<RefundStatus, string> = {
  pending: "bg-primary/10 text-primary",
  approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  denied: "bg-destructive/10 text-destructive",
}

const refundStatusLabels: Record<RefundStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  denied: "Denied",
}

export function RefundsPromosView() {
  const bookings = useLocalBookings()
  const promoCodes = usePromoCodes()
  const staffName = useStaffName()
  const role = useDashboardRole()

  const cancelledBookings = [...bookings]
    .filter((b) => b.status === "cancelled")
    .sort((a, b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime())

  function decide(bookingId: string, guestName: string, status: RefundStatus) {
    updateBooking(bookingId, { refundStatus: status })
    appendAuditLog({
      action: `${status === "approved" ? "Approved" : "Denied"} refund for cancelled booking — ${guestName}`,
      performedBy: staffName || "Manager",
      role,
    })
    toast.success(`Refund ${status} for ${guestName}.`)
  }

  function togglePromo(id: string, code: string, active: boolean) {
    setPromoCodeActive(id, active)
    appendAuditLog({
      action: `${active ? "Activated" : "Deactivated"} promo code ${code}`,
      performedBy: staffName || "Manager",
      role,
    })
    toast.success(`${code} is now ${active ? "active" : "inactive"}.`)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="font-heading text-base font-semibold text-foreground">Refund & penalty review</h2>
        {cancelledBookings.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No cancelled bookings to review.</p>
        ) : (
          <ul className="mt-4 flex flex-col divide-y divide-border">
            {cancelledBookings.map((booking) => {
              const refundStatus = booking.refundStatus ?? "pending"
              const refund = Math.round(booking.depositPaid * REFUND_RATE)
              const penalty = Math.round(booking.depositPaid * PENALTY_RATE)
              return (
                <li key={booking.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{booking.guestName}</p>
                    <p className="text-xs text-muted-foreground">
                      {booking.roomName} · Cancelled {formatDate(booking.bookedAt)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Refund {formatCurrency(refund)} · Penalty {formatCurrency(penalty)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className={cn("rounded-full px-3 py-1 text-xs font-medium", refundStatusStyles[refundStatus])}>
                      {refundStatusLabels[refundStatus]}
                    </span>
                    {refundStatus === "pending" && (
                      <>
                        <button
                          type="button"
                          onClick={() => decide(booking.id, booking.guestName, "approved")}
                          className="rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/80"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => decide(booking.id, booking.guestName, "denied")}
                          className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
                        >
                          Deny
                        </button>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-heading text-base font-semibold text-foreground">Promo codes</h2>
          <CreatePromoDialog />
        </div>
        {promoCodes.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No promo codes yet.</p>
        ) : (
          <ul className="mt-4 flex flex-col divide-y divide-border">
            {promoCodes.map((promo) => (
              <li key={promo.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <TagIcon size={16} />
                  </span>
                  <div>
                    <p className="font-mono text-sm font-semibold tracking-wide text-foreground">{promo.code}</p>
                    <p className="text-xs text-muted-foreground">
                      {promo.discountPercent}% off · Created {formatDate(promo.createdAt)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => togglePromo(promo.id, promo.code, !promo.active)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium",
                    promo.active
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {promo.active ? "Active" : "Inactive"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
