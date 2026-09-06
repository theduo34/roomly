"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"
import { CaretLeftIcon, CaretRightIcon, CheckCircleIcon, WrenchIcon } from "@phosphor-icons/react/ssr"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LogIssueDialog } from "@/features/protected/manager/components/log-issue-dialog"
import { useMaintenanceIssues } from "@/features/protected/dashboard/hooks/use-maintenance-issues"
import { useRooms } from "@/features/protected/rooms/hooks/use-rooms"
import { useStaffName } from "@/features/auth/hooks/use-role"
import { useDashboardRole } from "@/features/protected/dashboard/context/role-context"
import { appendAuditLog } from "@/lib/audit-log-store"
import { resolveMaintenanceIssue } from "@/lib/maintenance-store"
import { setRoomStatus } from "@/lib/room-status-store"
import { cn, formatDate } from "@/lib/utils"
import type { MaintenanceStatus } from "@/lib/types"

const PAGE_SIZE = 8

const statusStyles: Record<MaintenanceStatus, string> = {
  open: "bg-destructive/10 text-destructive",
  resolved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
}

const statusLabels: Record<MaintenanceStatus, string> = {
  open: "Open",
  resolved: "Resolved",
}

const statusFilters: { value: MaintenanceStatus | "all"; label: string }[] = [
  { value: "all", label: "All issues" },
  { value: "open", label: "Open" },
  { value: "resolved", label: "Resolved" },
]

export function MaintenanceTracker() {
  const issues = useMaintenanceIssues()
  const rooms = useRooms()
  const staffName = useStaffName()
  const role = useDashboardRole()
  const [status, setStatus] = useState<MaintenanceStatus | "all">("open")
  const [page, setPage] = useState(0)

  const sorted = useMemo(
    () =>
      [...issues]
        .filter((issue) => status === "all" || issue.status === status)
        .sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime()),
    [issues, status]
  )

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages - 1)
  const pageIssues = sorted.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE)

  function resolve(issueId: string, roomId: string, roomName: string) {
    resolveMaintenanceIssue(issueId)
    const room = rooms.find((r) => r.id === roomId)
    if (room?.status === "maintenance") setRoomStatus(roomId, "available")
    appendAuditLog({
      action: `Resolved maintenance issue — ${roomName}`,
      performedBy: staffName || "Manager",
      role,
    })
    toast.success(`${roomName} marked as resolved and back in service.`)
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-base font-semibold text-foreground">Maintenance tracker</h2>
        <LogIssueDialog />
      </div>

      <div className="mt-4">
        <Select
          value={status}
          onValueChange={(value) => {
            setStatus(value as MaintenanceStatus | "all")
            setPage(0)
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusFilters.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {pageIssues.length === 0 ? (
        <div className="mt-4 flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-12 text-center">
          <span className="flex size-10 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <WrenchIcon size={18} />
          </span>
          <p className="text-sm font-medium text-foreground">No issues here</p>
          <p className="max-w-xs text-xs text-muted-foreground">Try a different filter, or log a new issue.</p>
        </div>
      ) : (
        <ul className="mt-4 flex flex-col divide-y divide-border">
          {pageIssues.map((issue) => (
            <li key={issue.id} className="flex flex-wrap items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{issue.roomName}</p>
                  <span className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-medium", statusStyles[issue.status])}>
                    {statusLabels[issue.status]}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{issue.description}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Reported by {issue.reportedBy} · {formatDate(issue.reportedAt)}
                  {issue.resolvedAt && ` · Resolved ${formatDate(issue.resolvedAt)}`}
                </p>
              </div>
              {issue.status === "open" && (
                <button
                  type="button"
                  onClick={() => resolve(issue.id, issue.roomId, issue.roomName)}
                  className="flex shrink-0 items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
                >
                  <CheckCircleIcon size={14} />
                  Mark resolved
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
          <span className="text-xs text-muted-foreground">
            Page {currentPage + 1} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="flex size-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
              aria-label="Previous page"
            >
              <CaretLeftIcon size={14} />
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage >= totalPages - 1}
              className="flex size-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
              aria-label="Next page"
            >
              <CaretRightIcon size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
