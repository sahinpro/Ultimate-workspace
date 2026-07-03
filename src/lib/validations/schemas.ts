import { z } from "zod";

export const onboardingSchema = z.object({
  name: z.string().min(2).max(100),
  timezone: z.string().min(1),
  country: z.string().min(2).max(2),
  language: z.string().min(2).max(5),
  profession: z.string().min(1),
  workingHoursStart: z.string(),
  workingHoursEnd: z.string(),
  sleepStart: z.string(),
  sleepEnd: z.string(),
  prayerPreference: z.enum(["enabled", "disabled"]),
  prayerMethod: z.number().int().min(0).max(23).optional(),
  city: z.string().optional(),
  locationLabel: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

export const profileUpdateSchema = onboardingSchema.partial();

export const taskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE", "CANCELLED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  dueDate: z.string().datetime().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  autoSchedule: z.boolean().optional(),
});

export const vaultItemSchema = z.object({
  title: z.string().min(1).max(200),
  payload: z.string().min(1).max(10000),
  type: z.enum(["API_KEY", "PASSWORD", "NOTE", "OTHER"]).optional(),
});

export const routineBlockSchema = z.object({
  title: z.string().min(1).max(100),
  icon: z.string().optional(),
  color: z.string().optional(),
  durationMinutes: z.number().int().min(5).max(480),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "SACRED"]).optional(),
  energyLevel: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  category: z.string(),
  schedulingMode: z.enum(["FLEXIBLE", "FIXED"]).optional(),
  daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
  startTimeHint: z.string().optional(),
});

export const scheduleBlockPatchSchema = z.object({
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  title: z.string().optional(),
  status: z.enum(["PLANNED", "IN_PROGRESS", "COMPLETED", "SKIPPED", "MISSED"]).optional(),
});

export const personalRuleSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  severity: z.enum(["INFO", "IMPORTANT", "SACRED"]).optional(),
});

export const optimizeSchema = z.object({
  date: z.string().optional(),
});
