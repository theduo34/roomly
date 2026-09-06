import { Suspense } from "react"
import { RoomFilters } from "@/features/public/rooms/components/room-filters"
import { rooms } from "@/lib/mock-data"

export default function RoomsPage() {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-6 py-8">
      <h1 className="font-heading text-3xl font-semibold text-foreground">Rooms</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Browse every room and find the one that fits your stay.
      </p>
      <div className="mt-6">
        <Suspense>
          <RoomFilters rooms={rooms} />
        </Suspense>
      </div>
    </div>
  );
}
