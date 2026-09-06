"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import {
  BedIcon,
  BriefcaseIcon,
  CrownIcon,
  SquaresFourIcon,
  SparkleIcon,
} from "@phosphor-icons/react/ssr"
import { RoomGrid } from "@/features/public/rooms/components/room-grid"
import { cn } from "@/lib/utils"
import type { Room, RoomType } from "@/lib/types"

type Filter = "all" | RoomType

const filters: { value: Filter; label: string; icon: typeof BedIcon }[] = [
  { value: "all", label: "All rooms", icon: SquaresFourIcon },
  { value: "standard", label: "Standard", icon: BedIcon },
  { value: "deluxe", label: "Deluxe", icon: SparkleIcon },
  { value: "suite", label: "Suite", icon: CrownIcon },
  { value: "executive", label: "Executive", icon: BriefcaseIcon },
]

const filterValues = filters.map((f) => f.value)

export function RoomFilters({ rooms }: { rooms: Room[] }) {
  const searchParams = useSearchParams()
  const [active, setActive] = useState<Filter>("all")

  useEffect(() => {
    const type = searchParams.get("type")
    // Sync the initial filter from a deep link like /rooms?type=suite
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActive(filterValues.includes(type as Filter) ? (type as Filter) : "all")
  }, [searchParams])

  const filtered = useMemo(
    () => (active === "all" ? rooms : rooms.filter((room) => room.type === active)),
    [active, rooms]
  )

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {filters.map(({ value, label, icon: Icon }) => {
          const isActive = value === active
          return (
            <button
              key={value}
              type="button"
              onClick={() => setActive(value)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors",
                isActive
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
              )}
            >
              <Icon className="size-4" />
              {label}
            </button>
          );
        })}
      </div>
      <div className="mt-8">
        <RoomGrid rooms={filtered} />
      </div>
    </div>
  );
}
