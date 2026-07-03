import { NextRequest, NextResponse } from "next/server";
import { requireAuth, handleApiError } from "@/lib/api/auth-guard";
import { apiSuccess } from "@/lib/api/response";
import { getPrayerTimesForUser } from "@/server/services/prayer-time.service";
import { getNextPrayer } from "@/lib/prayer/aladhan-client";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const date = req.nextUrl.searchParams.get("date")
      ? new Date(req.nextUrl.searchParams.get("date")!)
      : new Date();
    const timings = await getPrayerTimesForUser(session.user.id, date);
    const next = getNextPrayer(timings);
    return NextResponse.json(apiSuccess({ timings, next }));
  } catch (error) {
    return handleApiError(error);
  }
}
