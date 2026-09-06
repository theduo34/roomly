"use client"

import { BellIcon } from "@phosphor-icons/react/ssr"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useAuditLog } from "@/features/protected/dashboard/hooks/use-audit-log"

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.round(diffMs / 60000)
  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  return `${days}d ago`
}

export function NotificationsSheet() {
  const entries = useAuditLog()
  const recent = [...entries].sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 20)

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Notifications"
          className="flex size-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <BellIcon size={18} />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-sm">
        <SheetHeader className="border-b border-border">
          <SheetTitle>Notifications</SheetTitle>
        </SheetHeader>
        <ul className="flex flex-1 flex-col divide-y divide-border overflow-y-auto px-4 pb-4">
          {recent.length === 0 ? (
            <li className="py-6 text-center text-sm text-muted-foreground">No recent activity.</li>
          ) : (
            recent.map((entry) => (
              <li key={entry.id} className="flex flex-col gap-0.5 py-3">
                <p className="text-sm text-foreground">{entry.action}</p>
                <p className="text-xs text-muted-foreground">
                  {entry.performedBy} · {relativeTime(entry.timestamp)}
                </p>
              </li>
            ))
          )}
        </ul>
      </SheetContent>
    </Sheet>
  );
}
