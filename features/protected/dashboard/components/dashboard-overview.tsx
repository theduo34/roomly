"use client"

import { useDashboardRole } from "@/features/protected/dashboard/context/role-context"
import { ReceptionistDashboard } from "@/features/protected/receptionist/components/receptionist-dashboard"
import { ManagerDashboard } from "@/features/protected/manager/components/manager-dashboard"
import { DirectorDashboard } from "@/features/protected/director/components/director-dashboard"

export function DashboardOverview() {
  const role = useDashboardRole()

  if (role === "receptionist") return <ReceptionistDashboard />
  if (role === "manager") return <ManagerDashboard />
  return <DirectorDashboard />
}
