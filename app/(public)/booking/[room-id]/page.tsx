import { notFound } from "next/navigation"
import { BookingForm } from "@/features/public/booking/components/booking-form"
import { StatusBadge } from "@/components/shared/status-badge"
import { BackButton } from "@/components/shared/back-button"
import { rooms } from "@/lib/mock-data"
import { formatCurrency } from "@/lib/utils"

export default async function BookingPage(props: PageProps<"/booking/[room-id]">) {
  const { "room-id": roomId } = await props.params;
  const room = rooms.find((r) => r.id === roomId);

  if (!room) notFound();

  return (
    <div className="mx-auto w-full max-w-[1440px] px-6 py-8">
      <div className="mb-6">
        <BackButton />
      </div>

      <div className="mb-6">
        <h1 className="font-heading text-3xl font-semibold text-foreground">Checkout</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review your stay and our policies before you pay the deposit.
        </p>
      </div>

      {room.status === "available" ? (
        <BookingForm room={room} />
      ) : (
        <div className="max-w-xl">
          <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
            <div>
              <p className="font-heading font-semibold text-foreground">{room.name}</p>
              <p className="text-sm text-muted-foreground">{formatCurrency(room.price)} / night</p>
            </div>
            <StatusBadge status={room.status} audience="guest" />
          </div>
          <p className="mt-8 rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            This room isn&apos;t available for booking right now.
          </p>
        </div>
      )}
    </div>
  );
}
