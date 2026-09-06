import { auditLog } from "@/lib/mock-data"
import type { AuditLog } from "@/lib/types"

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
}: {
  entries?: AuditLog[]
  title?: string
}) {
  const rows = [...(entries ?? auditLog)].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h2 className="font-heading text-base font-semibold text-foreground">{title}</h2>
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
            {rows.map((entry) => (
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
    </div>
  );
}
