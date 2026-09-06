import { notFound } from "next/navigation"
import { RoomPhotoGallery } from "@/components/shared/room-photo-gallery"
import { rooms } from "@/lib/mock-data"

export default async function RoomPhotosPage(props: PageProps<"/rooms/[id]/photos">) {
  const { id } = await props.params;
  const room = rooms.find((r) => r.id === id);

  if (!room) notFound();

  return (
    <div className="mx-auto w-full max-w-[1440px] px-6 py-8">
      <RoomPhotoGallery room={room} />
    </div>
  );
}
