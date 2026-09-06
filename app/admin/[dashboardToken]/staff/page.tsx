import { RoleGate } from "@/features/protected/dashboard/components/role-gate"
import { StaffDirectory } from "@/features/protected/staff/components/staff-directory"

export default function StaffPage() {
  return (
    <RoleGate allow={["manager", "director"]}>
      <StaffDirectory />
    </RoleGate>
  );
}
