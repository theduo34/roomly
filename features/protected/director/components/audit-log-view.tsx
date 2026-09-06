"use client"

import { useMemo, useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AuditLogTable } from "@/features/protected/director/components/audit-log-table"
import { useAuditLog } from "@/features/protected/dashboard/hooks/use-audit-log"
import type { StaffRole } from "@/lib/types"

const roleFilters: { value: StaffRole | "all"; label: string }[] = [
  { value: "all", label: "All roles" },
  { value: "receptionist", label: "Receptionist" },
  { value: "manager", label: "Manager" },
  { value: "director", label: "Director" },
]

export function AuditLogView() {
  const [role, setRole] = useState<StaffRole | "all">("all")
  const auditLog = useAuditLog()

  const entries = useMemo(
    () => (role === "all" ? auditLog : auditLog.filter((entry) => entry.role === role)),
    [role, auditLog]
  )

  return (
    <div className="flex flex-col gap-4">
      <Select value={role} onValueChange={(value) => setRole(value as StaffRole | "all")}>
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {roleFilters.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <AuditLogTable entries={entries} />
    </div>
  );
}
