import { RoomCard } from "@/components/shared/room-card"
import type { Room } from "@/lib/types"

export function RoomGrid({ rooms }: { rooms: Room[] }) {
  if (rooms.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        No rooms match that filter right now.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
      {rooms.map((room) => (
        <RoomCard key={room.id} room={room} />
      ))}
    </div>
  );
}
