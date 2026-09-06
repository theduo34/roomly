import { RoleGate } from "@/features/protected/dashboard/components/role-gate"
import { BookingAnalytics } from "@/features/protected/manager/components/booking-analytics"

export default function AnalyticsPage() {
  return (
    <RoleGate allow={["manager", "director"]}>
      <BookingAnalytics />
    </RoleGate>
  );
}
