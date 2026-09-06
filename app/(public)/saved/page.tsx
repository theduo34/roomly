import Link from "next/link"
import { ArrowRightIcon } from "@phosphor-icons/react/ssr"
import { SavedRoomsList } from "@/features/public/saved/components/saved-rooms-list"

export default function SavedPage() {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-6 py-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-semibold text-foreground">Saved rooms</h1>
          <p className="mt-2 text-sm text-muted-foreground">Rooms you&apos;ve saved for later.</p>
        </div>
        <Link
          href="/rooms"
          className="flex shrink-0 items-center gap-1 text-sm font-medium text-foreground hover:text-primary"
        >
          Browse all rooms
          <ArrowRightIcon className="size-4" />
        </Link>
      </div>

      <div className="mt-6">
        <SavedRoomsList />
      </div>
    </div>
  );
}
