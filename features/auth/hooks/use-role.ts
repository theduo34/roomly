import type { StaffRole } from "@/lib/types"

export function useRole(): {
  role: StaffRole | null
  setRole: (role: StaffRole) => void
} {
  return {
    role: null,
    setRole: () => {},
  }
}
