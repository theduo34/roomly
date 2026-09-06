"use client"

import Link from "next/link"
import { HeartIcon } from "@phosphor-icons/react/ssr"
import { useSavedRooms } from "@/features/public/saved/hooks/use-saved-rooms"

export function SavedNavLink() {
  const { savedIds } = useSavedRooms()

  return (
    <Link
      href="/saved"
      className="flex items-center gap-1.5 rounded-full border border-border px-4 py-1.5 font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
    >
      <span className="relative flex items-center">
        <HeartIcon weight={savedIds.length > 0 ? "fill" : "regular"} className="size-4" />
        {savedIds.length > 0 && (
          <span className="absolute -top-2 -right-2 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
            {savedIds.length}
          </span>
        )}
      </span>
      <span className="hidden sm:inline">Saved</span>
    </Link>
  );
}
