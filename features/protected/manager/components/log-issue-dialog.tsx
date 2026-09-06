"use client"

import { useState } from "react"
import { toast } from "sonner"
import { PlusIcon } from "@phosphor-icons/react/ssr"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useRooms } from "@/features/protected/rooms/hooks/use-rooms"
import { useStaffName } from "@/features/auth/hooks/use-role"
import { useDashboardRole } from "@/features/protected/dashboard/context/role-context"
import { appendAuditLog } from "@/lib/audit-log-store"
import { reportMaintenanceIssue } from "@/lib/maintenance-store"
import { setRoomStatus } from "@/lib/room-status-store"

export function LogIssueDialog() {
  const [open, setOpen] = useState(false)
  const [roomId, setRoomId] = useState("")
  const [description, setDescription] = useState("")
  const rooms = useRooms()
  const staffName = useStaffName()
  const role = useDashboardRole()

  const eligibleRooms = rooms.filter((r) => r.status !== "maintenance")

  function submit() {
    const room = rooms.find((r) => r.id === roomId)
    const value = description.trim()
    if (!room || !value) return

    reportMaintenanceIssue({
      roomId: room.id,
      roomName: room.name,
      description: value,
      reportedBy: staffName || "Manager",
    })
    setRoomStatus(room.id, "maintenance")
    appendAuditLog({
      action: `Logged maintenance issue — ${room.name}: ${value}`,
      performedBy: staffName || "Manager",
      role,
    })
    toast.success(`Issue logged for ${room.name}.`)
    setRoomId("")
    setDescription("")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button">
          <PlusIcon />
          Log issue
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log maintenance issue</DialogTitle>
          <DialogDescription>
            The room will be marked under maintenance until this issue is resolved.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Select value={roomId} onValueChange={setRoomId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a room" />
            </SelectTrigger>
            <SelectContent>
              {eligibleRooms.map((room) => (
                <SelectItem key={room.id} value={room.id}>
                  {room.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Air conditioning unit is leaking near the window."
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!roomId || !description.trim()}>
            Log issue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
