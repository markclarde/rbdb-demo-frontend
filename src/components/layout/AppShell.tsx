import { Outlet } from "react-router-dom";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";

export function AppShell() {
  return (
    <SidebarProvider defaultOpen>
      <div className="flex w-full min-h-screen bg-[hsl(var(--app-bg))] text-foreground">
        <AppSidebar />

        <SidebarInset className="flex-1">
          <div className="flex flex-1 flex-col p-6">
            <Outlet />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
