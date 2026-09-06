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
  rating: number // out of 5
}

export type Review = {
  id: string
  roomId: string
  guestName: string
  rating: number // out of 5
  comment: string
  date: string // ISO date string
}

export type BookingStatus = "confirmed" | "checked_in" | "checked_out" | "cancelled"

export type Booking = {
  id: string
  guestName: string
  guestEmail: string
  guestPhone: string
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

export type GuestFlag = {
  guestEmail: string
  reason: string
  flaggedBy: string
  flaggedAt: string // ISO date string
}

export type StaffStatus = "on_shift" | "off_shift"

export type StaffMember = {
  id: string
  name: string
  email: string
  phone: string
  role: StaffRole
  status: StaffStatus
  joinedAt: string // ISO date string
}
