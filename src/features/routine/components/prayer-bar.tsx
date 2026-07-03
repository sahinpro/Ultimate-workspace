"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

type PrayerTimings = {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
};

export function PrayerBar({ date }: { date?: Date }) {
  const dateStr = date ? format(date, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");

  const { data } = useQuery({
    queryKey: ["prayer-times", dateStr],
    queryFn: async () => {
      const res = await fetch(`/api/v1/routine/prayer-times?date=${dateStr}`);
      const json = await res.json();
      return json.data as {
        timings: PrayerTimings | null;
        next: { name: string; minutesUntil: number } | null;
        enabled: boolean;
        location?: string;
      };
    },
  });

  if (!data) return null;

  if (!data.enabled || !data.timings) {
    return (
      <div className="glass-card p-4 text-sm text-muted-foreground">
        Prayer scheduling is disabled. Enable it in Settings to see prayer times.
      </div>
    );
  }

  const entries = [
    { name: "Fajr", time: data.timings.Fajr },
    { name: "Sunrise", time: data.timings.Sunrise },
    { name: "Dhuhr", time: data.timings.Dhuhr },
    { name: "Asr", time: data.timings.Asr },
    { name: "Maghrib", time: data.timings.Maghrib },
    { name: "Isha", time: data.timings.Isha },
  ];

  return (
    <div className="glass-card border-[#eda10030] bg-[#faeeda]/60 p-4 dark:bg-[#3a2200]/50 dark:text-[#faeeda]">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <strong className="text-sm">Prayer Times</strong>
          {data.location && (
            <p className="mt-0.5 flex items-center gap-1 text-[10px] opacity-70">
              <MapPin className="h-3 w-3" />
              {data.location}
            </p>
          )}
        </div>
        {data.next && (
          <span className="rounded-full glass px-3 py-1 text-xs font-medium text-[#633806] dark:text-[#eda100]">
            {data.next.name} in {data.next.minutesUntil} min
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {entries.map((p) => (
          <div
            key={p.name}
            className={cn(
              "rounded-xl glass px-3 py-1.5 text-xs",
              data.next?.name === p.name && "ring-2 ring-[#eda100] ring-offset-1 ring-offset-transparent",
            )}
          >
            <span className="block font-medium">{p.name}</span>
            <span className="text-[10px] opacity-70">{p.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
