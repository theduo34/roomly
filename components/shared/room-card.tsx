import Image from "next/image"
import Link from "next/link"
import { StarIcon, UsersIcon } from "@phosphor-icons/react/ssr"
import { SaveButton } from "@/components/shared/save-button"
import { StatusBadge } from "@/components/shared/status-badge"
import { formatCurrency } from "@/lib/utils"
import type { Room } from "@/lib/types"

const typeLabels: Record<Room["type"], string> = {
  standard: "Standard",
  deluxe: "Deluxe",
  suite: "Suite",
  executive: "Executive",
}

export function RoomCard({ room }: { room: Room }) {
  return (
    <Link href={`/rooms/${room.id}`} className="group block">
      <div className="relative aspect-square w-full overflow-hidden rounded-xl">
        <Image
          src={room.images[0].url}
          alt={room.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3">
          <StatusBadge status={room.status} audience="guest" />
        </div>
        <SaveButton roomId={room.id} />
      </div>

      <div className="mt-3 flex items-start justify-between gap-2">
        <h3 className="font-heading font-semibold text-foreground">{room.name}</h3>
        <div className="flex shrink-0 items-center gap-1 text-sm text-foreground">
          <StarIcon weight="fill" className="size-3.5 text-primary" />
          {room.rating.toFixed(2)}
        </div>
      </div>
      <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
        {typeLabels[room.type]}
        <span aria-hidden>·</span>
        <UsersIcon className="size-3.5" />
        Sleeps {room.capacity}
      </p>
      <p className="mt-1.5 text-sm text-foreground">
        <span className="font-semibold">{formatCurrency(room.price)}</span>
        <span className="text-muted-foreground"> / night</span>
      </p>
    </Link>
  );
}
