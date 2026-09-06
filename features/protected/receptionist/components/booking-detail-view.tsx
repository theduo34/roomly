"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import {
  CalendarCheckIcon,
  CalendarXIcon,
  CarIcon,
  DoorOpenIcon,
  EnvelopeSimpleIcon,
  FlagIcon,
  MoonIcon,
  PencilSimpleIcon,
  PhoneIcon,
  ReceiptIcon,
  WalletIcon,
} from "@phosphor-icons/react/ssr"
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
import { FlagGuestButton } from "@/components/shared/flag-guest-button"
import { CheckInDialog } from "@/features/protected/receptionist/components/check-in-dialog"
import { CheckoutDialog } from "@/features/protected/receptionist/components/checkout-dialog"
import { ChangeRoomDialog } from "@/features/protected/receptionist/components/change-room-dialog"
import { useDashboardRole } from "@/features/protected/dashboard/context/role-context"
import { useLocalBookings } from "@/features/protected/dashboard/hooks/use-local-bookings"
import { useGuestFlags } from "@/features/protected/dashboard/hooks/use-guest-flags"
import { useStaffName } from "@/features/auth/hooks/use-role"
import { appendAuditLog } from "@/lib/audit-log-store"
import { updateBooking } from "@/lib/bookings-store"
import { paymentMethodLabels } from "@/lib/payment-methods"
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

type IconComponent = React.ComponentType<{ className?: string }>

