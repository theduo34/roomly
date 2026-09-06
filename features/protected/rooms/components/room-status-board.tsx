"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"
import { ArrowsLeftRightIcon } from "@phosphor-icons/react/ssr"
import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CheckoutDialog } from "@/features/protected/receptionist/components/checkout-dialog"
import { useLocalBookings } from "@/features/protected/dashboard/hooks/use-local-bookings"
import { useRooms } from "@/features/protected/rooms/hooks/use-rooms"
import { useStaffName } from "@/features/auth/hooks/use-role"
import { appendAuditLog } from "@/lib/audit-log-store"
import { updateBooking } from "@/lib/bookings-store"
import { setRoomStatus } from "@/lib/room-status-store"
import type { Booking, Room, RoomStatus } from "@/lib/types"

const statusOptions: { value: RoomStatus; label: string }[] = [
  { value: "available", label: "Available" },
  { value: "reserved", label: "Reserved" },
  { value: "occupied", label: "Occupied" },
  { value: "needs_cleaning", label: "Needs cleaning" },
  { value: "maintenance", label: "Maintenance" },
]

function SwapRoomDialog({
  booking,
  rooms,
  onOpenChange,
}: {
  booking: Booking | null
  rooms: Room[]
  onOpenChange: (open: boolean) => void
}) {
  const staffName = useStaffName()
  const [targetRoomId, setTargetRoomId] = useState("")
  const availableRooms = useMemo(() => rooms.filter((r) => r.status === "available"), [rooms])
  const fromRoom = booking ? rooms.find((r) => r.id === booking.roomId) : undefined

  function confirmSwap() {
    if (!booking || !fromRoom) return
    const toRoom = availableRooms.find((r) => r.id === targetRoomId)
    if (!toRoom) return

    updateBooking(booking.id, { roomId: toRoom.id, roomName: toRoom.name })
    setRoomStatus(fromRoom.id, "needs_cleaning")
    setRoomStatus(toRoom.id, "occupied")
    appendAuditLog({
      action: `Swapped guest room — ${fromRoom.name} to ${toRoom.name}`,
      performedBy: staffName || "Receptionist",
      role: "receptionist",
    })
    toast.success(`${booking.guestName} moved to ${toRoom.name}.`)
    setTargetRoomId("")
    onOpenChange(false)
  }

  function handleOpenChange(open: boolean) {
    if (!open) setTargetRoomId("")
    onOpenChange(open)
  }

  return (
    <Dialog open={booking !== null} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Swap room for {booking?.guestName}</DialogTitle>
          <DialogDescription>Moving from {fromRoom?.name}. Both rooms update automatically.</DialogDescription>
        </DialogHeader>
        <Select value={targetRoomId} onValueChange={setTargetRoomId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose a new room" />
          </SelectTrigger>
          <SelectContent>
            {availableRooms.map((room) => (
              <SelectItem key={room.id} value={room.id}>
                {room.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={confirmSwap} disabled={!targetRoomId}>
            Move guest
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function RoomStatusBoard({ editable = false }: { editable?: boolean }) {
  const rooms = useRooms()
  const bookings = useLocalBookings()
  const staffName = useStaffName()
  const [checkoutTarget, setCheckoutTarget] = useState<Booking | null>(null)
  const [swapTarget, setSwapTarget] = useState<Booking | null>(null)

  function handleStatusChange(roomId: string, roomName: string, status: RoomStatus) {
    setRoomStatus(roomId, status)
    const label = statusOptions.find((o) => o.value === status)?.label.toLowerCase()
    appendAuditLog({
      action: `Marked ${roomName} as ${label}`,
      performedBy: staffName || "Receptionist",
      role: "receptionist",
    })
    toast.success(`${roomName} marked as ${label}.`)
  }

  function requestCheckOut(roomId: string) {
    const activeBooking = bookings.find((b) => b.roomId === roomId && b.status === "checked_in")
    if (activeBooking) setCheckoutTarget(activeBooking)
  }

  function requestSwap(roomId: string) {
    const activeBooking = bookings.find((b) => b.roomId === roomId && b.status === "checked_in")
    if (activeBooking) setSwapTarget(activeBooking)
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h2 className="font-heading text-base font-semibold text-foreground">Room status board</h2>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => (
          <div key={room.id} className="flex flex-col gap-3 rounded-lg border border-border p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{room.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{room.type}</p>
              </div>
              {!editable && <StatusBadge status={room.status} />}
            </div>

            {editable && (
              <div className="flex flex-col gap-2">
                <Select
                  value={room.status}
                  onValueChange={(value) => handleStatusChange(room.id, room.name, value as RoomStatus)}
                >
                  <SelectTrigger size="sm" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {room.status === "occupied" && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => requestSwap(room.id)}
                      className="flex shrink-0 items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
                    >
                      <ArrowsLeftRightIcon size={12} />
                      Swap room
                    </button>
                    <button
                      type="button"
                      onClick={() => requestCheckOut(room.id)}
                      className="shrink-0 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
                    >
                      Check out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <CheckoutDialog booking={checkoutTarget} onOpenChange={(open) => !open && setCheckoutTarget(null)} />
      <SwapRoomDialog booking={swapTarget} rooms={rooms} onOpenChange={(open) => !open && setSwapTarget(null)} />
    </div>
  );
}
