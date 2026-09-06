import { cn } from "@/lib/utils"
import type { RoomStatus } from "@/lib/types"

export const roomStatusConfig: Record<RoomStatus, { label: string; className: string; dotColor: string }> = {
  available: {
    label: "Available",
    className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    dotColor: "#16a34a",
  },
  reserved: {
    label: "Reserved",
    className: "bg-primary/10 text-primary",
    dotColor: "var(--primary)",
  },
  occupied: {
    label: "Occupied",
    className: "bg-destructive/10 text-destructive",
    dotColor: "var(--destructive)",
  },
  needs_cleaning: {
    label: "Needs cleaning",
    className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    dotColor: "#9333ea",
  },
  maintenance: {
    label: "Maintenance",
    className: "bg-muted text-muted-foreground",
    dotColor: "var(--muted-foreground)",
  },
}

const staffOnlyStatuses: RoomStatus[] = ["needs_cleaning", "maintenance"]

export function StatusBadge({
  status,
  audience = "staff",
}: {
  status: RoomStatus
  audience?: "guest" | "staff"
}) {
  if (audience === "guest" && staffOnlyStatuses.includes(status)) return null

  const config = roomStatusConfig[status]

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        config.className
      )}
    >
      {config.label}
    </span>
  )
}
