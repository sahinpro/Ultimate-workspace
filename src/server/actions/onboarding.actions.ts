"use server";

import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { onboardingSchema, type OnboardingInput } from "@/lib/validations/schemas";
import { seedRoutineForUser } from "@/server/services/routine-template.service";
import { routineEngine } from "@/server/services/routine-engine.service";

const PROFESSION_MAP: Record<string, string> = {
  software_engineer: "software_engineer",
  ui_ux_designer: "ui_ux_designer",
  freelancer: "freelancer",
  student: "student",
  startup_founder: "startup_founder",
  remote_worker: "remote_worker",
};

export async function completeOnboarding(input: OnboardingInput) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const parsed = onboardingSchema.parse(input);
  const userId = session.user.id;

  const weekendRules =
    parsed.country === "BD"
      ? { restDays: [0], halfDays: [5], weekendStart: 5 }
      : { restDays: [0, 6] };

  const energyProfile = {
    morning: "HIGH",
    afternoon: "MEDIUM",
    evening: "LIGHT",
    night: "PERSONAL",
  };

  await prisma.user.update({
    where: { id: userId },
    data: { name: parsed.name },
  });

  await prisma.profile.upsert({
    where: { userId },
    create: {
      userId,
      timezone: parsed.timezone,
      country: parsed.country,
      language: parsed.language,
      profession: parsed.profession,
      workingHours: { start: parsed.workingHoursStart, end: parsed.workingHoursEnd },
      sleepSchedule: { start: parsed.sleepStart, end: parsed.sleepEnd },
      prayerPreference: parsed.prayerPreference,
      energyProfile,
      weekendRules,
      city: parsed.city ?? "Dhaka",
      latitude: parsed.latitude,
      longitude: parsed.longitude,
      onboardingComplete: true,
    },
    update: {
      timezone: parsed.timezone,
      country: parsed.country,
      language: parsed.language,
      profession: parsed.profession,
      workingHours: { start: parsed.workingHoursStart, end: parsed.workingHoursEnd },
      sleepSchedule: { start: parsed.sleepStart, end: parsed.sleepEnd },
      prayerPreference: parsed.prayerPreference,
      energyProfile,
      weekendRules,
      city: parsed.city,
      latitude: parsed.latitude,
      longitude: parsed.longitude,
      onboardingComplete: true,
    },
  });

  const professionKey = PROFESSION_MAP[parsed.profession] ?? "software_engineer";
  await seedRoutineForUser(userId, professionKey);
  await routineEngine.regenerateWeek(userId, new Date());

  await prisma.category.createMany({
    data: [
      { userId, name: "Work", color: "#4a3aa7" },
      { userId, name: "Personal", color: "#1baf7a" },
      { userId, name: "Learning", color: "#2a78d6" },
    ],
    skipDuplicates: true,
  });

  return { success: true };
}

export async function registerUser(data: { name: string; email: string; password: string }) {
  const bcrypt = await import("bcryptjs");
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new Error("Email already registered");

  const passwordHash = await bcrypt.hash(data.password, 12);
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
    },
  });

  return { id: user.id, email: user.email };
}
