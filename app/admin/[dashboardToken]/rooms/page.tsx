import { RoleGate } from "@/features/protected/dashboard/components/role-gate"
import { RoomsView } from "@/features/protected/rooms/components/rooms-view"

export default function RoomsPage() {
  return (
    <RoleGate allow={["receptionist", "manager", "director"]}>
      <RoomsView />
    </RoleGate>
  );
}
