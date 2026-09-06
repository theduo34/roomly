import Image from "next/image"
import Link from "next/link"
import { rooms } from "@/lib/mock-data"
import type { RoomType } from "@/lib/types"

const typeOrder: { value: RoomType; label: string }[] = [
  { value: "standard", label: "Standard" },
  { value: "deluxe", label: "Deluxe" },
  { value: "suite", label: "Suite" },
  { value: "executive", label: "Executive" },
]

export function RoomTypes() {
  const tiles = typeOrder.map(({ value, label }) => {
    const matches = rooms.filter((room) => room.type === value)
    return { value, label, count: matches.length, image: matches[0]?.images[0]?.url }
  })

  return (
    <section className="mx-auto w-full max-w-[1440px] px-6 pb-14">
      <h2 className="font-heading text-2xl font-semibold text-foreground">Browse by room type</h2>
      <p className="mt-1 text-sm text-muted-foreground">Find the right fit, from a quiet standard to a full suite.</p>
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map(
          (tile) =>
            tile.image && (
              <Link
                key={tile.value}
                href={`/rooms?type=${tile.value}`}
                className="group relative flex aspect-4/3 items-end overflow-hidden rounded-xl"
              >
                <Image
                  src={tile.image}
                  alt={tile.label}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d1b2a]/80 via-[#0d1b2a]/10 to-transparent" />
                <div className="relative p-4">
                  <p className="font-heading font-semibold text-white">{tile.label}</p>
                  <p className="text-sm text-white/80">
                    {tile.count} {tile.count === 1 ? "room" : "rooms"}
                  </p>
                </div>
              </Link>
            )
        )}
      </div>
    </section>
  );
}
