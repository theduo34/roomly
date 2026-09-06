"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import {
  CalendarCheckIcon,
  ClockIcon,
  IdentificationCardIcon,
  ShieldCheckIcon,
  StarIcon,
  TagIcon,
  WalletIcon,
} from "@phosphor-icons/react/ssr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { StatusBadge } from "@/components/shared/status-badge"
import { appendBooking } from "@/lib/bookings-store"
import { calculateNights, formatCurrency, generateBookingReference } from "@/lib/utils"
import type { Booking, Room } from "@/lib/types"

const bookingSchema = z
  .object({
    guestName: z.string().min(2, "Enter your full name"),
    guestEmail: z.email("Enter a valid email"),
    guestPhone: z.string().min(7, "Enter a valid phone number"),
    checkIn: z.string().min(1, "Select a check-in date"),
    checkOut: z.string().min(1, "Select a check-out date"),
  })
  .refine((data) => new Date(data.checkOut) > new Date(data.checkIn), {
    message: "Check-out must be after check-in",
    path: ["checkOut"],
  })

type BookingFormValues = z.infer<typeof bookingSchema>

const promoCodes: Record<string, number> = {
  WELCOME10: 0.1,
  ROOMLY5: 0.05,
}

const policies = [
  {
    icon: ClockIcon,
    text: "Check-in from 2:00 PM, check-out by 11:00 AM.",
  },
  {
    icon: ShieldCheckIcon,
    text: "A 20% deposit confirms your booking — the room is only reserved once payment succeeds.",
  },
  {
    icon: CalendarCheckIcon,
    text: "Free cancellation up to 48 hours before check-in; cancelling after that incurs a 5% penalty — the rest of your deposit is refunded.",
  },
  {
    icon: WalletIcon,
    text: "The remaining balance is settled at check-out.",
  },
  {
    icon: IdentificationCardIcon,
    text: "Valid photo ID required at check-in. No smoking, no pets.",
  },
]

export function BookingForm({ room }: { room: Room }) {
  const router = useRouter()
  const [promoInput, setPromoInput] = useState("")
  const [promo, setPromo] = useState<{ code: string; discount: number } | null>(null)
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { guestName: "", guestEmail: "", guestPhone: "", checkIn: "", checkOut: "" },
  })

  const checkIn = watch("checkIn")
  const checkOut = watch("checkOut")

  const { nights, total, deposit, balance } = useMemo(() => {
    const n = checkIn && checkOut ? calculateNights(checkIn, checkOut) : 0
    const gross = n > 0 ? n * room.price : 0
    const t = promo ? Math.round(gross * (1 - promo.discount)) : gross
    const d = Math.round(t * 0.2)
    return { nights: n, total: t, deposit: d, balance: t - d }
  }, [checkIn, checkOut, room.price, promo])

  function applyPromo() {
    const code = promoInput.trim().toUpperCase()
    if (!code) return
    const discount = promoCodes[code]
    if (discount) {
      setPromo({ code, discount })
      toast.success(`Promo code ${code} applied — ${discount * 100}% off.`)
    } else {
      toast.error("That promo code isn't valid.")
    }
  }

  function onSubmit(values: BookingFormValues) {
    const reference = generateBookingReference()
    const booking: Booking = {
      id: `booking-${Date.now()}`,
      guestName: values.guestName,
      guestEmail: values.guestEmail,
      guestPhone: values.guestPhone,
      roomId: room.id,
      roomName: room.name,
      checkIn: values.checkIn,
      checkOut: values.checkOut,
      nights,
      totalAmount: total,
      depositPaid: deposit,
      status: "confirmed",
      qrCode: reference,
      bookedAt: new Date().toISOString(),
    }

    appendBooking(booking)

    toast.success("Deposit paid — your room is reserved.")
    router.push(`/booking/confirmation?ref=${reference}`)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <div className="flex w-full flex-col gap-6">
        <div className="flex flex-col gap-5 rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2.5">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              1
            </span>
            <h2 className="font-heading text-base font-semibold text-foreground">Your details</h2>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="guestName">Guest name</Label>
            <Input id="guestName" placeholder="Jane Doe" {...register("guestName")} />
            {errors.guestName && <p className="text-sm text-destructive">{errors.guestName.message}</p>}
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="guestEmail">Email</Label>
              <Input id="guestEmail" type="email" placeholder="jane@example.com" {...register("guestEmail")} />
              {errors.guestEmail && <p className="text-sm text-destructive">{errors.guestEmail.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="guestPhone">Phone number</Label>
              <Input id="guestPhone" type="tel" placeholder="+233 20 000 0000" {...register("guestPhone")} />
              {errors.guestPhone && <p className="text-sm text-destructive">{errors.guestPhone.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="checkIn">Check-in</Label>
              <Input id="checkIn" type="date" {...register("checkIn")} />
              {errors.checkIn && <p className="text-sm text-destructive">{errors.checkIn.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="checkOut">Check-out</Label>
              <Input id="checkOut" type="date" {...register("checkOut")} />
              {errors.checkOut && <p className="text-sm text-destructive">{errors.checkOut.message}</p>}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2.5">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              2
            </span>
            <h2 className="font-heading text-base font-semibold text-foreground">Policies before you book</h2>
          </div>
          <ul className="flex flex-col gap-3">
            {policies.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-sm text-muted-foreground">
                <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex h-full flex-col gap-5 rounded-xl border border-border bg-card p-6 lg:sticky lg:top-20">
        <h2 className="font-heading text-base font-semibold text-foreground">Booking summary</h2>
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative size-16 shrink-0 overflow-hidden rounded-lg">
              <Image src={room.images[0]} alt={room.name} fill className="object-cover" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-heading font-semibold text-foreground">{room.name}</p>
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                {formatCurrency(room.price)} / night
                <span aria-hidden>·</span>
                <StarIcon weight="fill" className="size-3.5 text-primary" />
                {room.rating.toFixed(2)}
              </p>
            </div>
          </div>
          <StatusBadge status={room.status} audience="guest" />
        </div>

        <div className="flex flex-col gap-1.5 border-t border-border pt-5">
          <Label htmlFor="promoCode">Promo code (optional)</Label>
          <div className="flex gap-2">
            <Input
              id="promoCode"
              placeholder="WELCOME10"
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value)}
            />
            <Button type="button" variant="outline" onClick={applyPromo}>
              Apply
            </Button>
          </div>
          {promo && (
            <p className="flex items-center gap-1.5 text-sm text-primary">
              <TagIcon className="size-3.5" />
              {promo.code} applied — {promo.discount * 100}% off
            </p>
          )}
        </div>

        <div className="border-t border-border pt-5">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Nights</span>
            <span className="text-foreground">{nights || "—"}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
            <span>Total</span>
            <span className="text-foreground">{total ? formatCurrency(total) : "—"}</span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-border pt-2 text-sm font-medium">
            <span className="text-foreground">Deposit due now (20%)</span>
            <span className="text-primary">{deposit ? formatCurrency(deposit) : "—"}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
            <span>Balance due at check-in</span>
            <span>{balance ? formatCurrency(balance) : "—"}</span>
          </div>
        </div>

        <div className="flex-1" />

        <Button type="submit" size="lg" disabled={isSubmitting || nights <= 0} className="w-full">
          Pay Deposit
        </Button>
      </div>
    </form>
  );
}
