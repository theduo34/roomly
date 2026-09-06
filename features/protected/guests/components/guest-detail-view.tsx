"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { DownloadSimpleIcon, EnvelopeSimpleIcon, FlagIcon, PhoneIcon, WalletIcon } from "@phosphor-icons/react/ssr"
import { FlagGuestButton } from "@/components/shared/flag-guest-button"
import { CheckInDialog } from "@/features/protected/receptionist/components/check-in-dialog"
import { CheckoutDialog } from "@/features/protected/receptionist/components/checkout-dialog"
import { useDashboardRole } from "@/features/protected/dashboard/context/role-context"
import { useGuestFlags } from "@/features/protected/dashboard/hooks/use-guest-flags"
import { useLocalBookings } from "@/features/protected/dashboard/hooks/use-local-bookings"
import { paymentMethodLabels } from "@/lib/payment-methods"
import { cn, formatCurrency, formatDate, formatDateTime } from "@/lib/utils"
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

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase()
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 truncate text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function downloadGuestReport(name: string, email: string, phone: string, bookings: Booking[]) {
  const lines = [
    `Guest report — ${name}`,
    `Email: ${email}`,
    `Phone: ${phone}`,
    `Generated: ${new Date().toLocaleString()}`,
    "",
    "Stay history:",
    ...bookings.flatMap((b) => [
      `- ${b.roomName} (Ref ${b.qrCode}) — ${statusLabels[b.status]}`,
      `  Planned: ${formatDate(b.checkIn)} to ${formatDate(b.checkOut)}`,
      `  Checked in: ${b.checkedInAt ? formatDateTime(b.checkedInAt) : "—"}`,
      `  Checked out: ${b.checkedOutAt ? formatDateTime(b.checkedOutAt) : "—"}`,
      `  Total ${formatCurrency(b.totalAmount)} · Paid ${formatCurrency(b.depositPaid)} · ` +
        `Payment method: ${paymentMethodLabels[b.paymentMethod]}`,
      `  Booked on: ${formatDate(b.bookedAt)}${b.vehiclePlate ? ` · Vehicle: ${b.vehiclePlate}` : ""}`,
      ...(b.specialRequests ? [`  Special requests: ${b.specialRequests}`] : []),
      "",
    ]),
  ]

  const blob = new Blob([lines.join("\n")], { type: "text/plain" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `${name.replace(/\s+/g, "-").toLowerCase()}-report.txt`
  link.click()
  URL.revokeObjectURL(url)
}

export function GuestDetailView() {
  const { email } = useParams<{ dashboardToken: string; email: string }>()
  const decodedEmail = decodeURIComponent(email)
  const bookings = useLocalBookings()
  const flags = useGuestFlags()
  const role = useDashboardRole()
  const editable = role === "receptionist"
  const [checkInTarget, setCheckInTarget] = useState<Booking | null>(null)
  const [checkoutTarget, setCheckoutTarget] = useState<Booking | null>(null)

  const guestBookings = bookings
    .filter((b) => b.guestEmail === decodedEmail)
    .sort((a, b) => b.checkIn.localeCompare(a.checkIn))

  if (guestBookings.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm text-muted-foreground">We couldn&apos;t find that guest.</p>
      </div>
    );
  }

  const { guestName: name, guestPhone: phone } = guestBookings[0]
  const flag = flags.get(decodedEmail)
  const totalSpent = guestBookings
    .filter((b) => b.status !== "cancelled")
    .reduce((sum, b) => sum + b.depositPaid, 0)

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-4">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary/10 font-heading text-lg font-bold text-primary">
            {initials(name)}
          </span>
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">{name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <EnvelopeSimpleIcon size={13} />
                {decodedEmail}
              </span>
              <span className="flex items-center gap-1">
                <PhoneIcon size={13} />
                {phone}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => downloadGuestReport(name, decodedEmail, phone, guestBookings)}
            className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
          >
            <DownloadSimpleIcon size={14} />
            Export report
          </button>
          {editable && <FlagGuestButton email={decodedEmail} name={name} />}
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs text-muted-foreground">Total bookings</p>
          <p className="mt-1 font-heading text-2xl font-bold text-foreground">{guestBookings.length}</p>
        </div>
        <div className="flex items-start gap-2.5 rounded-xl border border-border bg-card p-5">
          <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <WalletIcon size={14} />
          </span>
          <div>
            <p className="text-xs text-muted-foreground">Total paid to date</p>
            <p className="mt-0.5 font-heading text-2xl font-bold text-foreground">{formatCurrency(totalSpent)}</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="font-heading text-base font-semibold text-foreground">Stay history</h2>
        <div className="mt-3 flex flex-col gap-3">
          {guestBookings.map((booking) => {
            const balance = Math.max(0, booking.totalAmount - booking.depositPaid)
            return (
              <div key={booking.id} className="rounded-lg border border-border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{booking.roomName}</p>
                    <p className="mt-0.5 font-mono text-xs tracking-wide text-muted-foreground uppercase">
                      {booking.qrCode}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-3 py-1 text-xs font-medium",
                      statusStyles[booking.status]
                    )}
                  >
                    {statusLabels[booking.status]}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-3 sm:grid-cols-4">
                  <Field label="Check-in (planned)" value={formatDate(booking.checkIn)} />
                  <Field label="Check-out (planned)" value={formatDate(booking.checkOut)} />
                  <Field label="Checked in" value={booking.checkedInAt ? formatDateTime(booking.checkedInAt) : "—"} />
                  <Field
                    label="Checked out"
                    value={booking.checkedOutAt ? formatDateTime(booking.checkedOutAt) : "—"}
                  />
                  <Field label="Total" value={formatCurrency(booking.totalAmount)} />
                  <Field label="Paid" value={formatCurrency(booking.depositPaid)} />
                  <Field label="Balance due" value={formatCurrency(balance)} />
                  <Field label="Payment method" value={paymentMethodLabels[booking.paymentMethod]} />
                  <Field label="Booked on" value={formatDate(booking.bookedAt)} />
                  {booking.vehiclePlate && <Field label="Vehicle plate" value={booking.vehiclePlate} />}
                </div>
                {booking.specialRequests && (
                  <p className="mt-3 border-t border-border pt-3 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Special requests: </span>
                    {booking.specialRequests}
                  </p>
                )}

                {editable && (booking.status === "confirmed" || booking.status === "checked_in") && (
                  <div className="mt-3 flex items-center justify-end gap-2 border-t border-border pt-3">
                    {booking.status === "confirmed" && (
                      <button
                        type="button"
                        onClick={() => setCheckInTarget(booking)}
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
                )}
              </div>
            );
          })}
        </div>
      </div>

      <CheckInDialog booking={checkInTarget} onOpenChange={(open) => !open && setCheckInTarget(null)} />
      <CheckoutDialog booking={checkoutTarget} onOpenChange={(open) => !open && setCheckoutTarget(null)} />
    </div>
  );
}
