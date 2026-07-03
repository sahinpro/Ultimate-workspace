"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
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
      return json.data as { timings: PrayerTimings; next: { name: string; minutesUntil: number } | null };
    },
  });

  if (!data) return null;

  const entries = [
    { name: "Fajr", time: data.timings.Fajr },
    { name: "Sunrise", time: data.timings.Sunrise },
    { name: "Dhuhr", time: data.timings.Dhuhr },
    { name: "Asr", time: data.timings.Asr },
    { name: "Maghrib", time: data.timings.Maghrib },
    { name: "Isha", time: data.timings.Isha },
  ];

  return (
    <div className="rounded-lg border border-[#eda10040] bg-[#faeeda] p-4 dark:bg-[#3a2200] dark:text-[#faeeda]">
      <div className="mb-2 flex items-center justify-between">
        <strong className="text-sm">Prayer Times</strong>
        {data.next && (
          <span className="text-xs font-medium text-[#633806] dark:text-[#eda100]">
            {data.next.name} in {data.next.minutesUntil} min
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {entries.map((p) => (
          <div
            key={p.name}
            className={cn(
              "rounded-md border border-[#eda10040] bg-[#fff8ec] px-2.5 py-1 text-xs dark:bg-[#633806]/30",
              data.next?.name === p.name && "ring-2 ring-[#eda100]",
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
