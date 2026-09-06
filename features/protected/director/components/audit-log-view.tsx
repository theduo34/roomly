"use client"

import { useMemo, useState } from "react"
import { MagnifyingGlassIcon } from "@phosphor-icons/react/ssr"
import { Input } from "@/components/ui/input"
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
  const [query, setQuery] = useState("")
  const auditLog = useAuditLog()

  const entries = useMemo(() => {
    const q = query.trim().toLowerCase()
    return auditLog
      .filter((entry) => role === "all" || entry.role === role)
      .filter((entry) => !q || `${entry.action} ${entry.performedBy}`.toLowerCase().includes(q))
  }, [role, query, auditLog])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by action or staff name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
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
      </div>

      <AuditLogTable entries={entries} paginate />
    </div>
  );
}
