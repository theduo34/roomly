"use client"

import Link from "next/link"
import { RoomGrid } from "@/features/public/rooms/components/room-grid"
import { useSavedRooms } from "@/features/public/saved/hooks/use-saved-rooms"
import { rooms } from "@/lib/mock-data"

export function SavedRoomsList() {
  const { savedIds } = useSavedRooms()
  const savedRooms = rooms.filter((room) => savedIds.includes(room.id))

  if (savedRooms.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-muted-foreground">You haven&apos;t saved any rooms yet.</p>
        <Link href="/rooms" className="text-sm font-medium text-primary hover:underline">
          Browse rooms
        </Link>
      </div>
    );
  }

  return <RoomGrid rooms={savedRooms} />;
}
