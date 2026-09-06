"use client"

import { DownloadSimpleIcon } from "@phosphor-icons/react/ssr"
import { useAuditLog } from "@/features/protected/dashboard/hooks/use-audit-log"
import { useLocalBookings } from "@/features/protected/dashboard/hooks/use-local-bookings"
import { useRooms } from "@/features/protected/rooms/hooks/use-rooms"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import type { Booking, Room, RoomType } from "@/lib/types"

const REFUND_RATE = 0.05
const PENALTY_RATE = 0.02

const roomTypeLabels: Record<RoomType, string> = {
  standard: "Standard",
  deluxe: "Deluxe",
  suite: "Suite",
  executive: "Executive",
}

function buildReport(bookings: Booking[], rooms: Room[], auditLog: ReturnType<typeof useAuditLog>) {
  const activeBookings = bookings.filter((b) => b.status !== "cancelled")
  const collected = activeBookings.reduce((sum, b) => sum + b.depositPaid, 0)
  const refunds = Math.round(collected * REFUND_RATE)
  const penalties = Math.round(collected * PENALTY_RATE)
  const netRevenue = collected - refunds + penalties

  const roomsById = new Map(rooms.map((r) => [r.id, r]))
  const typeCounts = new Map<RoomType, number>()
  for (const booking of bookings) {
    const type = roomsById.get(booking.roomId)?.type
    if (!type) continue
    typeCounts.set(type, (typeCounts.get(type) ?? 0) + 1)
  }
  const topRoomTypes = (Object.keys(roomTypeLabels) as RoomType[])
    .map((type) => ({ label: roomTypeLabels[type], count: typeCounts.get(type) ?? 0 }))
    .sort((a, b) => b.count - a.count)

  const statusCounts = {
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    checked_in: bookings.filter((b) => b.status === "checked_in").length,
    checked_out: bookings.filter((b) => b.status === "checked_out").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  }

  const recentActivity = [...auditLog]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10)

  return [
    "Roomly — Performance report",
    `Generated: ${new Date().toLocaleString()}`,
    "",
    "Financial overview (all time)",
    `- Revenue collected: ${formatCurrency(collected)}`,
    `- Refunds: ${formatCurrency(refunds)}`,
    `- Penalties: ${formatCurrency(penalties)}`,
    `- Net revenue: ${formatCurrency(netRevenue)}`,
    "",
    "Occupancy overview",
    `- Total rooms: ${rooms.length}`,
    ...(["available", "occupied", "reserved", "needs_cleaning", "maintenance"] as const).map(
      (status) => `- ${status.replace("_", " ")}: ${rooms.filter((r) => r.status === status).length}`
    ),
    "",
    "Bookings by status",
    `- Confirmed: ${statusCounts.confirmed}`,
    `- Checked in: ${statusCounts.checked_in}`,
    `- Checked out: ${statusCounts.checked_out}`,
    `- Cancelled: ${statusCounts.cancelled}`,
    "",
    "Most booked room types",
    ...topRoomTypes.map((row) => `- ${row.label}: ${row.count}`),
    "",
    "Recent activity",
    ...recentActivity.map((entry) => `- ${formatDateTime(entry.timestamp)} — ${entry.action} (${entry.performedBy})`),
  ].join("\n")
}

export function ExportReportButton() {
  const bookings = useLocalBookings()
  const rooms = useRooms()
  const auditLog = useAuditLog()

  function download() {
    const content = buildReport(bookings, rooms, auditLog)
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `roomly-performance-report-${new Date().toISOString().slice(0, 10)}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button
      type="button"
      onClick={download}
      className="flex items-center gap-1.5 rounded-full border border-border px-3.5 py-2 text-sm font-medium text-foreground hover:bg-muted"
    >
      <DownloadSimpleIcon size={16} />
      Export report
    </button>
  );
}
