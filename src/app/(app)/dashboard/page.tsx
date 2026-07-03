import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PrayerBar } from "@/features/routine/components/prayer-bar";
import { DailyTimeline } from "@/features/routine/components/weekly-grid";
import { RoutineOptimizer } from "@/features/routine/components/routine-optimizer";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckSquare, Lock } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id;

  const [profile, taskCount, vaultCount] = await Promise.all([
    prisma.profile.findUnique({ where: { userId } }),
    prisma.task.count({ where: { userId, deletedAt: null, status: { not: "DONE" } } }),
    prisma.vaultItem.count({ where: { userId, deletedAt: null } }),
  ]);

  const greeting = getGreeting(profile?.timezone ?? "UTC");

  return (
    <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {greeting}, {session?.user?.name?.split(" ")[0] ?? "there"}
          </h1>
          <p className="text-muted-foreground">
            {profile?.profession?.replace(/_/g, " ") ?? "Your workspace"} · {profile?.timezone}
          </p>
        </div>

        <PrayerBar />

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard icon={CheckSquare} label="Open Tasks" value={taskCount} href="/tasks" />
          <StatCard icon={Lock} label="Vault Items" value={vaultCount} href="/vault" />
          <StatCard icon={ArrowRight} label="View Routine" value="→" href="/routine" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Today&apos;s Schedule</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/routine">View all</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <DailyTimeline />
            </CardContent>
          </Card>
          <RoutineOptimizer />
        </div>
      </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  href: string;
}) {
  return (
    <Link href={href}>
      <Card className="transition-colors hover:bg-accent/50">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{value}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

function getGreeting(timezone: string): string {
  try {
    const hour = Number(
      new Intl.DateTimeFormat("en-US", { hour: "numeric", hour12: false, timeZone: timezone }).format(new Date()),
    );
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  } catch {
    return "Hello";
  }
}
