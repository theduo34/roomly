"use client"

import { useState } from "react"
import { toast } from "sonner"
import { ArrivalsList } from "@/features/protected/receptionist/components/arrivals-list"
import { CheckoutDialog } from "@/features/protected/receptionist/components/checkout-dialog"
import { WalkInBookingDialog } from "@/features/protected/receptionist/components/walk-in-booking-dialog"
import { useLocalBookings } from "@/features/protected/dashboard/hooks/use-local-bookings"
import { useStaffName } from "@/features/auth/hooks/use-role"
import { appendAuditLog } from "@/lib/audit-log-store"
import { updateBooking } from "@/lib/bookings-store"
import { setRoomStatus } from "@/lib/room-status-store"
import type { Booking } from "@/lib/types"

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export function ArrivalsView() {
  const bookings = useLocalBookings()
  const staffName = useStaffName()
  const today = todayIso()
  const [checkoutTarget, setCheckoutTarget] = useState<Booking | null>(null)

  const todayArrivals = bookings.filter((b) => b.checkIn === today && b.status === "confirmed")
  const upcoming = bookings
    .filter((b) => b.checkIn > today && b.status === "confirmed")
    .sort((a, b) => a.checkIn.localeCompare(b.checkIn))
  const inHouse = bookings.filter((b) => b.status === "checked_in")

  function handleCheckIn(booking: Booking) {
    updateBooking(booking.id, { status: "checked_in" })
    setRoomStatus(booking.roomId, "occupied")
    appendAuditLog({
      action: `Checked in guest — ${booking.roomName}`,
      performedBy: staffName || "Receptionist",
      role: "receptionist",
    })
    toast.success(`${booking.guestName} checked in — ${booking.roomName} is now occupied.`)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-end">
        <WalkInBookingDialog />
      </div>
      <ArrivalsList
        arrivals={todayArrivals}
        title="Today's arrivals"
        emptyMessage="No arrivals booked for today yet. Bookings made on the guest site will show up here."
        actionLabel="Check in"
        onAction={handleCheckIn}
        showVehiclePlate
      />
      <ArrivalsList
        arrivals={upcoming}
        title="Upcoming arrivals"
        emptyMessage="No upcoming confirmed bookings yet."
      />
      <ArrivalsList
        arrivals={inHouse}
        title="Currently in-house"
        emptyMessage="No guests are checked in right now."
        actionLabel="Check out"
        onAction={setCheckoutTarget}
        showVehiclePlate
      />
      <CheckoutDialog booking={checkoutTarget} onOpenChange={(open) => !open && setCheckoutTarget(null)} />
    </div>
  );
}
