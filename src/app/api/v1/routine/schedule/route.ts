import { NextRequest, NextResponse } from "next/server";
import { requireAuth, handleApiError } from "@/lib/api/auth-guard";
import { apiSuccess } from "@/lib/api/response";
import { routineEngine } from "@/server/services/routine-engine.service";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = req.nextUrl;
    const date = searchParams.get("date") ? new Date(searchParams.get("date")!) : new Date();
    const view = (searchParams.get("view") ?? "day") as "day" | "week";
    const schedule = await routineEngine.getSchedule(session.user.id, date, view);
    return NextResponse.json(apiSuccess(schedule));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const date = body.date ? new Date(body.date) : new Date();
    if (body.range === "week") {
      const result = await routineEngine.regenerateWeek(session.user.id, date);
      return NextResponse.json(apiSuccess(result));
    }
    const result = await routineEngine.generateSchedule(session.user.id, date);
    return NextResponse.json(apiSuccess(result));
  } catch (error) {
    return handleApiError(error);
  }
}
