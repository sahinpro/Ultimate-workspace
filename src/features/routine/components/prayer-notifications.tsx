"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";

export function PrayerNotifications() {
  const [dismissed, setDismissed] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ["prayer-times", "notifications"],
    queryFn: async () => {
      const res = await fetch("/api/v1/routine/prayer-times");
      const json = await res.json();
      return json.data as { next: { name: string; minutesUntil: number } | null };
    },
    refetchInterval: 60000,
  });

  const next = data?.next;
  const show =
    next &&
    next.minutesUntil <= 20 &&
    next.minutesUntil > 0 &&
    dismissed !== `${next.name}-${next.minutesUntil}`;

  useEffect(() => {
    if (!next) return;
    if (next.minutesUntil <= 10 && next.minutesUntil > 0) {
      setDismissed(null);
    }
  }, [next]);

  if (!show || !next) return null;

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 max-w-sm rounded-2xl p-4 shadow-xl",
        next.minutesUntil <= 10
          ? "glass-panel border-[#eda10040] bg-[#faeeda]/70 text-[#633806] dark:bg-[#3a2200]/70 dark:text-[#faeeda]"
          : "glass-panel",
      )}
    >
      <div className="flex items-start gap-3">
        <Bell className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium">
            {next.name} in {next.minutesUntil} minutes
          </p>
          <p className="mt-1 text-xs opacity-80">
            {next.minutesUntil <= 10
              ? "Wrap up your current task and prepare for salah."
              : "You have time to finish your current block."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(`${next.name}-${next.minutesUntil}`)}
          className="text-xs opacity-60 hover:opacity-100"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
