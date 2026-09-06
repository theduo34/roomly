"use client"

import { useEffect, useState } from "react"
import { AUDIT_LOG_CHANGE_EVENT, readAuditLog } from "@/lib/audit-log-store"
import type { AuditLog } from "@/lib/types"

export function useAuditLog(): AuditLog[] {
  const [entries, setEntries] = useState<AuditLog[]>([])

  useEffect(() => {
    const sync = () => setEntries(readAuditLog())
    sync()
    window.addEventListener(AUDIT_LOG_CHANGE_EVENT, sync)
    window.addEventListener("storage", sync)
    return () => {
      window.removeEventListener(AUDIT_LOG_CHANGE_EVENT, sync)
      window.removeEventListener("storage", sync)
    }
  }, [])

  return entries
}
