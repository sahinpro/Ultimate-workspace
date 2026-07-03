"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  autoSchedule: boolean;
};

export default function TasksPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [autoSchedule, setAutoSchedule] = useState(false);

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks", filter],
    queryFn: async () => {
      const params = filter !== "all" ? `?status=${filter}` : "";
      const res = await fetch(`/api/v1/tasks${params}`);
      const json = await res.json();
      return json.data as Task[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/v1/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, priority, autoSchedule }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setOpen(false);
      setTitle("");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await fetch(`/api/v1/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/v1/tasks/${id}`, { method: "DELETE" });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const priorityColors: Record<string, string> = {
    LOW: "bg-muted",
    MEDIUM: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    HIGH: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    URGENT: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Tasks</h1>
            <p className="text-muted-foreground">Manage and auto-schedule your tasks</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" />New Task</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["LOW", "MEDIUM", "HIGH", "URGENT"].map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={autoSchedule} onChange={(e) => setAutoSchedule(e.target.checked)} />
                  Auto-schedule into routine
                </label>
                <Button onClick={() => createMutation.mutate()} disabled={!title || createMutation.isPending}>
                  Create
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-2">
          {["all", "TODO", "IN_PROGRESS", "DONE"].map((s) => (
            <Button
              key={s}
              variant={filter === s ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(s)}
            >
              {s === "all" ? "All" : s.replace("_", " ")}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="animate-pulse space-y-2">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-lg bg-muted" />)}
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <Card key={task.id}>
                <CardContent className="flex items-center gap-3 p-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      updateMutation.mutate({
                        id: task.id,
                        status: task.status === "DONE" ? "TODO" : "DONE",
                      })
                    }
                  >
                    <Check className={cn("h-4 w-4", task.status === "DONE" && "text-green-500")} />
                  </Button>
                  <div className="flex-1">
                    <p className={cn("font-medium", task.status === "DONE" && "line-through text-muted-foreground")}>
                      {task.title}
                    </p>
                    {task.autoSchedule && (
                      <span className="text-[10px] text-primary">Auto-scheduled</span>
                    )}
                  </div>
                  <span className={cn("rounded-full px-2 py-0.5 text-xs", priorityColors[task.priority])}>
                    {task.priority}
                  </span>
                  <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(task.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </CardContent>
              </Card>
            ))}
            {tasks.length === 0 && (
              <p className="py-12 text-center text-muted-foreground">No tasks yet</p>
            )}
          </div>
        )}
      </div>
  );
}
