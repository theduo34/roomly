import { RoleGate } from "@/features/protected/dashboard/components/role-gate"
import { GuestsDirectory } from "@/features/protected/guests/components/guests-directory"

export default function GuestsPage() {
  return (
    <RoleGate allow={["receptionist", "manager", "director"]}>
      <GuestsDirectory />
    </RoleGate>
  );
}
