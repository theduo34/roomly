import { RoleGate } from "@/features/protected/dashboard/components/role-gate"
import { AuditLogView } from "@/features/protected/director/components/audit-log-view"

export default function AuditPage() {
  return (
    <RoleGate allow={["director"]}>
      <AuditLogView />
    </RoleGate>
  );
}
