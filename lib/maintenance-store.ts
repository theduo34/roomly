import { maintenanceIssues as seedIssues } from "@/lib/mock-data"
import type { MaintenanceIssue } from "@/lib/types"

const STORAGE_KEY = "roomly_maintenance_issues"
const OVERRIDES_KEY = "roomly_maintenance_overrides"
export const MAINTENANCE_CHANGE_EVENT = "roomly-maintenance-changed"

type Override = Pick<MaintenanceIssue, "status" | "resolvedAt">

function readAdded(): MaintenanceIssue[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as MaintenanceIssue[]) : []
  } catch {
    return []
  }
}

function readOverrides(): Record<string, Override> {
  try {
    const raw = localStorage.getItem(OVERRIDES_KEY)
    return raw ? (JSON.parse(raw) as Record<string, Override>) : {}
  } catch {
    return {}
  }
}

export function readMaintenanceIssues(): MaintenanceIssue[] {
  const overrides = readOverrides()
  return [...readAdded(), ...seedIssues].map((issue) =>
    overrides[issue.id] ? { ...issue, ...overrides[issue.id] } : issue
  )
}

function notify() {
  window.dispatchEvent(new Event(MAINTENANCE_CHANGE_EVENT))
}

export function reportMaintenanceIssue(entry: {
  roomId: string
  roomName: string
  description: string
  reportedBy: string
}) {
  const record: MaintenanceIssue = {
    id: `maintenance-${Date.now()}`,
    reportedAt: new Date().toISOString(),
    status: "open",
    ...entry,
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify([record, ...readAdded()]))
  notify()
}

export function resolveMaintenanceIssue(id: string) {
  const overrides = readOverrides()
  overrides[id] = { status: "resolved", resolvedAt: new Date().toISOString() }
  localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides))
  notify()
}
