export type RoomStatus =
  | "available"
  | "reserved"
  | "occupied"
  | "needs_cleaning"
  | "maintenance"

export type RoomType = "standard" | "deluxe" | "suite" | "executive"

export type Room = {
  id: string
  name: string
  type: RoomType
  description: string
  price: number // per night in GHS
  images: string[] // Unsplash URLs
  amenities: string[]
  capacity: number
  status: RoomStatus
}

export type BookingStatus = "confirmed" | "checked_in" | "checked_out" | "cancelled"

export type Booking = {
  id: string
  guestName: string
  guestEmail: string
  roomId: string
  roomName: string
  checkIn: string // ISO date string
  checkOut: string // ISO date string
  nights: number
  totalAmount: number
  depositPaid: number // 20% of total
  status: BookingStatus
  qrCode: string // unique string used as mock QR data
  bookedAt: string // ISO date string
  vehiclePlate?: string
}

export type StaffRole = "receptionist" | "manager" | "director"

export type AuditLog = {
  id: string
  action: string
  performedBy: string
  role: StaffRole
  timestamp: string
}
