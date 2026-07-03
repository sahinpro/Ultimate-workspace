export type PrayerTimings = {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
};

const PRAYER_NAMES = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;

export function parsePrayerTime(timeStr: string, date: Date): Date {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

function parseTimingsResponse(timings: Record<string, string>): PrayerTimings {
  return {
    Fajr: timings.Fajr.split(" ")[0],
    Sunrise: timings.Sunrise.split(" ")[0],
    Dhuhr: timings.Dhuhr.split(" ")[0],
    Asr: timings.Asr.split(" ")[0],
    Maghrib: timings.Maghrib.split(" ")[0],
    Isha: timings.Isha.split(" ")[0],
  };
}

export async function fetchPrayerTimesByCoordinates(
  latitude: number,
  longitude: number,
  date: Date,
  method = 1,
): Promise<PrayerTimings> {
  const base = process.env.ALADHAN_API_BASE ?? "https://api.aladhan.com/v1";
  const dateStr = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
  const url = `${base}/timings/${dateStr}?latitude=${latitude}&longitude=${longitude}&method=${method}`;

  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error("Failed to fetch prayer times");

  const json = await res.json();
  return parseTimingsResponse(json.data.timings as Record<string, string>);
}

export async function fetchPrayerTimesFromApi(
  city: string,
  country: string,
  date: Date,
  method = 1,
): Promise<PrayerTimings> {
  const base = process.env.ALADHAN_API_BASE ?? "https://api.aladhan.com/v1";
  const dateStr = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
  const url = `${base}/timingsByCity/${dateStr}?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=${method}`;

  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error("Failed to fetch prayer times");

  const json = await res.json();
  return parseTimingsResponse(json.data.timings as Record<string, string>);
}

export function getNextPrayer(timings: PrayerTimings, now = new Date()): {
  name: string;
  time: Date;
  minutesUntil: number;
} | null {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  for (const name of PRAYER_NAMES) {
    if (name === "Sunrise") continue;
    const time = parsePrayerTime(timings[name], today);
    if (time > now) {
      return {
        name,
        time,
        minutesUntil: Math.round((time.getTime() - now.getTime()) / 60000),
      };
    }
  }

  return null;
}

export function isFriday(date: Date): boolean {
  return date.getDay() === 5;
}

export function isPrayerEnabled(profile: { prayerPreference?: string | null }): boolean {
  return profile.prayerPreference !== "disabled";
}

export { PRAYER_NAMES };
