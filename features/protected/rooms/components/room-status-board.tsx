"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import {
  CaretLeftIcon,
  CaretRightIcon,
  MagnifyingGlassIcon,
  StarIcon,
  UsersIcon,
} from "@phosphor-icons/react/ssr"
import { StatusBadge } from "@/components/shared/status-badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDashboardRole } from "@/features/protected/dashboard/context/role-context"
import { useRooms } from "@/features/protected/rooms/hooks/use-rooms"
import { useStaffName } from "@/features/auth/hooks/use-role"
import { appendAuditLog } from "@/lib/audit-log-store"
import { setRoomStatus } from "@/lib/room-status-store"
import { cn, formatCurrency } from "@/lib/utils"
import type { Room, RoomStatus } from "@/lib/types"

const PAGE_SIZE = 6

const statusOptions: { value: RoomStatus; label: string }[] = [
  { value: "available", label: "Available" },
  { value: "reserved", label: "Reserved" },
  { value: "occupied", label: "Occupied" },
  { value: "needs_cleaning", label: "Needs cleaning" },
  { value: "maintenance", label: "Maintenance" },
]

const filterOptions: { value: "all" | RoomStatus; label: string }[] = [
  { value: "all", label: "All" },
  ...statusOptions,
]

function RoomCard({
  room,
  dashboardToken,
  editable,
  onStatusChange,
}: {
  room: Room
  dashboardToken: string
  editable: boolean
  onStatusChange: (status: RoomStatus) => void
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md">
      <Link href={`/admin/${dashboardToken}/rooms/${room.id}`} className="group block">
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          <Image
            src={room.images[0].url}
            alt={room.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute top-2 left-2">
            <StatusBadge status={room.status} />
          </div>
        </div>

        <div className="flex flex-col gap-3 p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{room.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{room.type}</p>
            </div>
            <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-foreground">
              <StarIcon size={12} weight="fill" className="text-primary" />
              {room.rating.toFixed(1)}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <UsersIcon size={12} />
              Sleeps {room.capacity}
            </span>
            <span className="font-semibold text-foreground">{formatCurrency(room.price)}/night</span>
          </div>
        </div>
      </Link>

      {editable && (
        <div className="border-t border-border p-3 pt-2.5">
          <Select value={room.status} onValueChange={(value) => onStatusChange(value as RoomStatus)}>
            <SelectTrigger size="sm" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}

export function RoomStatusBoard() {
  const { dashboardToken } = useParams<{ dashboardToken: string }>()
  const rooms = useRooms()
  const role = useDashboardRole()
  const staffName = useStaffName()
  const editable = role === "receptionist"
  const [statusFilter, setStatusFilter] = useState<"all" | RoomStatus>("all")
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(0)

  function handleStatusChange(roomId: string, roomName: string, status: RoomStatus) {
    setRoomStatus(roomId, status)
    const label = statusOptions.find((o) => o.value === status)?.label.toLowerCase()
    appendAuditLog({
      action: `Marked ${roomName} as ${label}`,
      performedBy: staffName || "Receptionist",
      role: "receptionist",
      link: `/admin/${dashboardToken}/rooms/${roomId}`,
    })
    toast.success(`${roomName} marked as ${label}.`)
  }

  const trimmedQuery = query.trim().toLowerCase()
  const filteredRooms = rooms
    .filter((r) => statusFilter === "all" || r.status === statusFilter)
    .filter(
      (r) =>
        !trimmedQuery ||
        r.name.toLowerCase().includes(trimmedQuery) ||
        r.id.toLowerCase().includes(trimmedQuery) ||
        r.type.toLowerCase().includes(trimmedQuery)
    )
  const totalPages = Math.max(1, Math.ceil(filteredRooms.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages - 1)
  const pageRooms = filteredRooms.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE)
  const hasActiveFilters = trimmedQuery !== "" || statusFilter !== "all"

  function clearFilters() {
    setQuery("")
    setStatusFilter("all")
    setPage(0)
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-base font-semibold text-foreground">Room status board</h2>
        <span className="text-xs text-muted-foreground">{filteredRooms.length} rooms</span>
      </div>

      <div className="relative mt-4 max-w-sm">
        <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by room name or code…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setPage(0)
          }}
          className="pl-9"
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => {
              setStatusFilter(option.value)
              setPage(0)
            }}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
              option.value === statusFilter
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {pageRooms.length === 0 ? (
        <div className="mt-4 flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-12 text-center">
          <span className="flex size-10 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <MagnifyingGlassIcon size={18} />
          </span>
          <p className="text-sm font-medium text-foreground">No rooms found</p>
          <p className="max-w-xs text-xs text-muted-foreground">
            Try a different name, code, or status filter.
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-1 text-xs font-medium text-primary hover:underline"
            >
              Clear search & filters
            </button>
          )}
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {pageRooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              dashboardToken={dashboardToken}
              editable={editable}
              onStatusChange={(status) => handleStatusChange(room.id, room.name, status)}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
          <span className="text-xs text-muted-foreground">
            Page {currentPage + 1} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="flex size-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
              aria-label="Previous page"
            >
              <CaretLeftIcon size={14} />
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage >= totalPages - 1}
              className="flex size-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
              aria-label="Next page"
            >
              <CaretRightIcon size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
