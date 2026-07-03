import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LiquidBackground } from "@/components/shared/liquid-background";
import { CalendarDays, CheckSquare, Lock, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <LiquidBackground variant="aurora">
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-10 p-8">
        <div className="glass-panel max-w-2xl p-10 text-center sm:p-14">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl glass-strong">
            <Sparkles className="h-7 w-7 text-primary" />
          </div>
          <h1 className="mb-3 text-4xl font-bold tracking-tight sm:text-5xl">
            <span className="text-gradient">Ultimate Workspace</span>
          </h1>
          <p className="mb-10 text-lg text-muted-foreground">
            Prayer-aware routines, tasks, and vault — crafted with liquid glass clarity.
          </p>
          <div className="mb-10 flex flex-wrap justify-center gap-3">
            {[
              { icon: CalendarDays, label: "Smart Routines" },
              { icon: CheckSquare, label: "Tasks" },
              { icon: Lock, label: "Vault" },
            ].map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm text-muted-foreground"
              >
                <Icon className="h-4 w-4 text-primary" />
                {label}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="rounded-full px-8">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full px-8">
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </div>
    </LiquidBackground>
  );
}
