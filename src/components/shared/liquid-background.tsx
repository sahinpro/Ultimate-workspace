import { cn } from "@/lib/utils";
import { BACKGROUNDS, type BackgroundKey } from "@/lib/design/backgrounds";
import type { ReactNode } from "react";

type LiquidBackgroundProps = {
  variant?: BackgroundKey;
  className?: string;
  children?: ReactNode;
};

export function LiquidBackground({
  variant = "mist",
  className,
  children,
}: LiquidBackgroundProps) {
  return (
    <div className={cn("liquid-scene", className)}>
      <div
        className="liquid-scene__photo"
        style={{ backgroundImage: `url(${BACKGROUNDS[variant]})` }}
        aria-hidden
      />
      <div className="liquid-scene__orbs" aria-hidden>
        <span className="liquid-orb liquid-orb--1" />
        <span className="liquid-orb liquid-orb--2" />
        <span className="liquid-orb liquid-orb--3" />
      </div>
      <div className="liquid-scene__frost" aria-hidden />
      {children}
    </div>
  );
}
