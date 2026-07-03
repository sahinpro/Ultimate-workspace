import { prisma } from "@/lib/db/prisma";
import { startOfDay } from "date-fns";
import {
  generateBlocksForDay,
  detectConflicts,
  placeTaskInSchedule,
  getWeekDates,
  type ScheduleBlockInput,
} from "@/lib/routine/engine/generate-schedule";
import { getPrayerTimesForUser } from "@/server/services/prayer-time.service";

export class RoutineEngineService {
  async generateSchedule(userId: string, date: Date) {
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) throw new Error("Profile not found");

    const routineBlocks = await prisma.routineBlock.findMany({
      where: { userId, deletedAt: null, isPrayerBlock: false },
      orderBy: { sortOrder: "asc" },
    });

    const timings = await getPrayerTimesForUser(userId, date);
    let blocks = generateBlocksForDay(date, routineBlocks, profile, timings);

    const autoTasks = await prisma.task.findMany({
      where: { userId, autoSchedule: true, status: { in: ["TODO", "IN_PROGRESS"] }, deletedAt: null },
    });

    for (const task of autoTasks) {
      const placed = placeTaskInSchedule(task, blocks, profile, date);
      if (placed) blocks.push(placed);
    }

    blocks = blocks.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    const conflicts = detectConflicts(blocks);

    const dateOnly = startOfDay(date);
    const scheduleDay = await prisma.scheduleDay.upsert({
      where: { userId_date: { userId, date: dateOnly } },
      create: { userId, date: dateOnly, timezone: profile.timezone, source: "GENERATED" },
      update: { generatedAt: new Date(), source: "GENERATED" },
    });

    await prisma.scheduledBlock.deleteMany({ where: { scheduleDayId: scheduleDay.id } });

    const created = await Promise.all(
      blocks.map((block, index) =>
        prisma.scheduledBlock.create({
          data: {
            scheduleDayId: scheduleDay.id,
            routineBlockId: block.routineBlockId,
            taskId: block.taskId,
            title: block.title,
            color: block.color,
            icon: block.icon,
            category: block.category,
            startTime: block.startTime,
            endTime: block.endTime,
            isFlexible: block.isFlexible,
            isPrayerBlock: block.isPrayerBlock,
            sortOrder: index,
          },
        }),
      ),
    );

    return { scheduleDay, blocks: created, conflicts };
  }

  async getSchedule(userId: string, date: Date, view: "day" | "week" = "day") {
    if (view === "week") {
      const dates = getWeekDates(date);
      const results = await Promise.all(
        dates.map(async (d) => {
          const existing = await this.getDaySchedule(userId, d);
          if (existing.blocks.length === 0) {
            return this.generateSchedule(userId, d);
          }
          return existing;
        }),
      );
      return { week: results };
    }

    const existing = await this.getDaySchedule(userId, date);
    if (existing.blocks.length === 0) {
      return this.generateSchedule(userId, date);
    }
    return existing;
  }

  async getDaySchedule(userId: string, date: Date) {
    const dateOnly = startOfDay(date);
    const scheduleDay = await prisma.scheduleDay.findUnique({
      where: { userId_date: { userId, date: dateOnly } },
      include: {
        blocks: { orderBy: { startTime: "asc" } },
      },
    });

    if (!scheduleDay) {
      return { scheduleDay: null, blocks: [], conflicts: [] };
    }

    const blockInputs: ScheduleBlockInput[] = scheduleDay.blocks.map((b) => ({
      title: b.title,
      color: b.color,
      icon: b.icon,
      category: b.category,
      startTime: b.startTime,
      endTime: b.endTime,
      isFlexible: b.isFlexible,
      isPrayerBlock: b.isPrayerBlock,
      routineBlockId: b.routineBlockId ?? undefined,
      taskId: b.taskId ?? undefined,
      sortOrder: b.sortOrder,
    }));

    return {
      scheduleDay,
      blocks: scheduleDay.blocks,
      conflicts: detectConflicts(blockInputs),
    };
  }

  async updateScheduledBlock(
    userId: string,
    blockId: string,
    data: { startTime: Date; endTime: Date; title?: string },
  ) {
    const block = await prisma.scheduledBlock.findFirst({
      where: { id: blockId, scheduleDay: { userId } },
      include: { scheduleDay: true },
    });
    if (!block) throw new Error("Block not found");

    const updated = await prisma.scheduledBlock.update({
      where: { id: blockId },
      data: {
        startTime: data.startTime,
        endTime: data.endTime,
        title: data.title ?? block.title,
      },
    });

    const dayBlocks = await prisma.scheduledBlock.findMany({
      where: { scheduleDayId: block.scheduleDayId },
    });

    const conflicts = detectConflicts(
      dayBlocks.map((b) => ({
        title: b.title,
        color: b.color,
        icon: b.icon,
        category: b.category,
        startTime: b.startTime,
        endTime: b.endTime,
        isFlexible: b.isFlexible,
        isPrayerBlock: b.isPrayerBlock,
        sortOrder: b.sortOrder,
      })),
    );

    return { block: updated, conflicts };
  }

  async regenerateWeek(userId: string, startDate: Date) {
    const dates = getWeekDates(startDate);
    const results = [];
    for (const date of dates) {
      results.push(await this.generateSchedule(userId, date));
    }
    return results;
  }
}

export const routineEngine = new RoutineEngineService();
