import { RoleGate } from "@/features/protected/dashboard/components/role-gate"
import { MaintenanceTracker } from "@/features/protected/manager/components/maintenance-tracker"

export default function MaintenancePage() {
  return (
    <RoleGate allow={["manager", "director"]}>
      <MaintenanceTracker />
    </RoleGate>
  );
}
