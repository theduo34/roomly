"use client"

import { toast } from "sonner"
import { ReceiptIcon } from "@phosphor-icons/react/ssr"
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
  const balance = booking ? Math.max(0, booking.totalAmount - booking.depositPaid) : 0

  function confirmCheckout() {
    if (!booking) return
    updateBooking(booking.id, { status: "checked_out", depositPaid: booking.totalAmount })
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
          <DialogDescription>{booking?.roomName} — settle any balance before releasing the room.</DialogDescription>
        </DialogHeader>
        {booking && (
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total for stay</span>
              <span className="text-foreground">{formatCurrency(booking.totalAmount)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Already paid</span>
              <span className="text-foreground">{formatCurrency(booking.depositPaid)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-2 font-medium">
              <span className="text-foreground">Balance due now</span>
              <span className="text-primary">{formatCurrency(balance)}</span>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={confirmCheckout}>
            <ReceiptIcon />
            {balance > 0 ? "Settle balance & check out" : "Confirm check out"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
