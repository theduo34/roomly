"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import useEmblaCarousel from "embla-carousel-react"
import { CaretLeftIcon, CaretRightIcon, CheckCircleIcon, UsersIcon } from "@phosphor-icons/react/ssr"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/shared/status-badge"
import { SaveButton } from "@/components/shared/save-button"
import { BackButton } from "@/components/shared/back-button"
import { HotelLocationMap } from "@/components/shared/hotel-location-map"
import { RoomReviews } from "@/features/public/rooms/components/room-reviews"
import { cn, formatCurrency } from "@/lib/utils"
import type { Room } from "@/lib/types"

const typeLabels: Record<Room["type"], string> = {
  standard: "Standard",
  deluxe: "Deluxe",
  suite: "Suite",
  executive: "Executive",
}

function RoomCarousel({ room }: { room: Room }) {
  const { images, name } = room
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: images.length > 1 })
  const [selectedIndex, setSelectedIndex] = useState(0)

  const onSelect = useCallback(() => {
    if (emblaApi) setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    // Seed the index from embla's imperative API before subscribing to changes
    // eslint-disable-next-line react-hooks/set-state-in-effect
    onSelect()
    emblaApi.on("select", onSelect)
    return () => {
      emblaApi.off("select", onSelect)
    }
  }, [emblaApi, onSelect])

  return (
    <div className="relative overflow-hidden rounded-xl border border-border">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {images.map((src, index) => (
            <div key={src} className="relative aspect-4/3 min-w-0 flex-[0_0_100%]">
              <Image
                src={src}
                alt={`${name} photo ${index + 1}`}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
                priority={index === 0}
              />
            </div>
          ))}
        </div>
      </div>
      <SaveButton roomId={room.id} />
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => emblaApi?.scrollPrev()}
            aria-label="Previous photo"
            className="absolute top-1/2 left-3 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm hover:bg-background"
          >
            <CaretLeftIcon className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => emblaApi?.scrollNext()}
            aria-label="Next photo"
            className="absolute top-1/2 right-3 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm hover:bg-background"
          >
            <CaretRightIcon className="size-4" />
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((src, index) => (
              <span
                key={src}
                className={cn(
                  "size-1.5 rounded-full bg-background/70",
                  index === selectedIndex && "bg-primary"
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function RoomDetail({ room }: { room: Room }) {
  const isAvailable = room.status === "available"

  return (
    <div>
      <div className="mb-6">
        <BackButton />
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <RoomCarousel room={room} />
        <div className="flex flex-col gap-6">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="font-heading text-3xl font-semibold text-foreground">{room.name}</h1>
                <p className="mt-1 text-sm text-muted-foreground">{typeLabels[room.type]}</p>
              </div>
              <StatusBadge status={room.status} audience="guest" />
            </div>
            <p className="mt-4 text-2xl font-semibold text-foreground">
              {formatCurrency(room.price)}
              <span className="text-base font-normal text-muted-foreground"> / night</span>
            </p>
          </div>

          <p className="text-foreground">{room.description}</p>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <UsersIcon className="size-4" />
            Sleeps {room.capacity}
          </div>

          <div>
            <h2 className="font-heading text-base font-semibold text-foreground">Amenities</h2>
            <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {room.amenities.map((amenity) => (
                <li key={amenity} className="flex items-center gap-2 text-sm text-foreground">
                  <CheckCircleIcon className="size-4 text-primary" />
                  {amenity}
                </li>
              ))}
            </ul>
          </div>

          {isAvailable ? (
            <Button asChild className="mt-2 h-14 w-full text-base">
              <Link href={`/booking/${room.id}`}>Book Now</Link>
            </Button>
          ) : (
            <Button variant="secondary" disabled className="mt-2 h-14 w-full text-base">
              Not available right now
            </Button>
          )}
        </div>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-10 border-t border-border pt-10 lg:grid-cols-2">
        <div className="flex h-full flex-col">
          <h2 className="font-heading text-base font-semibold text-foreground">Reviews</h2>
          <div className="mt-4">
            <RoomReviews roomId={room.id} />
          </div>
        </div>

        <div className="flex h-full flex-col">
          <h2 className="font-heading text-base font-semibold text-foreground">Location</h2>
          <div className="mt-4 flex flex-1 flex-col">
            <HotelLocationMap />
          </div>
        </div>
      </div>
    </div>
  );
}
