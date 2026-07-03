import { NextRequest, NextResponse } from "next/server";
import { requireAuth, handleApiError } from "@/lib/api/auth-guard";
import { apiSuccess } from "@/lib/api/response";
import { generateAISuggestions } from "@/server/services/ai-optimizer.service";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json().catch(() => ({}));
    const date = body.date ? new Date(body.date) : undefined;
    const result = await generateAISuggestions(session.user.id, date);
    return NextResponse.json(apiSuccess(result));
  } catch (error) {
    return handleApiError(error);
  }
}
