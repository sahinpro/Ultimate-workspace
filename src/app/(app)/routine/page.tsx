import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WeeklyGrid } from "@/features/routine/components/weekly-grid";
import { InteractiveDailyTimeline } from "@/features/routine/components/interactive-daily-timeline";
import { RoutineAnalyticsDashboard } from "@/features/routine/components/analytics-charts";
import { RoutineOptimizer, PersonalRulesPanel } from "@/features/routine/components/routine-optimizer";

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
          <TabsTrigger value="rules">Rules</TabsTrigger>
        </TabsList>
        <TabsContent value="week" className="mt-4">
          <WeeklyGrid />
        </TabsContent>
        <TabsContent value="day" className="mt-4">
          <InteractiveDailyTimeline />
        </TabsContent>
        <TabsContent value="analytics" className="mt-4 space-y-6">
          <RoutineAnalyticsDashboard />
          <RoutineOptimizer />
        </TabsContent>
        <TabsContent value="rules" className="mt-4">
          <PersonalRulesPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
