import { RoleGate } from "@/features/protected/dashboard/components/role-gate"
import { BookingsView } from "@/features/protected/manager/components/bookings-view"

export default function BookingsPage() {
  return (
    <RoleGate allow={["manager", "director"]}>
      <BookingsView />
    </RoleGate>
  );
}
