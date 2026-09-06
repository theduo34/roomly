"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CheckCircleIcon } from "@phosphor-icons/react/ssr"
import { Button } from "@/components/ui/button"
import { readBookings } from "@/lib/bookings-store"
import { formatCurrency, formatDate } from "@/lib/utils"
import type { Booking } from "@/lib/types"

function findBooking(reference: string | null): Booking | null {
  if (!reference) return null
  return readBookings().find((b) => b.qrCode === reference) ?? null
}

export function BookingConfirmation() {
  const searchParams = useSearchParams()
  const reference = searchParams.get("ref")
  const [booking, setBooking] = useState<Booking | null | undefined>(undefined)

  useEffect(() => {
    // Booking lives in localStorage, an external store not readable during render
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBooking(findBooking(reference))
  }, [reference])

  if (booking === undefined) return null

  if (!booking) {
    return (
      <div className="mx-auto w-full max-w-xl px-6 py-14 text-center">
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          We couldn&apos;t find that booking
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The confirmation link looks invalid or has expired.
        </p>
        <Button asChild className="mt-6">
          <Link href="/rooms">Browse rooms</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center px-6 py-14 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <CheckCircleIcon className="size-8" />
      </div>
      <h1 className="mt-6 font-heading text-3xl font-semibold text-foreground">
        Your room is reserved
      </h1>
      <p className="mt-2 text-muted-foreground">
        A confirmation has been sent to {booking.guestEmail}.
      </p>

      <div className="mt-8 flex size-40 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-card">
        <div
          className="grid size-24 grid-cols-6 grid-rows-6 gap-0.5"
          aria-hidden
        >
          {Array.from({ length: 36 }).map((_, i) => (
            <span
              key={i}
              className={(i * 7) % 3 === 0 ? "bg-foreground" : "bg-transparent"}
            />
          ))}
        </div>
      </div>
      <p className="mt-3 font-mono text-lg font-semibold tracking-wide text-foreground">
        {booking.qrCode}
      </p>

      <div className="mt-8 w-full rounded-xl border border-border bg-card p-6 text-left">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Guest</span>
          <span className="text-foreground">{booking.guestName}</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Room</span>
          <span className="text-foreground">{booking.roomName}</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Dates</span>
          <span className="text-foreground">
            {formatDate(booking.checkIn)} – {formatDate(booking.checkOut)}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-sm font-medium">
          <span className="text-foreground">Deposit paid</span>
          <span className="text-primary">{formatCurrency(booking.depositPaid)}</span>
        </div>
      </div>

      <Button asChild variant="outline" className="mt-8">
        <Link href="/rooms">Browse more rooms</Link>
      </Button>
    </div>
  );
}
