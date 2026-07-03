import { prisma } from "@/lib/db/prisma";
import {
  fetchPrayerTimesFromApi,
  type PrayerTimings,
} from "@/lib/prayer/aladhan-client";

export async function getPrayerTimesForUser(
  userId: string,
  date: Date,
): Promise<PrayerTimings> {
  const dateOnly = new Date(date);
  dateOnly.setHours(0, 0, 0, 0);

  const cached = await prisma.prayerTimeCache.findUnique({
    where: { userId_date: { userId, date: dateOnly } },
  });

  if (cached) {
    return cached.timings as unknown as PrayerTimings;
  }

  const profile = await prisma.profile.findUnique({ where: { userId } });
  const city = profile?.city ?? "Dhaka";
  const country = profile?.country ?? "BD";
  const method = profile?.prayerMethod ?? 1;

  const timings = await fetchPrayerTimesFromApi(city, country, dateOnly, method);

  await prisma.prayerTimeCache.upsert({
    where: { userId_date: { userId, date: dateOnly } },
    create: { userId, date: dateOnly, city, country, timings },
    update: { timings, fetchedAt: new Date() },
  });

  return timings;
}
