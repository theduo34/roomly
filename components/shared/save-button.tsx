"use client"

import { HeartIcon } from "@phosphor-icons/react/ssr"
import { useSavedRooms } from "@/features/public/saved/hooks/use-saved-rooms"
import { cn } from "@/lib/utils"

export function SaveButton({ roomId }: { roomId: string }) {
  const { isSaved, toggle } = useSavedRooms()
  const saved = isSaved(roomId)

  function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    toggle(roomId)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={saved ? "Remove from saved rooms" : "Save room"}
      aria-pressed={saved}
      className="absolute top-3 right-3 z-10 flex size-8 items-center justify-center rounded-full bg-foreground/40 text-background backdrop-blur-sm transition-transform hover:scale-110"
    >
      <HeartIcon weight={saved ? "fill" : "bold"} className={cn("size-4", saved && "text-primary")} />
    </button>
  );
}
