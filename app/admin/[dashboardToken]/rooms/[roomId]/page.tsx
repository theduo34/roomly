import { RoleGate } from "@/features/protected/dashboard/components/role-gate"
import { RoomDetailView } from "@/features/protected/rooms/components/room-detail-view"

export default function RoomDetailPage() {
  return (
    <RoleGate allow={["receptionist", "manager", "director"]}>
      <RoomDetailView />
    </RoleGate>
  );
}
