import { prisma } from "@/lib/db/prisma";
import { getRoutineAnalytics } from "@/server/services/routine-analytics.service";
import { routineEngine } from "@/server/services/routine-engine.service";

export async function generateRoutineSuggestions(userId: string, date?: Date) {
  const analytics = await getRoutineAnalytics(userId, "week");
  const profile = await prisma.profile.findUnique({ where: { userId } });
  const targetDate = date ?? new Date();

  const schedule = await routineEngine.getDaySchedule(userId, targetDate);
  const missedBlocks = schedule.blocks.filter((b) => b.status === "MISSED" || b.status === "SKIPPED");

  const suggestions: {
    type: string;
    title: string;
    description: string;
    impact: "low" | "medium" | "high";
  }[] = [];

  if (analytics.prayerConsistency < 80) {
    suggestions.push({
      type: "prayer",
      title: "Improve prayer consistency",
      description: `Your prayer consistency is ${analytics.prayerConsistency}%. Consider enabling prayer reminders 10 minutes before each salah.`,
      impact: "high",
    });
  }

  if (analytics.completionRate < 60) {
    suggestions.push({
      type: "schedule",
      title: "Reduce daily block count",
      description: "You're completing less than 60% of planned blocks. Try moving non-essential blocks to flexible slots.",
      impact: "medium",
    });
  }

  if (missedBlocks.length > 2) {
    suggestions.push({
      type: "redistribute",
      title: "Redistribute missed tasks",
      description: `${missedBlocks.length} blocks were missed today. Move them to tomorrow's morning focus window.`,
      impact: "high",
    });
  }

  const wh = profile?.workingHours as { start?: string; end?: string } | null;
  if (wh?.start && wh.start > "09:00" && profile?.profession === "software_engineer") {
    suggestions.push({
      type: "energy",
      title: "Earlier deep work start",
      description: "Software engineers typically perform best with deep work before 10am. Consider starting at 8:30am.",
      impact: "medium",
    });
  }

  if (analytics.deepWorkHours < 3) {
    suggestions.push({
      type: "focus",
      title: "Increase deep work hours",
      description: `Only ${analytics.deepWorkHours}h of deep work this week. Aim for 4+ hours by protecting morning blocks.`,
      impact: "high",
    });
  }

  return { suggestions, analytics };
}

export async function generateAISuggestions(userId: string, date?: Date) {
  const base = await generateRoutineSuggestions(userId, date);

  if (!process.env.OPENAI_API_KEY) {
    return base;
  }

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a productivity coach. Given analytics, suggest 1-2 specific routine improvements. Be concise.",
          },
          {
            role: "user",
            content: JSON.stringify(base.analytics),
          },
        ],
        max_tokens: 300,
      }),
    });

    if (res.ok) {
      const json = await res.json();
      const aiText = json.choices?.[0]?.message?.content;
      if (aiText) {
        base.suggestions.push({
          type: "ai",
          title: "AI Recommendation",
          description: aiText,
          impact: "medium",
        });
      }
    }
  } catch {
    // fallback to rule-based only
  }

  return base;
}
