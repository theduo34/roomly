"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MagnifyingGlassIcon } from "@phosphor-icons/react/ssr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatDate } from "@/lib/utils"
import type { Booking } from "@/lib/types"

export function ArrivalSearchDialog({
  bookings,
  dashboardToken,
}: {
  bookings: Booking[]
  dashboardToken: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  const trimmed = query.trim().toLowerCase()
  const results = trimmed
    ? bookings
        .filter(
          (b) =>
            b.qrCode.toLowerCase().includes(trimmed) ||
            b.guestName.toLowerCase().includes(trimmed) ||
            b.roomName.toLowerCase().includes(trimmed)
        )
        .slice(0, 8)
    : []

  function goToBooking(booking: Booking) {
    setOpen(false)
    setQuery("")
    router.push(`/admin/${dashboardToken}/arrivals/${booking.id}`)
  }

  return (
    <>
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        <MagnifyingGlassIcon />
        <span className="hidden sm:inline">Search booking</span>
      </Button>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) setQuery("")
        }}
      >
        <DialogContent className="flex max-h-[85vh] w-[calc(100%-1.5rem)] flex-col sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Search booking</DialogTitle>
            <DialogDescription>Look up a guest by their booking code, name, or room.</DialogDescription>
          </DialogHeader>
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="RML-4X9K, guest name, or room…"
            className="h-11 text-base sm:h-9 sm:text-sm"
          />
          <div className="flex min-h-24 flex-1 flex-col gap-1 overflow-y-auto sm:max-h-96">
            {trimmed && results.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">No bookings match &ldquo;{query}&rdquo;.</p>
            )}
            {results.map((booking) => (
              <button
                key={booking.id}
                type="button"
                onClick={() => goToBooking(booking)}
                className="flex items-center justify-between gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-muted"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{booking.guestName}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {booking.roomName} · {formatDate(booking.checkIn)}
                  </p>
                </div>
                <span className="shrink-0 font-mono text-xs text-muted-foreground">{booking.qrCode}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
