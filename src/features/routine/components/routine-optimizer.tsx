"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Rule = { id: string; title: string; description: string | null; severity: string };

export function PersonalRulesPanel() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const { data: rules = [] } = useQuery({
    queryKey: ["routine-rules"],
    queryFn: async () => {
      const res = await fetch("/api/v1/routine/blocks");
      const json = await res.json();
      return json.data.rules as Rule[];
    },
  });

  const createRule = useMutation({
    mutationFn: async () => {
      await fetch("/api/v1/routine/blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "rule", title, description }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routine-rules"] });
      setTitle("");
      setDescription("");
    },
  });

  const deleteRule = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/v1/routine/rules/${id}`, { method: "DELETE" });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["routine-rules"] }),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Personal Rules</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rules.map((rule) => (
          <div key={rule.id} className="flex items-start justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">{rule.title}</p>
              {rule.description && (
                <p className="mt-1 text-xs text-muted-foreground">{rule.description}</p>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={() => deleteRule.mutate(rule.id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
        <div className="space-y-2 border-t pt-3">
          <Input placeholder="Rule title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
          <Button size="sm" disabled={!title} onClick={() => createRule.mutate()}>
            <Plus className="mr-2 h-4 w-4" />Add Rule
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function RoutineOptimizer() {
  const queryClient = useQueryClient();

  const { data, mutate, isPending } = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/v1/routine/optimize", { method: "POST" });
      const json = await res.json();
      return json.data;
    },
  });

  const applyMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/v1/routine/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ range: "week" }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routine-week"] });
      queryClient.invalidateQueries({ queryKey: ["routine-day"] });
      queryClient.invalidateQueries({ queryKey: ["routine-analytics"] });
    },
  });

  const suggestions = data?.suggestions ?? [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-base">AI Routine Optimizer</CardTitle>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => applyMutation.mutate()} disabled={applyMutation.isPending}>
            <RefreshCw className={`mr-1 h-4 w-4 ${applyMutation.isPending ? "animate-spin" : ""}`} />
            Apply
          </Button>
          <Button size="sm" onClick={() => mutate()} disabled={isPending}>
            <Sparkles className="mr-1 h-4 w-4" />
            {isPending ? "..." : "Analyze"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.length === 0 ? (
          <p className="text-sm text-muted-foreground">Analyze your routine, then Apply to regenerate the week.</p>
        ) : (
          suggestions.map((s: { title: string; description: string; impact: string }, i: number) => (
            <div key={i} className="rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{s.title}</span>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] uppercase text-primary">
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
