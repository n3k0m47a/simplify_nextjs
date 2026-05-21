"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User2, LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PogoNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await authClient.signOut();
    router.push("/login");
  }

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center px-4">
        <div className="w-40">
          <Link href="/" className="text-lg font-bold tracking-tight">
            LOGO
          </Link>
        </div>

        <nav className="flex flex-1 items-center justify-center gap-1">
          <Link href="/pogo" className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "rounded-full gap-1.5",
              pathname === "/pogo" && "bg-accent"
            )}>
              Pogo
            </Link>
            <Link
              href="/pogo/luckydex"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "rounded-full gap-1.5",
                pathname === "/pogo/luckydex" && "bg-accent"
              )}
            >
              Luckydex
            </Link>
          <Link
            href="/pogo/my-avatars"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "rounded-full gap-1.5",
              pathname === "/pogo/my-avatars" && "bg-accent"
            )}
          >
            Meine Avatare
          </Link>
        </nav>

        <div className="flex w-40 items-center justify-end gap-1">
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className={buttonVariants({ variant: "ghost", size: "icon" })}
            aria-label="Abmelden"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
