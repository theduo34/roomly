"use client"

import { useState } from "react"
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react/ssr"
import { auditLog } from "@/lib/mock-data"
import type { AuditLog } from "@/lib/types"

const PAGE_SIZE = 8

const roleLabels: Record<string, string> = {
  receptionist: "Receptionist",
  manager: "Manager",
  director: "Director",
}

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

export function AuditLogTable({
  entries,
  title = "Audit trail",
  paginate = false,
}: {
  entries?: AuditLog[]
  title?: string
  paginate?: boolean
}) {
  const [page, setPage] = useState(0)

  const rows = [...(entries ?? auditLog)].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  const pageSize = paginate ? PAGE_SIZE : rows.length
  const totalPages = paginate ? Math.max(1, Math.ceil(rows.length / pageSize)) : 1
  const currentPage = Math.min(page, totalPages - 1)
  const pageRows = paginate ? rows.slice(currentPage * pageSize, currentPage * pageSize + pageSize) : rows

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-base font-semibold text-foreground">{title}</h2>
        {paginate && <span className="text-xs text-muted-foreground">{rows.length} entries</span>}
      </div>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">No activity matches this filter.</p>
      ) : (
        <>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground uppercase">
                  <th className="pb-2 font-medium">Action</th>
                  <th className="pb-2 font-medium">By</th>
                  <th className="pb-2 font-medium">Role</th>
                  <th className="pb-2 font-medium">When</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((entry) => (
                  <tr key={entry.id} className="border-b border-border last:border-0">
                    <td className="py-3 pr-4 text-foreground">{entry.action}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{entry.performedBy}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{roleLabels[entry.role]}</td>
                    <td className="py-3 text-muted-foreground">{formatTimestamp(entry.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {paginate && totalPages > 1 && (
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
        </>
      )}
    </div>
  );
}
