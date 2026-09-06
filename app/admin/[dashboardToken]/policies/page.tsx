import { RoleGate } from "@/features/protected/dashboard/components/role-gate"
import { PolicySettings } from "@/features/protected/director/components/policy-settings"

export default function PoliciesPage() {
  return (
    <RoleGate allow={["director"]}>
      <PolicySettings />
    </RoleGate>
  );
}
