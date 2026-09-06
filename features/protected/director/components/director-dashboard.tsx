"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowRightIcon } from "@phosphor-icons/react/ssr"
import { ManagerDashboard } from "@/features/protected/manager/components/manager-dashboard"
import { AuditLogTable } from "@/features/protected/director/components/audit-log-table"
import { ExportReportButton } from "@/features/protected/director/components/export-report-button"
import { useAuditLog } from "@/features/protected/dashboard/hooks/use-audit-log"

export function DirectorDashboard() {
  const { dashboardToken } = useParams<{ dashboardToken: string }>()
  const auditLog = useAuditLog()
  const recentActivity = [...auditLog]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 4)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <ExportReportButton />
      </div>
      <ManagerDashboard />
      <div className="flex flex-col gap-3">
        <AuditLogTable entries={recentActivity} title="Recent activity" />
        <Link
          href={`/admin/${dashboardToken}/audit`}
          className="flex w-fit items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          View full audit trail
          <ArrowRightIcon className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}
