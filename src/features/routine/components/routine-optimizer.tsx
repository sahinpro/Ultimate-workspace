"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RoutineOptimizer() {
  const queryClient = useQueryClient();

  const { data, mutate, isPending } = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/v1/routine/optimize", { method: "POST" });
      const json = await res.json();
      return json.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["routine-week"] }),
  });

  const suggestions = data?.suggestions ?? [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">AI Routine Optimizer</CardTitle>
        <Button size="sm" onClick={() => mutate()} disabled={isPending}>
          <Sparkles className="mr-2 h-4 w-4" />
          {isPending ? "Analyzing..." : "Get Suggestions"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Click to analyze your routine patterns and get personalized suggestions.
          </p>
        ) : (
          suggestions.map((s: { type: string; title: string; description: string; impact: string }, i: number) => (
            <div key={i} className="rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{s.title}</span>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary uppercase">
                  {s.impact}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{s.description}</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
