"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, addMinutes } from "date-fns";
import { motion } from "framer-motion";
import { Check, SkipForward, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PrayerBar } from "./prayer-bar";

type ScheduledBlock = {
  id: string;
  title: string;
  color: string;
  startTime: string;
  endTime: string;
  isPrayerBlock: boolean;
  isFlexible: boolean;
  status: string;
  category: string;
};

type DaySchedule = {
  scheduleDay: { date: string } | null;
  blocks: ScheduledBlock[];
  conflicts: { message: string }[];
};

const STATUS_STYLES: Record<string, string> = {
  COMPLETED: "bg-green-500/10 text-green-700 dark:text-green-400",
  SKIPPED: "bg-muted text-muted-foreground",
  MISSED: "bg-destructive/10 text-destructive",
  IN_PROGRESS: "bg-primary/10 text-primary",
};

export function InteractiveDailyTimeline({ date }: { date?: Date }) {
  const queryClient = useQueryClient();
  const dateStr = format(date ?? new Date(), "yyyy-MM-dd");

  const { data, isLoading } = useQuery({
    queryKey: ["routine-day", dateStr],
    queryFn: async () => {
      const res = await fetch(`/api/v1/routine/schedule?date=${dateStr}&view=day`);
      const json = await res.json();
      return json.data as DaySchedule;
    },
  });

  const patchBlock = useMutation({
    mutationFn: async (payload: {
      id: string;
      status?: string;
      startTime?: string;
      endTime?: string;
    }) => {
      const res = await fetch(`/api/v1/routine/schedule/blocks/${payload.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: payload.status,
          startTime: payload.startTime,
          endTime: payload.endTime,
        }),
      });
      if (!res.ok) throw new Error("Failed to update block");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routine-day", dateStr] });
      queryClient.invalidateQueries({ queryKey: ["routine-week"] });
      queryClient.invalidateQueries({ queryKey: ["routine-analytics"] });
    },
  });

  function shiftBlock(block: ScheduledBlock, minutes: number) {
    const start = addMinutes(new Date(block.startTime), minutes);
    const end = addMinutes(new Date(block.endTime), minutes);
    patchBlock.mutate({
      id: block.id,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
    });
  }

  if (isLoading) return <div className="animate-pulse rounded-xl bg-muted h-64" />;

  const blocks = data?.blocks ?? [];

  return (
    <div className="space-y-3">
      <PrayerBar date={date} />
      {data?.conflicts && data.conflicts.length > 0 && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-2 text-xs text-destructive">
          {data.conflicts.length} conflict(s) in today&apos;s schedule
        </div>
      )}
      <div className="space-y-2">
        {blocks.map((block, i) => (
          <motion.div
            key={block.id}
            layout
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.02 }}
            className={cn(
              "glass flex items-center gap-2 rounded-xl p-3",
              block.status === "COMPLETED" && "opacity-60",
            )}
            style={{ borderLeftColor: block.color, borderLeftWidth: 3 }}
          >
            <div className="w-16 shrink-0 text-xs text-muted-foreground">
              {format(new Date(block.startTime), "h:mm a")}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{block.title}</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {format(new Date(block.endTime), "h:mm a")}
                </span>
                <span className={cn("rounded-full px-1.5 py-0.5 text-[10px]", STATUS_STYLES[block.status] ?? "")}>
                  {block.status}
                </span>
              </div>
            </div>
            {!block.isPrayerBlock && (
              <div className="flex shrink-0 gap-1">
                {block.isFlexible && (
                  <>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => shiftBlock(block, -15)}>
                      <ChevronUp className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => shiftBlock(block, 15)}>
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-green-600"
                  onClick={() => patchBlock.mutate({ id: block.id, status: "COMPLETED" })}
                >
                  <Check className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => patchBlock.mutate({ id: block.id, status: "SKIPPED" })}
                >
                  <SkipForward className="h-3 w-3" />
                </Button>
              </div>
            )}
          </motion.div>
        ))}
        {blocks.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">No blocks scheduled</p>
        )}
      </div>
    </div>
  );
}
