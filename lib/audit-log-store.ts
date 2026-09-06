import { auditLog as seedAuditLog } from "@/lib/mock-data"
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

export function appendAuditLog(entry: { action: string; performedBy: string; role: StaffRole }) {
  const record: AuditLog = {
    id: `audit-${Date.now()}`,
    timestamp: new Date().toISOString(),
    ...entry,
  }
  const runtime = [record, ...readRuntimeLog()]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(runtime))
  window.dispatchEvent(new Event(AUDIT_LOG_CHANGE_EVENT))
}
