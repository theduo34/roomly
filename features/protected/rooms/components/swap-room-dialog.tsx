"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useStaffName } from "@/features/auth/hooks/use-role"
import { appendAuditLog } from "@/lib/audit-log-store"
import { updateBooking } from "@/lib/bookings-store"
import { setRoomStatus } from "@/lib/room-status-store"
import type { Booking, Room } from "@/lib/types"

export function SwapRoomDialog({
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
