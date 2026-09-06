"use client"

import { useEffect, useState } from "react"
import { STAFF_CHANGE_EVENT, readStaff } from "@/lib/staff-store"
import type { StaffMember } from "@/lib/types"

export function useStaff(): StaffMember[] {
  const [staff, setStaff] = useState<StaffMember[]>([])

  useEffect(() => {
    const sync = () => setStaff(readStaff())
    sync()
    window.addEventListener(STAFF_CHANGE_EVENT, sync)
    window.addEventListener("storage", sync)
    return () => {
      window.removeEventListener(STAFF_CHANGE_EVENT, sync)
      window.removeEventListener("storage", sync)
    }
  }, [])

  return staff
}
