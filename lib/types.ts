export type RoomStatus =
  | "available"
  | "reserved"
  | "occupied"
  | "needs_cleaning"
  | "maintenance"

export type RoomType = "standard" | "deluxe" | "suite" | "executive"

export type RoomImage = {
  url: string // Unsplash URL
  category: string // e.g. "Bedroom", "Bathroom", "Lounge", "View"
}

export type Room = {
  id: string
  name: string
  type: RoomType
  description: string
  price: number // per night in GHS
  images: RoomImage[]
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

export type PaymentMethod = "card" | "mobile_money" | "cash" | "bank_transfer"

export type RefundStatus = "pending" | "approved" | "denied"

export type Booking = {
  id: string
  guestName: string
  guestEmail: string
  guestPhone: string
  roomId: string
  roomName: string
  checkIn: string // ISO date string — planned check-in date
  checkOut: string // ISO date string — planned check-out date
  nights: number
  totalAmount: number
  depositPaid: number // 20% of total
  status: BookingStatus
  qrCode: string // unique string used as mock QR data
  bookedAt: string // ISO date string
  paymentMethod: PaymentMethod
  vehiclePlate?: string
  specialRequests?: string // e.g. extra bed, late checkout, preferences
  checkedInAt?: string // ISO datetime — actual moment the receptionist checked the guest in
  checkedOutAt?: string // ISO datetime — actual moment the receptionist checked the guest out
  refundStatus?: RefundStatus // set once a cancelled booking's refund has been reviewed
}

export type StaffRole = "receptionist" | "manager" | "director"

export type AuditLog = {
  id: string
  action: string
  performedBy: string
  role: StaffRole
  timestamp: string
}

export type Notification = {
  id: string
  message: string
  link?: string // in-app path to navigate to when clicked
  read: boolean
  createdAt: string // ISO datetime
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

export type MaintenanceStatus = "open" | "resolved"

export type MaintenanceIssue = {
  id: string
  roomId: string
  roomName: string
  description: string
  reportedBy: string
  reportedAt: string // ISO date string
  status: MaintenanceStatus
  resolvedAt?: string // ISO date string
}

export type PromoCode = {
  id: string
  code: string
  discountPercent: number
  active: boolean
  createdAt: string // ISO date string
}
