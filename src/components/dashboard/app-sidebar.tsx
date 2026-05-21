import Link from "next/link";
import { LayoutDashboard, Users } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function AppSidebar({ role }: { role?: string | null }) {
  const navItems = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ...(role === "admin"
      ? [{ title: "Benutzer", href: "/users", icon: Users }]
      : []),
  ];

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-3">
        <span className="text-base font-semibold tracking-tight">
          Backend
        </span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton render={<Link href={item.href} />}>
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
