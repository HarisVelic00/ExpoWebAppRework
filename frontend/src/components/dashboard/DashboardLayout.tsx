import type { ReactNode } from "react";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";

type DashboardLayoutProps = {
  children: ReactNode;
};

function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-muted/30">
      <DashboardSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader />

        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}

export default DashboardLayout;
