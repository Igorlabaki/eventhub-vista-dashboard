import { ReactNode } from "react";
import { SidebarNav } from "./SidebarNav";
import { Header } from "./Header";

type DashboardLayoutProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
};

export function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen h-full bg-eventhub-background">
      <SidebarNav />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header title={title} subtitle={subtitle} />
        <main className="overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
