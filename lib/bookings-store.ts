import { bookings as seedBookings } from "@/lib/mock-data"
import type { Booking, BookingStatus } from "@/lib/types"

const STORAGE_KEY = "roomly_bookings"
export const BOOKINGS_CHANGE_EVENT = "roomly-bookings-changed"

export function readBookings(): Booking[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as Booking[]
    // First visit this session — seed from mock data so the demo isn't empty
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedBookings))
    return seedBookings
  } catch {
    return seedBookings
  }
}

function writeBookings(next: Booking[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  window.dispatchEvent(new Event(BOOKINGS_CHANGE_EVENT))
}

export function appendBooking(booking: Booking) {
  writeBookings([...readBookings(), booking])
}

export function updateBooking(bookingId: string, patch: Partial<Booking>) {
  writeBookings(readBookings().map((b) => (b.id === bookingId ? { ...b, ...patch } : b)))
}

export function updateBookingStatus(bookingId: string, status: BookingStatus) {
  updateBooking(bookingId, { status })
}
