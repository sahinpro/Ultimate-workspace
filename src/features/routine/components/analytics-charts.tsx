"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

export function RoutineAnalyticsDashboard() {
  const [range, setRange] = useState<"week" | "month">("week");

  const { data, isLoading } = useQuery({
    queryKey: ["routine-analytics", range],
    queryFn: async () => {
      const res = await fetch(`/api/v1/routine/analytics?range=${range}`);
      const json = await res.json();
      return json.data;
    },
  });

  if (isLoading) return <div className="animate-pulse rounded-xl bg-muted h-64" />;

  const stats = [
    { label: "Focus Time", value: `${data?.focusMinutes ?? 0} min` },
    { label: "Deep Work", value: `${data?.deepWorkHours ?? 0}h` },
    { label: "Prayer Consistency", value: `${data?.prayerConsistency ?? 0}%` },
    { label: "Productivity Score", value: data?.productivityScore ?? 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Button variant={range === "week" ? "default" : "outline"} size="sm" onClick={() => setRange("week")}>
          Week
        </Button>
        <Button variant={range === "month" ? "default" : "outline"} size="sm" onClick={() => setRange("month")}>
          Month
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Completion Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={data?.completionRate ?? 0} className="mb-2" />
          <p className="text-sm text-muted-foreground">
            {data?.completedBlocks ?? 0} of {data?.totalBlocks ?? 0} blocks completed
          </p>
        </CardContent>
      </Card>

      {data?.weeklyTrends?.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Daily Focus Minutes</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.weeklyTrends}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="focusMinutes" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Completion Trend</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.weeklyTrends}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="completionRate" stroke="#eda100" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
