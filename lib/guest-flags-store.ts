import type { GuestFlag } from "@/lib/types"

const STORAGE_KEY = "roomly_guest_flags"
export const GUEST_FLAGS_CHANGE_EVENT = "roomly-guest-flags-changed"

export function readGuestFlags(): GuestFlag[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as GuestFlag[]) : []
  } catch {
    return []
  }
}

function writeGuestFlags(next: GuestFlag[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  window.dispatchEvent(new Event(GUEST_FLAGS_CHANGE_EVENT))
}

export function flagGuest(guestEmail: string, reason: string, flaggedBy: string) {
  const next = readGuestFlags().filter((flag) => flag.guestEmail !== guestEmail)
  next.push({ guestEmail, reason, flaggedBy, flaggedAt: new Date().toISOString() })
  writeGuestFlags(next)
}

export function unflagGuest(guestEmail: string) {
  writeGuestFlags(readGuestFlags().filter((flag) => flag.guestEmail !== guestEmail))
}
