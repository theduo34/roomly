"use client"

import { useState } from "react"
import { toast } from "sonner"
import { KeyIcon } from "@phosphor-icons/react/ssr"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useStaffName } from "@/features/auth/hooks/use-role"
import { appendAuditLog } from "@/lib/audit-log-store"
import { updateBooking } from "@/lib/bookings-store"
import { setRoomStatus } from "@/lib/room-status-store"
import { formatCurrency } from "@/lib/utils"
import type { Booking } from "@/lib/types"

export function CheckInDialog({
  booking,
  onOpenChange,
}: {
  booking: Booking | null
  onOpenChange: (open: boolean) => void
}) {
  const staffName = useStaffName()
  const [paymentConfirmed, setPaymentConfirmed] = useState(false)
  const balance = booking ? Math.max(0, booking.totalAmount - booking.depositPaid) : 0
  const canCheckIn = balance <= 0 || paymentConfirmed

  function handleOpenChange(open: boolean) {
    if (!open) setPaymentConfirmed(false)
    onOpenChange(open)
  }

  function confirmCheckIn() {
    if (!booking || !canCheckIn) return
    updateBooking(booking.id, {
      status: "checked_in",
      depositPaid: booking.totalAmount,
      checkedInAt: new Date().toISOString(),
    })
    setRoomStatus(booking.roomId, "occupied")
    appendAuditLog({
      action: `Checked in guest — ${booking.roomName}`,
      performedBy: staffName || "Receptionist",
      role: "receptionist",
    })
    toast.success(`${booking.guestName} checked in — ${booking.roomName} is now occupied.`)
    handleOpenChange(false)
  }

  return (
    <Dialog open={booking !== null} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Check in {booking?.guestName}</DialogTitle>
          <DialogDescription>
            {booking?.roomName} — full payment is required before the keys are handed over.
          </DialogDescription>
        </DialogHeader>
        {booking && (
          <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total for stay</span>
              <span className="text-foreground">{formatCurrency(booking.totalAmount)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-muted-foreground">Already paid</span>
              <span className="text-foreground">{formatCurrency(booking.depositPaid)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
              <span className="font-semibold text-foreground">Balance due now</span>
              <span className="font-semibold text-foreground">{formatCurrency(balance)}</span>
            </div>
          </div>
        )}
        {balance > 0 && (
          <label className="flex items-start gap-2.5 text-sm text-foreground">
            <Checkbox
              checked={paymentConfirmed}
              onCheckedChange={(checked) => setPaymentConfirmed(checked === true)}
              className="mt-0.5"
            />
            I confirm the guest has paid the balance in full.
          </label>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={confirmCheckIn} disabled={!canCheckIn}>
            <KeyIcon />
            {balance > 0 ? "Settle balance & check in" : "Confirm check in"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
