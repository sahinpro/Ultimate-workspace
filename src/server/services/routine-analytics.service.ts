import { prisma } from "@/lib/db/prisma";
import { startOfWeek, endOfWeek } from "date-fns";

export async function getRoutineAnalytics(userId: string, range: "week" | "month" = "week") {
  const now = new Date();
  const start = range === "week" ? startOfWeek(now, { weekStartsOn: 1 }) : new Date(now.getFullYear(), now.getMonth(), 1);
  const end = range === "week" ? endOfWeek(now, { weekStartsOn: 1 }) : now;

  const blocks = await prisma.scheduledBlock.findMany({
    where: {
      scheduleDay: { userId, date: { gte: start, lte: end } },
    },
    include: { scheduleDay: true },
  });

  const completed = blocks.filter((b) => b.status === "COMPLETED");
  const prayerBlocks = blocks.filter((b) => b.isPrayerBlock);
  const prayerCompleted = prayerBlocks.filter((b) => b.status === "COMPLETED");
  const deepWork = blocks.filter((b) => b.category === "DEEP_WORK" || b.category === "OFFICE_WORK");

  const focusMinutes = deepWork.reduce((acc, b) => {
    return acc + (b.endTime.getTime() - b.startTime.getTime()) / 60000;
  }, 0);

  const completedFocusMinutes = deepWork
    .filter((b) => b.status === "COMPLETED")
    .reduce((acc, b) => acc + (b.endTime.getTime() - b.startTime.getTime()) / 60000, 0);

  const completionRate = blocks.length > 0 ? (completed.length / blocks.length) * 100 : 0;
  const prayerConsistency = prayerBlocks.length > 0 ? (prayerCompleted.length / prayerBlocks.length) * 100 : 0;
  const productivityScore = Math.round(completionRate * 0.4 + prayerConsistency * 0.3 + (completedFocusMinutes / Math.max(focusMinutes, 1)) * 100 * 0.3);

  const dailyStats = new Map<string, { focus: number; completed: number; total: number }>();
  for (const block of blocks) {
    const key = block.scheduleDay.date.toISOString().split("T")[0];
    const existing = dailyStats.get(key) ?? { focus: 0, completed: 0, total: 0 };
    existing.total++;
    if (block.status === "COMPLETED") existing.completed++;
    if (block.category === "DEEP_WORK" || block.category === "OFFICE_WORK") {
      existing.focus += (block.endTime.getTime() - block.startTime.getTime()) / 60000;
    }
    dailyStats.set(key, existing);
  }

  const weeklyTrends = Array.from(dailyStats.entries()).map(([date, stats]) => ({
    date,
    focusMinutes: Math.round(stats.focus),
    completionRate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
  }));

  return {
    focusMinutes: Math.round(focusMinutes),
    completedFocusMinutes: Math.round(completedFocusMinutes),
    deepWorkHours: Math.round(completedFocusMinutes / 60 * 10) / 10,
    prayerConsistency: Math.round(prayerConsistency),
    completionRate: Math.round(completionRate),
    productivityScore,
    totalBlocks: blocks.length,
    completedBlocks: completed.length,
    weeklyTrends,
  };
}
