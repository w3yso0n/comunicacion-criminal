import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function MapaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell>
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
        {children}
      </div>
    </DashboardShell>
  );
}
