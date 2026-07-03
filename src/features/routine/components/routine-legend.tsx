"use client";

import { cn } from "@/lib/utils";

const LEGEND = [
  { label: "Salah / prayer", color: "#eda100" },
  { label: "JS learning", color: "#2a78d6" },
  { label: "Content/posting", color: "#1baf7a" },
  { label: "Job work", color: "#4a3aa7" },
  { label: "Freelance", color: "#e24b4a" },
  { label: "Rest/buffer", color: "#e1e0d9" },
];

export function RoutineLegend() {
  return (
    <div className="flex flex-wrap gap-3">
      {LEGEND.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="h-2.5 w-2.5 rounded-sm" style={{ background: item.color }} />
          {item.label}
        </div>
      ))}
    </div>
  );
}

export function getBlockStyle(color: string, isPrayer: boolean, isJuma?: boolean) {
  if (isJuma) return "bg-[#eda100] text-white font-medium";
  if (isPrayer) return "bg-[#faeeda] text-[#633806] border border-[#eda10060] dark:bg-[#3a2200] dark:text-[#faeeda]";
  return "";
}

export function BlockCell({
  title,
  color,
  isPrayerBlock,
  isJuma,
  className,
}: {
  title: string;
  color: string;
  isPrayerBlock?: boolean;
  isJuma?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-[26px] items-center justify-center rounded px-1 py-0.5 text-center text-[10px] leading-tight sm:text-xs",
        getBlockStyle(color, !!isPrayerBlock, isJuma),
        className,
      )}
      style={
        !isPrayerBlock && !isJuma
          ? { backgroundColor: `${color}20`, color, border: `0.5px solid ${color}40` }
          : undefined
      }
    >
      {title}
    </div>
  );
}
