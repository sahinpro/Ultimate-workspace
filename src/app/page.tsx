import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="glass-card max-w-2xl p-12 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight">Ultimate Workspace</h1>
        <p className="mb-8 text-lg text-muted-foreground">
          Your AI-powered second brain. Smart routines, tasks, and vault — all in one place.
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/register">Get Started</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
