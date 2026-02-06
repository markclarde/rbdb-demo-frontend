import * as React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Users,
  Shield,
  Settings,
  LogOut,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

type NavItem = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string;
};

export function AppSidebar() {
  const navigate = useNavigate();
  const { user, can, logout } = useAuth();

  const nav: NavItem[] = [
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      to: "/quotations",
      label: "Quotations",
      icon: FileText,
      permission: "QUOTATION_READ",
    },
    {
      to: "/users",
      label: "Users",
      icon: Users,
      permission: "USER_READ",
    },
    {
      to: "/reports",
      label: "Reports",
      icon: Shield,
      permission: "SYSTEM_LOG_READ",
    },
    {
      to: "/admin/roles",
      label: "Roles & Permissions",
      icon: Settings,
      permission: "ROLE_READ",
    },
  ].filter((item) => !item.permission || can(item.permission));


  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-3 px-2 py-1.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-md border bg-background">
            <span className="font-semibold tracking-tight">E</span>
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <div className="truncate text-sm font-semibold tracking-tight">
              Enterprise Ops
            </div>
            <div className="truncate text-[11px] text-muted-foreground">
              {user?.role ?? ""}
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        cn(
                          isActive &&
                            "bg-sidebar-accent text-sidebar-accent-foreground"
                        )
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <Separator className="my-2" />
        <div className="flex items-center justify-between gap-2 px-2 py-1.5">
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <div className="truncate text-sm font-medium leading-none">
              Operations
            </div>
            <div className="truncate text-xs text-muted-foreground">
              {user?.role ?? ""}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={async () => {
              await logout();
              navigate("/login", { replace: true });
            }}
            aria-label="Logout"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
