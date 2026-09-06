import { RoleGate } from "@/features/protected/dashboard/components/role-gate"
import { BookingDetailView } from "@/features/protected/receptionist/components/booking-detail-view"

export default function BookingDetailPage() {
  return (
    <RoleGate allow={["receptionist"]}>
      <BookingDetailView />
    </RoleGate>
  );
}
