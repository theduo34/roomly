"use client"

import { useState } from "react"
import { toast } from "sonner"
import { CarIcon, PencilSimpleIcon } from "@phosphor-icons/react/ssr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useStaffName } from "@/features/auth/hooks/use-role"
import { appendAuditLog } from "@/lib/audit-log-store"
import { updateBooking } from "@/lib/bookings-store"
import { formatDate } from "@/lib/utils"
import type { Booking } from "@/lib/types"

function VehiclePlateField({ booking }: { booking: Booking }) {
  const staffName = useStaffName()
  const [open, setOpen] = useState(false)
  const [plate, setPlate] = useState(booking.vehiclePlate ?? "")

  function save() {
    const value = plate.trim().toUpperCase()
    if (!value) return
    updateBooking(booking.id, { vehiclePlate: value })
    appendAuditLog({
      action: `Recorded vehicle plate ${value} — ${booking.guestName}`,
      performedBy: staffName || "Receptionist",
      role: "receptionist",
    })
    toast.success(`Vehicle plate saved for ${booking.guestName}.`)
    setOpen(false)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <CarIcon size={14} />
        {booking.vehiclePlate ?? "Add vehicle plate"}
        <PencilSimpleIcon size={12} />
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vehicle plate</DialogTitle>
            <DialogDescription>
              Recorded at the gate for {booking.guestName} — correct it here if needed.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={plate}
            onChange={(e) => setPlate(e.target.value)}
            placeholder="GT 1234-24"
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function ArrivalsList({
  arrivals,
  title,
  emptyMessage,
  actionLabel,
  onAction,
  showVehiclePlate = false,
}: {
  arrivals: Booking[]
  title: string
  emptyMessage: string
  actionLabel?: string
  onAction?: (booking: Booking) => void
  showVehiclePlate?: boolean
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h2 className="font-heading text-base font-semibold text-foreground">{title}</h2>
      {arrivals.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {arrivals.map((booking) => (
            <li
              key={booking.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{booking.guestName}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {booking.roomName} · {formatDate(booking.checkIn)} – {formatDate(booking.checkOut)}
                </p>
                {showVehiclePlate && (
                  <div className="mt-1">
                    <VehiclePlateField booking={booking} />
                  </div>
                )}
              </div>
              {onAction && actionLabel && (
                <button
                  type="button"
                  onClick={() => onAction(booking)}
                  className="shrink-0 rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/80"
                >
                  {actionLabel}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
