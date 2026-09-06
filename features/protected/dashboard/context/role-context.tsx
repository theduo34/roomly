"use client"

import { createContext, useContext } from "react"
import type { StaffRole } from "@/lib/types"

const RoleContext = createContext<StaffRole | null>(null)

export function RoleProvider({
  role,
  children,
}: {
  role: StaffRole
  children: React.ReactNode
}) {
  return <RoleContext.Provider value={role}>{children}</RoleContext.Provider>
}

/** The signed-in staff role for the current dashboard session. */
export function useDashboardRole(): StaffRole {
  const role = useContext(RoleContext)
  if (!role) throw new Error("useDashboardRole must be used within DashboardShell")
  return role
}
