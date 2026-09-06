import { RoleGate } from "@/features/protected/dashboard/components/role-gate"
import { VehicleLog } from "@/features/protected/receptionist/components/vehicle-log"

export default function VehicleLogPage() {
  return (
    <RoleGate allow={["receptionist", "manager", "director"]}>
      <VehicleLog />
    </RoleGate>
  );
}
