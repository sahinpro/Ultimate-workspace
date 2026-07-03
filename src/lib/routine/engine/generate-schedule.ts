import type { BlockCategory, EnergyLevel, Profile, RoutineBlock } from "@prisma/client";
import { addMinutes, parse, format, startOfDay, addDays, isSameDay } from "date-fns";
import { parsePrayerTime, type PrayerTimings, isFriday } from "@/lib/prayer/aladhan-client";

export type ScheduleBlockInput = {
  title: string;
  color: string;
  icon: string;
  category: BlockCategory;
  startTime: Date;
  endTime: Date;
  isFlexible: boolean;
  isPrayerBlock: boolean;
  routineBlockId?: string;
  taskId?: string;
  sortOrder: number;
};

export type Conflict = {
  blockA: string;
  blockB: string;
  message: string;
};

export function detectConflicts(blocks: ScheduleBlockInput[]): Conflict[] {
  const conflicts: Conflict[] = [];
  const sorted = [...blocks].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      const a = sorted[i];
      const b = sorted[j];
      if (a.startTime < b.endTime && b.startTime < a.endTime) {
        conflicts.push({
          blockA: a.title,
          blockB: b.title,
          message: `"${a.title}" overlaps with "${b.title}"`,
        });
      }
    }
  }
  return conflicts;
}

export function getEnergyForHour(hour: number, profile: Profile): EnergyLevel {
  const energy = profile.energyProfile as Record<string, string> | null;
  if (!energy) {
    if (hour >= 6 && hour < 12) return "HIGH";
    if (hour >= 12 && hour < 17) return "MEDIUM";
    if (hour >= 17 && hour < 21) return "LOW";
    return "LOW";
  }
  if (hour >= 5 && hour < 12) return (energy.morning as EnergyLevel) ?? "HIGH";
  if (hour >= 12 && hour < 17) return (energy.afternoon as EnergyLevel) ?? "MEDIUM";
  if (hour >= 17 && hour < 21) return (energy.evening as EnergyLevel) ?? "LOW";
  return (energy.night as EnergyLevel) ?? "LOW";
}

function parseTimeHint(hint: string, date: Date): Date {
  const parsed = parse(hint, "HH:mm", date);
  return parsed;
}

export function generatePrayerBlocks(
  date: Date,
  timings: PrayerTimings,
  isJumuah: boolean,
): ScheduleBlockInput[] {
  const day = startOfDay(date);
  const blocks: ScheduleBlockInput[] = [];
  let order = 0;

  const prayers: { name: string; time: string; duration: number }[] = [
    { name: "Fajr", time: timings.Fajr, duration: 15 },
    { name: isJumuah ? "Jumu'ah" : "Dhuhr", time: timings.Dhuhr, duration: isJumuah ? 60 : 15 },
    { name: "Asr", time: timings.Asr, duration: 15 },
    { name: "Maghrib", time: timings.Maghrib, duration: 15 },
    { name: "Isha", time: timings.Isha, duration: 15 },
  ];

  for (const prayer of prayers) {
    const start = parsePrayerTime(prayer.time, day);
    blocks.push({
      title: prayer.name,
      color: isJumuah && prayer.name === "Jumu'ah" ? "#eda100" : "#eda100",
      icon: "moon",
      category: "PRAYER",
      startTime: start,
      endTime: addMinutes(start, prayer.duration),
      isFlexible: false,
      isPrayerBlock: true,
      sortOrder: order++,
    });
  }

  return blocks;
}

