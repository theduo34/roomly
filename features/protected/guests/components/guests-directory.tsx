"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"
import {
  CaretDownIcon,
  DownloadSimpleIcon,
  FlagIcon,
  MagnifyingGlassIcon,
} from "@phosphor-icons/react/ssr"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CheckoutDialog } from "@/features/protected/receptionist/components/checkout-dialog"
import { useLocalBookings } from "@/features/protected/dashboard/hooks/use-local-bookings"
import { useGuestFlags } from "@/features/protected/dashboard/hooks/use-guest-flags"
import { useStaffName } from "@/features/auth/hooks/use-role"
import { appendAuditLog } from "@/lib/audit-log-store"
import { updateBooking } from "@/lib/bookings-store"
import { flagGuest, unflagGuest } from "@/lib/guest-flags-store"
import { setRoomStatus } from "@/lib/room-status-store"
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

type Guest = {
  email: string
  name: string
  phone: string
  bookings: Booking[]
}

function buildGuests(bookings: Booking[]): Guest[] {
  const map = new Map<string, Guest>()
  for (const booking of bookings) {
    const existing = map.get(booking.guestEmail)
    if (existing) {
      existing.bookings.push(booking)
    } else {
      map.set(booking.guestEmail, {
        email: booking.guestEmail,
        name: booking.guestName,
        phone: booking.guestPhone,
        bookings: [booking],
      })
    }
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name))
}

function downloadGuestReport(guest: Guest) {
  const lines = [
    `Guest report — ${guest.name}`,
    `Email: ${guest.email}`,
    `Phone: ${guest.phone}`,
    `Generated: ${new Date().toLocaleString()}`,
    "",
    "Stay history:",
    ...guest.bookings.map(
      (b) =>
        `- ${b.roomName} · ${formatDate(b.checkIn)} to ${formatDate(b.checkOut)} · ${statusLabels[b.status]} · ` +
        `Total ${formatCurrency(b.totalAmount)} · Paid ${formatCurrency(b.depositPaid)} · Ref ${b.qrCode}`
    ),
  ]

  const blob = new Blob([lines.join("\n")], { type: "text/plain" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `${guest.name.replace(/\s+/g, "-").toLowerCase()}-report.txt`
  link.click()
  URL.revokeObjectURL(url)
}

function FlagGuestButton({ guest }: { guest: Guest }) {
  const flags = useGuestFlags()
  const flag = flags.get(guest.email)
  const staffName = useStaffName()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("")

  function submitFlag() {
    const value = reason.trim()
    if (!value) return
    flagGuest(guest.email, value, staffName || "Receptionist")
    appendAuditLog({
      action: `Flagged guest profile — ${guest.name}: ${value}`,
      performedBy: staffName || "Receptionist",
      role: "receptionist",
    })
    toast.success(`${guest.name}'s profile has been flagged.`)
    setReason("")
    setOpen(false)
  }

  function removeFlag() {
    unflagGuest(guest.email)
    appendAuditLog({
      action: `Removed flag from guest profile — ${guest.name}`,
      performedBy: staffName || "Receptionist",
      role: "receptionist",
    })
    toast.message(`Flag removed for ${guest.name}.`)
  }

  if (flag) {
    return (
      <button
        type="button"
        onClick={removeFlag}
        title={`Flagged: ${flag.reason}`}
        className="flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-1 text-[11px] font-medium text-destructive hover:bg-destructive/20"
      >
        <FlagIcon weight="fill" size={12} />
        Flagged
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Flag this guest for behavioural reasons"
        className="flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:bg-muted"
      >
        <FlagIcon size={12} />
        Flag
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Flag {guest.name}</DialogTitle>
            <DialogDescription>
              Staff will be alerted on future bookings or visits from this guest.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Disruptive conduct during previous stay, property damage…"
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={submitFlag} disabled={!reason.trim()}>
              Flag guest
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function GuestsDirectory() {
  const bookings = useLocalBookings()
  const staffName = useStaffName()
  const [query, setQuery] = useState("")
  const [expanded, setExpanded] = useState<string | null>(null)
  const [checkoutTarget, setCheckoutTarget] = useState<Booking | null>(null)

  const guests = useMemo(() => buildGuests(bookings), [bookings])
  const filtered = guests.filter((guest) =>
    `${guest.name} ${guest.email}`.toLowerCase().includes(query.trim().toLowerCase())
  )

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
    <div className="flex flex-col gap-4">
      <div className="relative max-w-sm">
        <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search guests by name or email"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">No guests match your search yet.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {filtered.map((guest) => {
              const isOpen = expanded === guest.email
              const isInHouse = guest.bookings.some((b) => b.status === "checked_in")

              return (
                <li key={guest.email} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setExpanded(isOpen ? null : guest.email)}
                      className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{guest.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {guest.email} · {guest.phone}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <span className="text-xs text-muted-foreground">
                          {guest.bookings.length} booking{guest.bookings.length === 1 ? "" : "s"}
                        </span>
                        {isInHouse && (
                          <span className="rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            In-house
                          </span>
                        )}
                        <CaretDownIcon
                          className={cn("size-4 text-muted-foreground transition-transform", isOpen && "rotate-180")}
                        />
                      </div>
                    </button>
                    <div className="flex shrink-0 items-center gap-2">
                      <FlagGuestButton guest={guest} />
                      <button
                        type="button"
                        onClick={() => downloadGuestReport(guest)}
                        title="Export guest report"
                        className="flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:bg-muted"
                      >
                        <DownloadSimpleIcon size={12} />
                        Export
                      </button>
                    </div>
                  </div>

                  {isOpen && (
                    <ul className="mt-3 flex flex-col gap-2">
                      {guest.bookings.map((booking) => (
                        <li
                          key={booking.id}
                          className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm text-foreground">{booking.roomName}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(booking.checkIn)} – {formatDate(booking.checkOut)} ·{" "}
                              {formatCurrency(booking.depositPaid)} deposit
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <span
                              className={cn(
                                "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
                                statusStyles[booking.status]
                              )}
                            >
                              {statusLabels[booking.status]}
                            </span>
                            {booking.status === "confirmed" && (
                              <button
                                type="button"
                                onClick={() => handleCheckIn(booking)}
                                className="rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/80"
                              >
                                Check in
                              </button>
                            )}
                            {booking.status === "checked_in" && (
                              <button
                                type="button"
                                onClick={() => setCheckoutTarget(booking)}
                                className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
                              >
                                Check out
                              </button>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
      <CheckoutDialog booking={checkoutTarget} onOpenChange={(open) => !open && setCheckoutTarget(null)} />
    </div>
  );
}
