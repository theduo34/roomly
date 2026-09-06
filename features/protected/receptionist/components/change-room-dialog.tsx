"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import { ArrowsLeftRightIcon } from "@phosphor-icons/react/ssr"
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
import { useRooms } from "@/features/protected/rooms/hooks/use-rooms"
import { useStaffName } from "@/features/auth/hooks/use-role"
import { appendAuditLog } from "@/lib/audit-log-store"
import { updateBooking } from "@/lib/bookings-store"
import { setRoomStatus } from "@/lib/room-status-store"
import { formatCurrency } from "@/lib/utils"
import type { Booking } from "@/lib/types"

export function ChangeRoomDialog({
  booking,
  onOpenChange,
}: {
  booking: Booking | null
  onOpenChange: (open: boolean) => void
}) {
  const { dashboardToken } = useParams<{ dashboardToken: string }>()
  const rooms = useRooms()
  const staffName = useStaffName()
  const [roomId, setRoomId] = useState("")

  const availableRooms = rooms.filter((room) => room.status === "available")

  function confirmMove() {
    if (!booking) return
    const newRoom = availableRooms.find((r) => r.id === roomId)
    if (!newRoom) return

    updateBooking(booking.id, { roomId: newRoom.id, roomName: newRoom.name })
    setRoomStatus(booking.roomId, "needs_cleaning")
    setRoomStatus(newRoom.id, "occupied")
    appendAuditLog({
      action: `Moved guest — ${booking.roomName} → ${newRoom.name}`,
      performedBy: staffName || "Receptionist",
      role: "receptionist",
      link: `/admin/${dashboardToken}/arrivals/${booking.id}`,
    })
    toast.success(`${booking.guestName} moved to ${newRoom.name}.`)
    setRoomId("")
    onOpenChange(false)
  }

  return (
    <Dialog
      open={booking !== null}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) setRoomId("")
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change room for {booking?.guestName}</DialogTitle>
          <DialogDescription>
            Currently in {booking?.roomName}. Moving them updates both rooms&apos; status automatically.
          </DialogDescription>
        </DialogHeader>
        <Select value={roomId} onValueChange={setRoomId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose an available room" />
          </SelectTrigger>
          <SelectContent>
            {availableRooms.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">No other rooms are available right now.</div>
            ) : (
              availableRooms.map((room) => (
                <SelectItem key={room.id} value={room.id}>
                  {room.name} · {formatCurrency(room.price)}/night
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={confirmMove} disabled={!roomId}>
            <ArrowsLeftRightIcon />
            Move guest
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
