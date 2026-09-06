import { RoleGate } from "@/features/protected/dashboard/components/role-gate"
import { RefundsPromosView } from "@/features/protected/manager/components/refunds-promos-view"

export default function RefundsPage() {
  return (
    <RoleGate allow={["manager", "director"]}>
      <RefundsPromosView />
    </RoleGate>
  );
}
