"use client"

import { useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { PlusIcon } from "@phosphor-icons/react/ssr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRooms } from "@/features/protected/rooms/hooks/use-rooms"
import { useStaffName } from "@/features/auth/hooks/use-role"
import { appendAuditLog } from "@/lib/audit-log-store"
import { appendBooking } from "@/lib/bookings-store"
import { setRoomStatus } from "@/lib/room-status-store"
import { calculateNights, formatCurrency, generateBookingReference } from "@/lib/utils"
import type { Booking } from "@/lib/types"

const walkInSchema = z
  .object({
    guestName: z.string().min(2, "Enter the guest's full name"),
    guestEmail: z.email("Enter a valid email"),
    guestPhone: z.string().min(7, "Enter a valid phone number"),
    roomId: z.string().min(1, "Assign a room"),
    checkOut: z.string().min(1, "Select a check-out date"),
    vehiclePlate: z.string().optional(),
  })

type WalkInValues = z.infer<typeof walkInSchema>

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export function WalkInBookingDialog() {
  const [open, setOpen] = useState(false)
  const rooms = useRooms()
  const staffName = useStaffName()
  const availableRooms = useMemo(() => rooms.filter((room) => room.status === "available"), [rooms])
  const today = todayIso()

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<WalkInValues>({
    resolver: zodResolver(walkInSchema),
    defaultValues: { guestName: "", guestEmail: "", guestPhone: "", roomId: "", checkOut: "", vehiclePlate: "" },
  })

  const roomId = watch("roomId")
  const checkOut = watch("checkOut")
  const room = availableRooms.find((r) => r.id === roomId)

  const { nights, total } = useMemo(() => {
    const n = room && checkOut ? calculateNights(today, checkOut) : 0
    return { nights: n, total: n > 0 && room ? n * room.price : 0 }
  }, [room, checkOut, today])

  function onSubmit(values: WalkInValues) {
    const selectedRoom = availableRooms.find((r) => r.id === values.roomId)
    if (!selectedRoom) return

    const booking: Booking = {
      id: `booking-${Date.now()}`,
      guestName: values.guestName,
      guestEmail: values.guestEmail,
      guestPhone: values.guestPhone,
      roomId: selectedRoom.id,
      roomName: selectedRoom.name,
      checkIn: today,
      checkOut: values.checkOut,
      nights,
      totalAmount: total,
      depositPaid: total,
      status: "checked_in",
      qrCode: generateBookingReference(),
      bookedAt: new Date().toISOString(),
      ...(values.vehiclePlate ? { vehiclePlate: values.vehiclePlate.trim().toUpperCase() } : {}),
    }

    appendBooking(booking)
    setRoomStatus(selectedRoom.id, "occupied")
    appendAuditLog({
      action: `Processed walk-in booking — ${selectedRoom.name}`,
      performedBy: staffName || "Receptionist",
      role: "receptionist",
    })
    toast.success(`${values.guestName} checked in — ${selectedRoom.name} is now occupied.`)
    reset()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon />
          New walk-in booking
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>New walk-in booking</DialogTitle>
            <DialogDescription>
              For a guest without a prior reservation. Paid in full and checked in immediately.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="wi-guestName">Guest name</Label>
            <Input id="wi-guestName" placeholder="Jane Doe" {...register("guestName")} />
            {errors.guestName && <p className="text-sm text-destructive">{errors.guestName.message}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="wi-guestEmail">Email</Label>
              <Input id="wi-guestEmail" type="email" placeholder="jane@example.com" {...register("guestEmail")} />
              {errors.guestEmail && <p className="text-sm text-destructive">{errors.guestEmail.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="wi-guestPhone">Phone number</Label>
              <Input id="wi-guestPhone" type="tel" placeholder="+233 20 000 0000" {...register("guestPhone")} />
              {errors.guestPhone && <p className="text-sm text-destructive">{errors.guestPhone.message}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="wi-room">Assign room</Label>
            <Controller
              name="roomId"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="wi-room" className="w-full">
                    <SelectValue placeholder="Choose an available room" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRooms.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name} · {formatCurrency(r.price)}/night
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.roomId && <p className="text-sm text-destructive">{errors.roomId.message}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label>Check-in</Label>
              <Input value={today} disabled readOnly />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="wi-checkOut">Check-out</Label>
              <Input id="wi-checkOut" type="date" min={today} {...register("checkOut")} />
              {errors.checkOut && <p className="text-sm text-destructive">{errors.checkOut.message}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="wi-plate">Vehicle plate (optional)</Label>
            <Input id="wi-plate" placeholder="GT 1234-24" {...register("vehiclePlate")} />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm">
            <span className="text-muted-foreground">{nights > 0 ? `${nights} night(s)` : "Select a room and dates"}</span>
            <span className="font-medium text-foreground">{total > 0 ? formatCurrency(total) : "—"}</span>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || nights <= 0}>
              Check in guest
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