function DetailField({ icon: Icon, label, value }: { icon: IconComponent; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground">
        <Icon className="size-3.5" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}

function VehiclePlateEditor({ booking, editable }: { booking: Booking; editable: boolean }) {
  const { dashboardToken } = useParams<{ dashboardToken: string }>()
  const staffName = useStaffName()
  const [open, setOpen] = useState(false)
  const [plate, setPlate] = useState(booking.vehiclePlate ?? "")

  if (!editable) {
    return <span className="text-sm font-medium text-foreground">{booking.vehiclePlate ?? "Not recorded"}</span>;
  }

  function save() {
    const value = plate.trim().toUpperCase()
    if (!value) return
    updateBooking(booking.id, { vehiclePlate: value })
    appendAuditLog({
      action: `Recorded vehicle plate ${value} — ${booking.guestName}`,
      performedBy: staffName || "Receptionist",
      role: "receptionist",
      link: `/admin/${dashboardToken}/arrivals/${booking.id}`,
    })
    toast.success(`Vehicle plate saved for ${booking.guestName}.`)
    setOpen(false)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary"
      >
        {booking.vehiclePlate ?? "Add vehicle plate"}
        <PencilSimpleIcon size={13} />
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vehicle plate</DialogTitle>
            <DialogDescription>
              Recorded at the gate for {booking.guestName} — correct it here if needed.
            </DialogDescription>
          </DialogHeader>
          <Input value={plate} onChange={(e) => setPlate(e.target.value)} placeholder="GT 1234-24" autoFocus />
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

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase()
}

export function BookingDetailView() {
  const { bookingId } = useParams<{ dashboardToken: string; bookingId: string }>()
  const bookings = useLocalBookings()
  const flags = useGuestFlags()
  const role = useDashboardRole()
  const editable = role === "receptionist"
  const [checkInOpen, setCheckInOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [changeRoomOpen, setChangeRoomOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => {
    // Bookings live in localStorage, an external store not readable during render
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true)
  }, [])

  const booking = bookings.find((b) => b.id === bookingId)

  if (!hydrated) return null

  if (!booking) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm text-muted-foreground">We couldn&apos;t find that booking.</p>
      </div>
    );
  }

  const balance = Math.max(0, booking.totalAmount - booking.depositPaid)
  const flag = flags.get(booking.guestEmail)
  const otherStays = bookings
    .filter((b) => b.guestEmail === booking.guestEmail && b.id !== booking.id)
    .sort((a, b) => b.checkIn.localeCompare(a.checkIn))
    .slice(0, 5)

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-4">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary/10 font-heading text-lg font-bold text-primary">
            {initials(booking.guestName)}
          </span>
          <div>
            <p className="font-mono text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {booking.qrCode}
            </p>
            <h1 className="mt-0.5 font-heading text-2xl font-bold text-foreground">{booking.guestName}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <EnvelopeSimpleIcon size={13} />
                {booking.guestEmail}
              </span>
              <span className="flex items-center gap-1">
                <PhoneIcon size={13} />
                {booking.guestPhone}
              </span>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <span className={cn("rounded-full px-3 py-1 text-xs font-medium", statusStyles[booking.status])}>
            {statusLabels[booking.status]}
          </span>
          {editable && <FlagGuestButton email={booking.guestEmail} name={booking.guestName} />}
        </div>
      </div>

      {flag && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <FlagIcon weight="fill" className="mt-0.5 size-4 shrink-0 text-destructive" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-destructive">Guest flagged</p>
            <p className="mt-0.5 text-sm text-muted-foreground">{flag.reason}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-heading text-base font-semibold text-foreground">Stay details</h2>
            <div className="mt-3 grid grid-cols-2 gap-y-3 sm:grid-cols-4">
              <DetailField icon={DoorOpenIcon} label="Room" value={booking.roomName} />
              <DetailField icon={CalendarCheckIcon} label="Check-in" value={formatDate(booking.checkIn)} />
              <DetailField icon={CalendarXIcon} label="Check-out" value={formatDate(booking.checkOut)} />
              <DetailField icon={MoonIcon} label="Nights" value={String(booking.nights)} />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-heading text-base font-semibold text-foreground">Payment</h2>
            <div className="mt-3 grid grid-cols-2 gap-y-3 sm:grid-cols-4">
              <DetailField icon={WalletIcon} label="Total for stay" value={formatCurrency(booking.totalAmount)} />
              <DetailField icon={ReceiptIcon} label="Deposit paid" value={formatCurrency(booking.depositPaid)} />
              <DetailField icon={WalletIcon} label="Balance due" value={formatCurrency(balance)} />
              <DetailField icon={CalendarCheckIcon} label="Booked on" value={formatDate(booking.bookedAt)} />
              <DetailField icon={ReceiptIcon} label="Payment method" value={paymentMethodLabels[booking.paymentMethod]} />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border bg-card p-5">
            <span className="flex items-center gap-2 text-sm font-medium text-foreground">
              <CarIcon size={16} />
              Vehicle plate
            </span>
            <VehiclePlateEditor booking={booking} editable={editable} />
          </div>

          {booking.specialRequests && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="font-heading text-base font-semibold text-foreground">Special requests</h2>
              <p className="mt-2 text-sm text-muted-foreground">{booking.specialRequests}</p>
            </div>
          )}

          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-heading text-base font-semibold text-foreground">Stay history</h2>
            {otherStays.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">No other stays on record for this guest yet.</p>
            ) : (
              <ul className="mt-3 flex flex-col divide-y divide-border">
                {otherStays.map((stay) => (
                  <li key={stay.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{stay.roomName}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {formatDate(stay.checkIn)} – {formatDate(stay.checkOut)}
                      </p>
                    </div>
                    <span
                      className={cn("shrink-0 rounded-full px-2.5 py-1 text-xs font-medium", statusStyles[stay.status])}
                    >
                      {statusLabels[stay.status]}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-5">
            <p className="text-sm font-medium text-muted-foreground">Booking reference</p>
            <div className="flex size-24 flex-col items-center justify-center rounded-xl border-2 border-dashed border-border">
              <div className="grid size-16 grid-cols-6 grid-rows-6 gap-0.5" aria-hidden>
                {Array.from({ length: 36 }).map((_, i) => (
                  <span key={i} className={(i * 7) % 3 === 0 ? "bg-foreground" : "bg-transparent"} />
                ))}
              </div>
            </div>
            <p className="font-mono text-base font-semibold tracking-wide text-foreground">{booking.qrCode}</p>
          </div>

          {editable && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="font-heading text-base font-semibold text-foreground">Actions</h2>
              <div className="mt-3 flex flex-col gap-2">
                {booking.status === "confirmed" && (
                  <Button onClick={() => setCheckInOpen(true)} className="w-full">
                    Check in
                  </Button>
                )}
                {booking.status === "checked_in" && (
                  <>
                    <Button onClick={() => setCheckoutOpen(true)} className="w-full">
                      Check out
                    </Button>
                    <Button variant="outline" onClick={() => setChangeRoomOpen(true)} className="w-full">
                      Change room
                    </Button>
                  </>
                )}
                {booking.status === "checked_out" && (
                  <p className="text-sm text-muted-foreground">Guest has checked out.</p>
                )}
                {booking.status === "cancelled" && (
                  <p className="text-sm text-muted-foreground">This booking was cancelled.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {editable && (
        <>
          <CheckInDialog booking={checkInOpen ? booking : null} onOpenChange={setCheckInOpen} />
          <CheckoutDialog booking={checkoutOpen ? booking : null} onOpenChange={setCheckoutOpen} />
          <ChangeRoomDialog booking={changeRoomOpen ? booking : null} onOpenChange={setChangeRoomOpen} />
        </>
      )}
    </div>
  );
}
