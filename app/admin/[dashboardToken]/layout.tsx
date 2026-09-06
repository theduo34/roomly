import { DashboardShell } from "@/features/protected/dashboard/components/dashboard-shell"

export default async function AdminLayout(props: LayoutProps<"/admin/[dashboardToken]">) {
  const { dashboardToken } = await props.params;
  return <DashboardShell token={dashboardToken}>{props.children}</DashboardShell>;
}
