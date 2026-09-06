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
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  if (role === undefined) return null
  if (role === null) notFound()

  function toggleSidebar() {
    // The same header button collapses the sidebar on desktop but opens the off-canvas drawer on mobile
    if (typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches) {
      setCollapsed((value) => !value)
    } else {
      setMobileNavOpen((value) => !value)
    }
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar
        role={role}
        token={token}
        collapsed={collapsed}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader
          collapsed={collapsed}
          onToggleCollapsed={toggleSidebar}
        />
        <main className="flex-1 overflow-y-auto bg-card p-4 sm:p-6">
          <RoleProvider role={role}>{children}</RoleProvider>
        </main>
      </div>
    </div>
  );
}
