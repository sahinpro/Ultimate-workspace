"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CalendarDays,
  CheckSquare,
  LayoutDashboard,
  Lock,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sparkles,
  Sun,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/routine", label: "Routine", icon: CalendarDays },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/vault", label: "Vault", icon: Lock },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppSidebar({
  user,
}: {
  user: { name?: string | null; email?: string | null; image?: string | null };
}) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "U";

  const NavContent = () => (
    <>
      <div className="mb-8 px-2">
        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-2xl glass-strong">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <h1 className="text-lg font-semibold tracking-tight">
          Ultimate Workspace
        </h1>
        <p className="text-xs text-muted-foreground">Your second brain</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200",
                active
                  ? "glass-nav-active font-medium text-foreground"
                  : "text-muted-foreground hover:bg-white/20 hover:text-foreground dark:hover:bg-white/5",
              )}
            >
              <Icon className={cn("h-4 w-4", active && "text-primary")} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto space-y-3 border-t border-white/20 pt-4 dark:border-white/10">
        <div className="glass rounded-xl p-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 ring-2 ring-white/30">
              <AvatarImage src={user.image ?? undefined} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {user.email}
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-1 px-1">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl hover:bg-white/20 dark:hover:bg-white/5"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl hover:bg-white/20 dark:hover:bg-white/5"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-50 rounded-xl glass lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        <Menu className="h-5 w-5" />
      </Button>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className={cn(
          "glass-panel fixed inset-y-3 left-3 z-40 flex w-62 flex-col p-4 transition-transform lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "translate-x-[-110%]",
        )}
      >
        <NavContent />
      </aside>
    </>
  );
}
