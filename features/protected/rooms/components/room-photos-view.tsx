"use client"

import { useParams } from "next/navigation"
import { RoomPhotoGallery } from "@/components/shared/room-photo-gallery"
import { useRooms } from "@/features/protected/rooms/hooks/use-rooms"

export function RoomPhotosView() {
  const { roomId } = useParams<{ dashboardToken: string; roomId: string }>()
  const rooms = useRooms()
  const room = rooms.find((r) => r.id === roomId)

  if (!room) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm text-muted-foreground">We couldn&apos;t find that room.</p>
      </div>
    );
  }

  return <RoomPhotoGallery room={room} showBackLink={false} />;
}
