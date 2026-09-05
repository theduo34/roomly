export default async function BookingPage(props: PageProps<"/booking/[room-id]">) {
  const { "room-id": roomId } = await props.params;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-16">
      <h1 className="text-3xl font-semibold text-foreground">Book room {roomId}</h1>
      <p className="mt-2 text-sm text-muted-foreground">Booking form goes here.</p>
    </div>
  );
}
