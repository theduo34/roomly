import { RoleGate } from "@/features/protected/dashboard/components/role-gate"
import { GuestDetailView } from "@/features/protected/guests/components/guest-detail-view"

export default function GuestDetailPage() {
  return (
    <RoleGate allow={["receptionist", "manager", "director"]}>
      <GuestDetailView />
    </RoleGate>
  );
}
