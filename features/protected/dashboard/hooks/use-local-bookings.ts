"use client"

import { useEffect, useState } from "react"
import { BOOKINGS_CHANGE_EVENT, readBookings } from "@/lib/bookings-store"
import type { Booking } from "@/lib/types"

export function useLocalBookings(): Booking[] {
  const [bookings, setBookings] = useState<Booking[]>([])

  useEffect(() => {
    const sync = () => setBookings(readBookings())
    sync()
    window.addEventListener(BOOKINGS_CHANGE_EVENT, sync)
    window.addEventListener("storage", sync)
    return () => {
      window.removeEventListener(BOOKINGS_CHANGE_EVENT, sync)
      window.removeEventListener("storage", sync)
    }
  }, [])

  return bookings
}