export function generateBlocksForDay(
  date: Date,
  routineBlocks: RoutineBlock[],
  profile: Profile,
  timings: PrayerTimings,
): ScheduleBlockInput[] {
  const day = startOfDay(date);
  const dayOfWeek = date.getDay();
  const blocks: ScheduleBlockInput[] = [];
  let order = 0;

  const weekendRules = profile.weekendRules as { restDays?: number[] } | null;
  const restDays = weekendRules?.restDays ?? (profile.country === "BD" ? [0] : [0, 6]);

  if (restDays.includes(dayOfWeek)) {
    blocks.push({
      title: "Full Rest",
      color: "#e1e0d9",
      icon: "bed",
      category: "BREAK",
      startTime: parseTimeHint("06:00", day),
      endTime: parseTimeHint("22:00", day),
      isFlexible: true,
      isPrayerBlock: false,
      sortOrder: order++,
    });
    blocks.push(...generatePrayerBlocks(date, timings, isFriday(date)));
    return blocks.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }

  const applicableBlocks = routineBlocks.filter((b) => {
    if (b.isPrayerBlock) return false;
    if (b.daysOfWeek.length === 0) return true;
    return b.daysOfWeek.includes(dayOfWeek);
  });

  for (const block of applicableBlocks) {
    let start: Date;
    if (block.startTimeHint) {
      start = parseTimeHint(block.startTimeHint, day);
    } else {
      const wh = profile.workingHours as { start?: string } | null;
      start = parseTimeHint(wh?.start ?? "09:00", day);
    }
    const end = addMinutes(start, block.durationMinutes);

    if (isFriday(date) && block.category === "OFFICE_WORK") {
      const dhuhr = parsePrayerTime(timings.Dhuhr, day);
      if (start >= dhuhr) continue;
      if (end > dhuhr) {
        blocks.push({
          title: block.title,
          color: block.color,
          icon: block.icon,
          category: block.category,
          startTime: start,
          endTime: dhuhr,
          isFlexible: block.schedulingMode === "FLEXIBLE",
          isPrayerBlock: false,
          routineBlockId: block.id,
          sortOrder: order++,
        });
        continue;
      }
    }

    blocks.push({
      title: block.title,
      color: block.color,
      icon: block.icon,
      category: block.category,
      startTime: start,
      endTime: end,
      isFlexible: block.schedulingMode === "FLEXIBLE",
      isPrayerBlock: false,
      routineBlockId: block.id,
      sortOrder: order++,
    });
  }

  blocks.push(...generatePrayerBlocks(date, timings, isFriday(date)));

  return blocks.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
}

export function placeTaskInSchedule(
  task: { id: string; title: string; priority: string },
  existingBlocks: ScheduleBlockInput[],
  profile: Profile,
  date: Date,
): ScheduleBlockInput | null {
  const day = startOfDay(date);
  const duration = 30;
  const energyNeeded = task.priority === "HIGH" || task.priority === "URGENT" ? "HIGH" : "MEDIUM";

  const focusBlocks = existingBlocks.filter(
    (b) =>
      !b.isPrayerBlock &&
      (b.category === "DEEP_WORK" || b.category === "OFFICE_WORK" || b.category === "LEARNING"),
  );

  for (const block of focusBlocks) {
    const hour = block.startTime.getHours();
    const energy = getEnergyForHour(hour, profile);
    if (energyNeeded === "HIGH" && energy !== "HIGH") continue;

    const taskEnd = addMinutes(block.startTime, duration);
    if (taskEnd <= block.endTime) {
      return {
        title: task.title,
        color: "#4a3aa7",
        icon: "check-square",
        category: "DEEP_WORK",
        startTime: block.startTime,
        endTime: taskEnd,
        isFlexible: true,
        isPrayerBlock: false,
        taskId: task.id,
        sortOrder: block.sortOrder,
      };
    }
  }

  const wh = profile.workingHours as { start?: string } | null;
  const fallbackStart = parseTimeHint(wh?.start ?? "09:00", day);
  return {
    title: task.title,
    color: "#4a3aa7",
    icon: "check-square",
    category: "DEEP_WORK",
    startTime: fallbackStart,
    endTime: addMinutes(fallbackStart, duration),
    isFlexible: true,
    isPrayerBlock: false,
    taskId: task.id,
    sortOrder: 999,
  };
}

export function getWeekDates(baseDate: Date): Date[] {
  const start = startOfDay(baseDate);
  const day = start.getDay();
  const monday = addDays(start, day === 0 ? -6 : 1 - day);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

export function formatBlockTime(date: Date): string {
  return format(date, "h:mm a");
}

export function isBlockOnDate(block: { startTime: Date }, date: Date): boolean {
  return isSameDay(block.startTime, date);
}
