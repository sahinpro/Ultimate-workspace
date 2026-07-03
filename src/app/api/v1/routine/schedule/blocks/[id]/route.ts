import { NextRequest, NextResponse } from "next/server";
import { requireAuth, handleApiError } from "@/lib/api/auth-guard";
import { apiSuccess } from "@/lib/api/response";
import { scheduleBlockPatchSchema } from "@/lib/validations/schemas";
import { routineEngine } from "@/server/services/routine-engine.service";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const body = scheduleBlockPatchSchema.parse(await req.json());
    const result = await routineEngine.updateScheduledBlock(session.user.id, id, {
      startTime: body.startTime ? new Date(body.startTime) : undefined,
      endTime: body.endTime ? new Date(body.endTime) : undefined,
      title: body.title,
      status: body.status,
    });
    return NextResponse.json(apiSuccess(result));
  } catch (error) {
    return handleApiError(error);
  }
}
