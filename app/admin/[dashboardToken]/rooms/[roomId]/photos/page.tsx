import { RoleGate } from "@/features/protected/dashboard/components/role-gate"
import { RoomPhotosView } from "@/features/protected/rooms/components/room-photos-view"

export default function RoomPhotosPage() {
  return (
    <RoleGate allow={["receptionist", "manager", "director"]}>
      <RoomPhotosView />
    </RoleGate>
  );
}
