"use client"

import { notFound } from "next/navigation"
import { useDashboardRole } from "@/features/protected/dashboard/context/role-context"
import type { StaffRole } from "@/lib/types"

/** Hides a page from roles that shouldn't see it in the sidebar. */
export function RoleGate({ allow, children }: { allow: StaffRole[]; children: React.ReactNode }) {
  const role = useDashboardRole()
  if (!allow.includes(role)) notFound()
  return <>{children}</>;
}
