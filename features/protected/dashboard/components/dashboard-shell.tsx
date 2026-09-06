"use client"

import { useState } from "react"
import { notFound } from "next/navigation"
import { useProtectedSession } from "@/features/auth/hooks/use-role"
import { RoleProvider } from "@/features/protected/dashboard/context/role-context"
import { Sidebar } from "@/features/protected/dashboard/components/sidebar"
import { DashboardHeader } from "@/features/protected/dashboard/components/dashboard-header"

export function DashboardShell({
  token,
  children,
}: {
  token: string
  children: React.ReactNode
}) {
  const role = useProtectedSession(token)
  const [collapsed, setCollapsed] = useState(false)

  if (role === undefined) return null
  if (role === null) notFound()

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar role={role} token={token} collapsed={collapsed} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed((value) => !value)}
        />
        <main className="flex-1 overflow-y-auto bg-card p-6">
          <RoleProvider role={role}>{children}</RoleProvider>
        </main>
      </div>
    </div>
  );
}
