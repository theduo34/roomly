import { notFound } from "next/navigation"
import { RoomDetail } from "@/features/public/rooms/components/room-detail"
import { rooms } from "@/lib/mock-data"

export default async function RoomDetailPage(props: PageProps<"/rooms/[id]">) {
  const { id } = await props.params;
  const room = rooms.find((r) => r.id === id);

  if (!room) notFound();

  return (
    <div className="mx-auto w-full max-w-[1440px] px-6 py-8">
      <RoomDetail room={room} />
    </div>
  );
}
