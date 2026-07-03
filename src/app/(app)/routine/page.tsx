import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WeeklyGrid, DailyTimeline } from "@/features/routine/components/weekly-grid";
import { RoutineAnalyticsDashboard } from "@/features/routine/components/analytics-charts";
import { RoutineOptimizer } from "@/features/routine/components/routine-optimizer";

export default function RoutinePage() {
  return (
    <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Smart Routine</h1>
          <p className="text-muted-foreground">Your prayer-aware, intelligently organized day</p>
        </div>
        <Tabs defaultValue="week">
          <TabsList>
            <TabsTrigger value="week">Weekly</TabsTrigger>
            <TabsTrigger value="day">Daily</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          <TabsContent value="week" className="mt-4">
            <WeeklyGrid />
          </TabsContent>
          <TabsContent value="day" className="mt-4">
            <DailyTimeline />
          </TabsContent>
          <TabsContent value="analytics" className="mt-4 space-y-6">
            <RoutineAnalyticsDashboard />
            <RoutineOptimizer />
          </TabsContent>
        </Tabs>
      </div>
  );
}
