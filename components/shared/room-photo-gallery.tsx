import Image from "next/image"
import { BackButton } from "@/components/shared/back-button"
import { cn } from "@/lib/utils"
import type { Room, RoomImage } from "@/lib/types"

const categoryBlurbs: Record<string, string> = {
  Bedroom: "Where you'll sleep — bedding, layout, and lighting.",
  Bathroom: "The en-suite bathroom and its fittings.",
  Lounge: "The seating and living space in the room.",
  View: "What you'll see from the window.",
}

const MAX_PER_CATEGORY = 4

function groupByCategory(images: RoomImage[]): [string, RoomImage[]][] {
  const map = new Map<string, RoomImage[]>()
  for (const image of images) {
    const existing = map.get(image.category)
    if (existing) existing.push(image)
    else map.set(image.category, [image])
  }
  return [...map.entries()]
}

/** A single photo fills the whole space; two or more divide it into a row/column grid, capped at 4 per category. */
function CategoryPhotos({ roomName, category, images }: { roomName: string; category: string; images: RoomImage[] }) {
  const capped = images.slice(0, MAX_PER_CATEGORY)

  if (capped.length <= 1) {
    const image = capped[0]
    if (!image) return null
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-xl">
        <Image
          src={image.url}
          alt={`${roomName} — ${category}`}
          fill
          sizes="(min-width: 1024px) 66vw, 100vw"
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {capped.map((image, index) => {
        const isLastOdd = capped.length % 2 === 1 && index === capped.length - 1
        return (
          <div
            key={index}
            className={cn("relative aspect-video overflow-hidden rounded-xl", isLastOdd && "col-span-2")}
          >
            <Image
              src={image.url}
              alt={`${roomName} — ${category} ${index + 1}`}
              fill
              sizes={isLastOdd ? "(min-width: 1024px) 66vw, 100vw" : "(min-width: 1024px) 33vw, 50vw"}
              className="object-cover"
            />
          </div>
        );
      })}
    </div>
  );
}

/**
 * Every photo the room has, organized by category — shared between the guest and staff room pages.
 * `showBackLink` should stay off on the staff side, where the dashboard header already has a back button.
 */
export function RoomPhotoGallery({
  room,
  showBackLink = true,
}: {
  room: Room
  showBackLink?: boolean
}) {
  const categories = groupByCategory(room.images)

  return (
    <div className="flex flex-col gap-8">
      {showBackLink && <BackButton />}

      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">{room.name} — All photos</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {room.images.length} photo{room.images.length === 1 ? "" : "s"} · {categories.length} categor
          {categories.length === 1 ? "y" : "ies"}
        </p>
      </div>

      {categories.map(([category, images]) => (
        <div
          key={category}
          className="grid grid-cols-1 gap-6 border-t border-border pt-8 first:border-0 first:pt-0 lg:grid-cols-3"
        >
          <div>
            <h2 className="font-heading text-lg font-semibold text-foreground">{category}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {categoryBlurbs[category] ?? `${category} views of ${room.name}.`}
            </p>
          </div>
          <div className="lg:col-span-2">
            <CategoryPhotos roomName={room.name} category={category} images={images} />
          </div>
        </div>
      ))}
    </div>
  );
}
