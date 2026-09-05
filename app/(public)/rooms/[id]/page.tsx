export default async function RoomDetailPage(props: PageProps<"/rooms/[id]">) {
  const { id } = await props.params;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-16">
      <h1 className="text-3xl font-semibold text-foreground">Room {id}</h1>
      <p className="mt-2 text-sm text-muted-foreground">Room detail and carousel go here.</p>
    </div>
  );
}
