import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function ExploradorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}
