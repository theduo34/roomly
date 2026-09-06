import { staff as seedStaff } from "@/lib/mock-data"
import type { StaffMember, StaffRole } from "@/lib/types"

const STORAGE_KEY = "roomly_staff_additions"
const OVERRIDES_KEY = "roomly_staff_overrides"
export const STAFF_CHANGE_EVENT = "roomly-staff-changed"

type Override = { role?: StaffRole; removed?: boolean }

function readAdded(): StaffMember[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as StaffMember[]) : []
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

export function readStaff(): StaffMember[] {
  const overrides = readOverrides()
  return [...readAdded(), ...seedStaff]
    .map((member) => (overrides[member.id]?.role ? { ...member, role: overrides[member.id].role! } : member))
    .filter((member) => !overrides[member.id]?.removed)
}

function notify() {
  window.dispatchEvent(new Event(STAFF_CHANGE_EVENT))
}

export function addStaffMember(entry: { name: string; email: string; phone: string; role: StaffRole }) {
  const record: StaffMember = {
    id: `staff-${Date.now()}`,
    status: "off_shift",
    joinedAt: new Date().toISOString().slice(0, 10),
    ...entry,
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify([record, ...readAdded()]))
  notify()
}

export function updateStaffRole(id: string, role: StaffRole) {
  const overrides = readOverrides()
  overrides[id] = { ...overrides[id], role }
  localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides))
  notify()
}

export function removeStaffMember(id: string) {
  const overrides = readOverrides()
  overrides[id] = { ...overrides[id], removed: true }
  localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides))
  notify()
}
