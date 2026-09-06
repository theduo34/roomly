"use client"

import { useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { CaretLeftIcon, CaretRightIcon, FlagIcon, MagnifyingGlassIcon } from "@phosphor-icons/react/ssr"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useGuestFlags } from "@/features/protected/dashboard/hooks/use-guest-flags"
import { useLocalBookings } from "@/features/protected/dashboard/hooks/use-local-bookings"
import { cn } from "@/lib/utils"
import type { Booking } from "@/lib/types"

const PAGE_SIZE = 8

type GuestStatus = "in_house" | "upcoming" | "checked_out" | "cancelled"

const guestStatusStyles: Record<GuestStatus, string> = {
  in_house: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  upcoming: "bg-primary/10 text-primary",
  checked_out: "bg-muted text-muted-foreground",
  cancelled: "bg-destructive/10 text-destructive",
}

const guestStatusLabels: Record<GuestStatus, string> = {
  in_house: "In-house",
  upcoming: "Upcoming",
  checked_out: "Checked out",
  cancelled: "Cancelled",
}

const statusFilterOptions: { value: "all" | GuestStatus; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "in_house", label: guestStatusLabels.in_house },
  { value: "upcoming", label: guestStatusLabels.upcoming },
  { value: "checked_out", label: guestStatusLabels.checked_out },
  { value: "cancelled", label: guestStatusLabels.cancelled },
]

type Guest = {
  email: string
  name: string
  phone: string
  bookings: Booking[]
  status: GuestStatus
}

function deriveGuestStatus(bookings: Booking[]): GuestStatus {
  if (bookings.some((b) => b.status === "checked_in")) return "in_house"
  if (bookings.some((b) => b.status === "confirmed")) return "upcoming"
  if (bookings.some((b) => b.status === "checked_out")) return "checked_out"
  return "cancelled"
}

function buildGuests(bookings: Booking[]): Guest[] {
  const map = new Map<string, Omit<Guest, "status">>()
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
  return [...map.values()]
    .map((guest) => ({ ...guest, status: deriveGuestStatus(guest.bookings) }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase()
}

export function GuestsDirectory() {
  const { dashboardToken } = useParams<{ dashboardToken: string }>()
  const router = useRouter()
  const bookings = useLocalBookings()
  const flags = useGuestFlags()
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | GuestStatus>("all")
  const [page, setPage] = useState(0)

  const guests = useMemo(() => buildGuests(bookings), [bookings])
  const trimmedQuery = query.trim().toLowerCase()
  const filtered = guests
    .filter((guest) => statusFilter === "all" || guest.status === statusFilter)
    .filter((guest) => `${guest.name} ${guest.email}`.toLowerCase().includes(trimmedQuery))

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages - 1)
  const pageGuests = filtered.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE)

  function goToGuest(email: string) {
    router.push(`/admin/${dashboardToken}/guests/${encodeURIComponent(email)}`)
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-base font-semibold text-foreground">Guests</h2>
        <span className="text-xs text-muted-foreground">{filtered.length} guests</span>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="relative max-w-sm flex-1">
          <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search guests by name or email"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPage(0)
            }}
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value as "all" | GuestStatus)
            setPage(0)
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusFilterOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {pageGuests.length === 0 ? (
        <div className="mt-4 flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-12 text-center">
          <span className="flex size-10 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <MagnifyingGlassIcon size={18} />
          </span>
          <p className="text-sm font-medium text-foreground">No guests found</p>
          <p className="max-w-xs text-xs text-muted-foreground">Try a different name, email, or status filter.</p>
        </div>
      ) : (
        <>
          {/* Cards on mobile */}
          <ul className="mt-4 flex flex-col gap-2 sm:hidden">
            {pageGuests.map((guest) => {
              const flag = flags.get(guest.email)
              return (
                <li key={guest.email}>
                  <button
                    type="button"
                    onClick={() => goToGuest(guest.email)}
                    className="flex w-full items-center gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:bg-muted"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-heading text-sm font-bold text-primary">
                      {initials(guest.name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate text-sm font-medium text-foreground">{guest.name}</p>
                        {flag && <FlagIcon weight="fill" size={12} className="shrink-0 text-destructive" />}
                      </div>
                      <p className="truncate text-xs text-muted-foreground">{guest.email}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {guest.bookings.length} booking{guest.bookings.length === 1 ? "" : "s"}
                        </span>
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-medium",
                            guestStatusStyles[guest.status]
                          )}
                        >
                          {guestStatusLabels[guest.status]}
                        </span>
                      </div>
                    </div>
                    <CaretRightIcon size={16} className="shrink-0 text-muted-foreground" />
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Table from sm: up */}
          <div className="mt-4 hidden overflow-x-auto sm:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground uppercase">
                  <th className="pb-2 font-medium">Guest</th>
                  <th className="pb-2 font-medium">Phone</th>
                  <th className="pb-2 font-medium">Bookings</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium" aria-hidden="true" />
                </tr>
              </thead>
              <tbody>
                {pageGuests.map((guest) => {
                  const flag = flags.get(guest.email)
                  return (
                    <tr
                      key={guest.email}
                      role="link"
                      tabIndex={0}
                      onClick={() => goToGuest(guest.email)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") goToGuest(guest.email)
                      }}
                      className="cursor-pointer border-b border-border transition-colors last:border-0 hover:bg-muted"
                    >
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-heading text-xs font-bold text-primary">
                            {initials(guest.name)}
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="truncate font-medium text-foreground">{guest.name}</p>
                              {flag && <FlagIcon weight="fill" size={12} className="shrink-0 text-destructive" />}
                            </div>
                            <p className="truncate text-xs text-muted-foreground">{guest.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">{guest.phone}</td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {guest.bookings.length} booking{guest.bookings.length === 1 ? "" : "s"}
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
                            guestStatusStyles[guest.status]
                          )}
                        >
                          {guestStatusLabels[guest.status]}
                        </span>
                      </td>
                      <td className="py-3 pl-2 text-right">
                        <CaretRightIcon size={16} className="inline-block text-muted-foreground" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
          <span className="text-xs text-muted-foreground">
            Page {currentPage + 1} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="flex size-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
              aria-label="Previous page"
            >
              <CaretLeftIcon size={14} />
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage >= totalPages - 1}
              className="flex size-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
              aria-label="Next page"
            >
              <CaretRightIcon size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
