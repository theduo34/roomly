"use client"

import { toast } from "sonner"
import { DoorOpenIcon } from "@phosphor-icons/react/ssr"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useStaffName } from "@/features/auth/hooks/use-role"
import { appendAuditLog } from "@/lib/audit-log-store"
import { updateBooking } from "@/lib/bookings-store"
import { setRoomStatus } from "@/lib/room-status-store"
import { formatCurrency } from "@/lib/utils"
import type { Booking } from "@/lib/types"

export function CheckoutDialog({
  booking,
  onOpenChange,
}: {
  booking: Booking | null
  onOpenChange: (open: boolean) => void
}) {
  const staffName = useStaffName()

  function confirmCheckout() {
    if (!booking) return
    updateBooking(booking.id, { status: "checked_out", checkedOutAt: new Date().toISOString() })
    setRoomStatus(booking.roomId, "needs_cleaning")
    appendAuditLog({
      action: `Checked out guest — ${booking.roomName}`,
      performedBy: staffName || "Receptionist",
      role: "receptionist",
    })
    toast.success(`${booking.guestName} checked out — ${booking.roomName} needs cleaning.`)
    onOpenChange(false)
  }

  return (
    <Dialog open={booking !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Check out {booking?.guestName}</DialogTitle>
          <DialogDescription>{booking?.roomName} — payment was already settled at check-in.</DialogDescription>
        </DialogHeader>
        {booking && (
          <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total for stay</span>
              <span className="text-foreground">{formatCurrency(booking.totalAmount)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-muted-foreground">Paid in full</span>
              <span className="text-foreground">{formatCurrency(booking.depositPaid)}</span>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={confirmCheckout}>
            <DoorOpenIcon />
            Confirm check out
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
