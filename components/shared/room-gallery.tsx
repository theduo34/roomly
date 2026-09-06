import Image from "next/image"
import Link from "next/link"
import { ImagesIcon } from "@phosphor-icons/react/ssr"
import type { Room } from "@/lib/types"

/**
 * One big hero photo on the left, a handful of smaller shots on the right stacked to the
 * same combined height, and a "See all photos" tile that always occupies the last cell so
 * it works the same whether the room has 4 photos or 40 — full gallery lives at `photosHref`.
 * Shared between the guest-facing room page and the staff room detail page.
 */
export function RoomGallery({
  room,
  photosHref,
  priority = false,
}: {
  room: Room
  photosHref: string
  priority?: boolean
}) {
  const [hero, ...rest] = room.images
  const sideImages = rest.slice(0, 3)

  return (
    <div className="grid aspect-[16/9] grid-cols-4 grid-rows-2 gap-1.5 overflow-hidden rounded-xl">
      {hero && (
        <div className="relative col-span-2 row-span-2 overflow-hidden">
          <Image
            src={hero.url}
            alt={`${room.name} — ${hero.category}`}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
            priority={priority}
          />
        </div>
      )}

      {sideImages.map((image, index) => (
        <div key={index} className="relative col-span-1 row-span-1 overflow-hidden">
          <Image
            src={image.url}
            alt={`${room.name} — ${image.category}`}
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="object-cover"
          />
        </div>
      ))}

      <Link
        href={photosHref}
        className="col-span-1 row-span-1 flex flex-col items-center justify-center gap-1 bg-secondary text-secondary-foreground transition-colors hover:bg-secondary/70"
      >
        <ImagesIcon size={18} />
        <span className="text-center text-xs leading-tight font-medium">See all photos</span>
      </Link>
    </div>
  );
}
