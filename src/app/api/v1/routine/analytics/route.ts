import { NextRequest, NextResponse } from "next/server";
import { requireAuth, handleApiError } from "@/lib/api/auth-guard";
import { apiSuccess } from "@/lib/api/response";
import { getRoutineAnalytics } from "@/server/services/routine-analytics.service";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const range = (req.nextUrl.searchParams.get("range") ?? "week") as "week" | "month";
    const analytics = await getRoutineAnalytics(session.user.id, range);
    return NextResponse.json(apiSuccess(analytics));
  } catch (error) {
    return handleApiError(error);
  }
}
