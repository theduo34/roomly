"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import {
  ArrowsLeftRightIcon,
  CheckCircleIcon,
  DoorOpenIcon,
  DotsThreeIcon,
  StarIcon,
  UsersIcon,
} from "@phosphor-icons/react/ssr"
import { StatusBadge } from "@/components/shared/status-badge"
import { RoomGallery } from "@/components/shared/room-gallery"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CheckoutDialog } from "@/features/protected/receptionist/components/checkout-dialog"
import { SwapRoomDialog } from "@/features/protected/rooms/components/swap-room-dialog"
import { useDashboardRole } from "@/features/protected/dashboard/context/role-context"
import { useLocalBookings } from "@/features/protected/dashboard/hooks/use-local-bookings"
import { useRooms } from "@/features/protected/rooms/hooks/use-rooms"
import { useStaffName } from "@/features/auth/hooks/use-role"
import { appendAuditLog } from "@/lib/audit-log-store"
import { setRoomStatus } from "@/lib/room-status-store"
import { formatCurrency, formatDate } from "@/lib/utils"
import type { RoomStatus } from "@/lib/types"

const statusOptions: { value: RoomStatus; label: string }[] = [
  { value: "available", label: "Available" },
  { value: "reserved", label: "Reserved" },
  { value: "occupied", label: "Occupied" },
  { value: "needs_cleaning", label: "Needs cleaning" },
  { value: "maintenance", label: "Maintenance" },
]

export function RoomDetailView() {
  const { dashboardToken, roomId } = useParams<{ dashboardToken: string; roomId: string }>()
  const rooms = useRooms()
  const bookings = useLocalBookings()
  const role = useDashboardRole()
  const staffName = useStaffName()
  const [swapOpen, setSwapOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  const room = rooms.find((r) => r.id === roomId)
  const editable = role === "receptionist"

  if (!room) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm text-muted-foreground">We couldn&apos;t find that room.</p>
      </div>
    );
  }

  const currentStay = bookings
    .filter((b) => b.roomId === room.id && (b.status === "checked_in" || b.status === "confirmed"))
    .sort((a, b) => a.checkIn.localeCompare(b.checkIn))[0]

  const checkedInBooking = bookings.find((b) => b.roomId === room.id && b.status === "checked_in") ?? null

  function handleStatusChange(status: RoomStatus) {
    if (!room) return
    setRoomStatus(room.id, status)
    const label = statusOptions.find((o) => o.value === status)?.label.toLowerCase()
    appendAuditLog({
      action: `Marked ${room.name} as ${label}`,
      performedBy: staffName || "Receptionist",
      role: "receptionist",
    })
    toast.success(`${room.name} marked as ${label}.`)
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <RoomGallery room={room} photosHref={`/admin/${dashboardToken}/rooms/${room.id}/photos`} priority />

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-2xl font-bold text-foreground">{room.name}</h1>
              <StatusBadge status={room.status} />
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground capitalize">
              <span>{room.type}</span>
              <span className="flex items-center gap-1">
                <UsersIcon size={14} />
                Sleeps {room.capacity}
              </span>
              <span className="flex items-center gap-1 normal-case">
                <StarIcon size={14} weight="fill" className="text-primary" />
                {room.rating.toFixed(1)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-lg font-semibold text-foreground">
              {formatCurrency(room.price)}
              <span className="text-sm font-normal text-muted-foreground"> / night</span>
            </p>
            {editable && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label="Room actions"
                    className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <DotsThreeIcon size={20} weight="bold" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Room actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Change status</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuRadioGroup
                        value={room.status}
                        onValueChange={(value) => handleStatusChange(value as RoomStatus)}
                      >
                        {statusOptions.map((option) => (
                          <DropdownMenuRadioItem key={option.value} value={option.value}>
                            {option.label}
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  {room.status === "occupied" && checkedInBooking && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onSelect={() => setSwapOpen(true)}>
                        <ArrowsLeftRightIcon size={16} />
                        Swap room
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => setCheckoutOpen(true)}>
                        <DoorOpenIcon size={16} />
                        Check out
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="font-heading text-base font-semibold text-foreground">About this room</h2>
        <p className="mt-2 text-sm text-muted-foreground">{room.description}</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="font-heading text-base font-semibold text-foreground">Amenities</h2>
        <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {room.amenities.map((amenity) => (
            <li key={amenity} className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircleIcon size={14} className="shrink-0 text-primary" />
              {amenity}
            </li>
          ))}
        </ul>
      </div>

      {currentStay && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-heading text-base font-semibold text-foreground">Current stay</h2>
          <Link
            href={`/admin/${dashboardToken}/arrivals/${currentStay.id}`}
            className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{currentStay.guestName}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {formatDate(currentStay.checkIn)} – {formatDate(currentStay.checkOut)}
              </p>
            </div>
            <span className="shrink-0 text-xs font-medium text-primary">View booking</span>
          </Link>
        </div>
      )}

      <SwapRoomDialog booking={swapOpen ? checkedInBooking : null} rooms={rooms} onOpenChange={setSwapOpen} />
      <CheckoutDialog booking={checkoutOpen ? checkedInBooking : null} onOpenChange={setCheckoutOpen} />
    </div>
  );
}
