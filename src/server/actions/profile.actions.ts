"use server";

import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { profileUpdateSchema } from "@/lib/validations/schemas";
import { invalidatePrayerCache } from "@/server/services/prayer-time.service";
import { routineEngine } from "@/server/services/routine-engine.service";

export async function getProfile() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return prisma.profile.findUnique({
    where: { userId: session.user.id },
  });
}

export async function updateProfile(input: Record<string, unknown>) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const parsed = profileUpdateSchema.parse(input);
  const userId = session.user.id;

  const locationChanged =
    parsed.latitude !== undefined ||
    parsed.longitude !== undefined ||
    parsed.city !== undefined ||
    parsed.country !== undefined;

  const profile = await prisma.profile.update({
    where: { userId },
    data: {
      timezone: parsed.timezone,
      country: parsed.country,
      language: parsed.language,
      city: parsed.city,
      locationLabel: parsed.locationLabel,
      latitude: parsed.latitude,
      longitude: parsed.longitude,
      prayerPreference: parsed.prayerPreference,
      prayerMethod: parsed.prayerMethod,
      workingHours:
        parsed.workingHoursStart && parsed.workingHoursEnd
          ? { start: parsed.workingHoursStart, end: parsed.workingHoursEnd }
          : undefined,
      sleepSchedule:
        parsed.sleepStart && parsed.sleepEnd
          ? { start: parsed.sleepStart, end: parsed.sleepEnd }
          : undefined,
    },
  });

  if (locationChanged) {
    await invalidatePrayerCache(userId);
    await routineEngine.regenerateWeek(userId, new Date());
  }

  return profile;
}
