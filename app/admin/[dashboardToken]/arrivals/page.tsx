import { RoleGate } from "@/features/protected/dashboard/components/role-gate"
import { ArrivalsView } from "@/features/protected/receptionist/components/arrivals-view"

export default function ArrivalsPage() {
  return (
    <RoleGate allow={["receptionist"]}>
      <ArrivalsView />
    </RoleGate>
  );
}
