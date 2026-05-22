import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { Header } from "@/components/dashboard/header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <AppSidebar role={session.user.role} />
      <div className="flex flex-1 flex-col min-h-svh">
        <Header user={session.user} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </SidebarProvider>
  );
}
