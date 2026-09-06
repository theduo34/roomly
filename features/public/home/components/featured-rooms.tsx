import Link from "next/link"
import { ArrowRightIcon } from "@phosphor-icons/react/ssr"
import { RoomGrid } from "@/features/public/rooms/components/room-grid"
import { rooms } from "@/lib/mock-data"

export function FeaturedRooms() {
  const featured = [...rooms].sort((a, b) => b.rating - a.rating).slice(0, 4)

  return (
    <section className="mx-auto w-full max-w-[1440px] px-6 pb-14">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-semibold text-foreground">Guest favourites</h2>
          <p className="mt-1 text-sm text-muted-foreground">Our highest-rated rooms, ready to book.</p>
        </div>
        <Link
          href="/rooms"
          className="flex shrink-0 items-center gap-1 text-sm font-medium text-foreground hover:text-primary"
        >
          See all rooms
          <ArrowRightIcon className="size-4" />
        </Link>
      </div>
      <div className="mt-6">
        <RoomGrid rooms={featured} />
      </div>
    </section>
  );
}
