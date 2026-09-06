"use client"

import { useEffect, useState } from "react"
import { MAINTENANCE_CHANGE_EVENT, readMaintenanceIssues } from "@/lib/maintenance-store"
import type { MaintenanceIssue } from "@/lib/types"

export function useMaintenanceIssues(): MaintenanceIssue[] {
  const [issues, setIssues] = useState<MaintenanceIssue[]>([])

  useEffect(() => {
    const sync = () => setIssues(readMaintenanceIssues())
    sync()
    window.addEventListener(MAINTENANCE_CHANGE_EVENT, sync)
    window.addEventListener("storage", sync)
    return () => {
      window.removeEventListener(MAINTENANCE_CHANGE_EVENT, sync)
      window.removeEventListener("storage", sync)
    }
  }, [])

  return issues
}
