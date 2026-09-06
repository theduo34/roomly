import { auditLog as seedAuditLog } from "@/lib/mock-data"
import { appendNotification } from "@/lib/notifications-store"
import type { AuditLog, StaffRole } from "@/lib/types"

const STORAGE_KEY = "roomly_audit_log"
export const AUDIT_LOG_CHANGE_EVENT = "roomly-audit-log-changed"

function readRuntimeLog(): AuditLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as AuditLog[]) : []
  } catch {
    return []
  }
}

export function readAuditLog(): AuditLog[] {
  return [...readRuntimeLog(), ...seedAuditLog]
}

export function appendAuditLog(entry: { action: string; performedBy: string; role: StaffRole; link?: string }) {
  const record: AuditLog = {
    id: `audit-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: entry.action,
    performedBy: entry.performedBy,
    role: entry.role,
  }
  const runtime = [record, ...readRuntimeLog()]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(runtime))
  window.dispatchEvent(new Event(AUDIT_LOG_CHANGE_EVENT))
  appendNotification({ message: entry.action, link: entry.link })
}
