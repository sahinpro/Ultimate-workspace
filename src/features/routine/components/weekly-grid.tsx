"use client";

import { useQuery } from "@tanstack/react-query";
import { format, startOfWeek } from "date-fns";
import { motion } from "framer-motion";
import { PrayerBar } from "./prayer-bar";
import { RoutineLegend, BlockCell } from "./routine-legend";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

type ScheduledBlock = {
  id: string;
  title: string;
  color: string;
  startTime: string;
  endTime: string;
  isPrayerBlock: boolean;
  category: string;
};

type DaySchedule = {
  scheduleDay: { date: string } | null;
  blocks: ScheduledBlock[];
  conflicts: { message: string }[];
};

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getTimeSlotLabel(block: ScheduledBlock): string {
  const start = new Date(block.startTime);
  const end = new Date(block.endTime);
  return `${format(start, "h:mma").replace(":00", "")}–${format(end, "h:mma").replace(":00", "")}`;
}

export function WeeklyGrid({ baseDate }: { baseDate?: Date }) {
  const date = baseDate ?? new Date();
  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  const dateParam = format(weekStart, "yyyy-MM-dd");

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["routine-week", dateParam],
    queryFn: async () => {
      const res = await fetch(`/api/v1/routine/schedule?date=${dateParam}&view=week`);
      const json = await res.json();
      return json.data as { week: DaySchedule[] };
    },
  });

  const { data: rulesData } = useQuery({
    queryKey: ["routine-rules"],
    queryFn: async () => {
      const res = await fetch("/api/v1/routine/blocks");
      const json = await res.json();
      return json.data.rules as { id: string; title: string; description: string | null }[];
    },
  });

  if (isLoading) {
    return <div className="animate-pulse rounded-xl bg-muted h-96" />;
  }

  const week = data?.week ?? [];
  const allConflicts = week.flatMap((d) => d.conflicts);

  const timeSlots = new Map<string, ScheduledBlock[][]>();
  week.forEach((day, dayIndex) => {
    day.blocks.forEach((block) => {
      const key = getTimeSlotLabel(block);
      if (!timeSlots.has(key)) {
        timeSlots.set(key, Array.from({ length: 7 }, () => []));
      }
      timeSlots.get(key)![dayIndex].push(block);
    });
  });

  const sortedSlots = Array.from(timeSlots.entries()).sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="space-y-4">
      <PrayerBar date={date} />
      <div className="flex items-center justify-between">
        <RoutineLegend />
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {allConflicts.length > 0 && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {allConflicts.length} schedule conflict(s) detected
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-x-auto"
      >
        <div className="grid min-w-[700px] grid-cols-[70px_repeat(7,1fr)] gap-0.5">
          <div />
          {DAY_LABELS.map((label, i) => (
            <div
              key={label}
              className={`p-1 text-center text-xs font-medium text-muted-foreground ${i === 4 ? "text-[#eda100] font-semibold" : ""}`}
            >
              {label}{i === 4 ? " ★" : ""}
            </div>
          ))}

          {sortedSlots.map(([slot, daysBlocks]) => (
            <div key={slot} className="contents">
              <div className="flex items-center p-1 text-[10px] text-muted-foreground">
                {slot.split("–")[0]}
              </div>
              {daysBlocks.map((blocks, dayIndex) => {
                const block = blocks[0];
                if (!block) {
                  return <div key={`empty-${slot}-${dayIndex}`} className="min-h-[26px]" />;
                }
                const isJuma = dayIndex === 4 && block.title.includes("Jumu");
                return (
                  <BlockCell
                    key={`${block.id}-${dayIndex}`}
                    title={block.title}
                    color={block.color}
                    isPrayerBlock={block.isPrayerBlock}
                    isJuma={isJuma}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </motion.div>

      {rulesData && rulesData.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2">
          {rulesData.map((rule) => (
            <Card key={rule.id} className="p-3">
              <h4 className="text-xs font-medium">{rule.title}</h4>
              {rule.description && (
                <p className="mt-1 text-[11px] text-muted-foreground">{rule.description}</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export function DailyTimeline({ date }: { date?: Date }) {
  const dateStr = format(date ?? new Date(), "yyyy-MM-dd");

  const { data, isLoading } = useQuery({
    queryKey: ["routine-day", dateStr],
    queryFn: async () => {
      const res = await fetch(`/api/v1/routine/schedule?date=${dateStr}&view=day`);
      const json = await res.json();
      return json.data as DaySchedule;
    },
  });

  if (isLoading) return <div className="animate-pulse rounded-xl bg-muted h-64" />;

  const blocks = data?.blocks ?? [];

  return (
    <div className="space-y-3">
      <PrayerBar date={date} />
      <div className="relative space-y-1">
        {blocks.map((block, i) => (
          <motion.div
            key={block.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className="flex items-center gap-3 rounded-lg border p-3"
            style={{ borderLeftColor: block.color, borderLeftWidth: 3 }}
          >
            <div className="w-20 shrink-0 text-xs text-muted-foreground">
              {format(new Date(block.startTime), "h:mm a")}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{block.title}</p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(block.endTime), "h:mm a")}
              </p>
            </div>
          </motion.div>
        ))}
        {blocks.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">No blocks scheduled</p>
        )}
      </div>
    </div>
  );
}
