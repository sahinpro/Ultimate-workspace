import { NextRequest, NextResponse } from "next/server";
import { requireAuth, handleApiError } from "@/lib/api/auth-guard";
import { apiSuccess } from "@/lib/api/response";
import { taskSchema } from "@/lib/validations/schemas";
import { deleteTask, updateTask } from "@/server/services/task.service";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const body = taskSchema.partial().parse(await req.json());
    const task = await updateTask(session.user.id, id, {
      ...body,
      dueDate: body.dueDate === null ? null : body.dueDate ? new Date(body.dueDate) : undefined,
    });
    return NextResponse.json(apiSuccess(task));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    await deleteTask(session.user.id, id);
    return NextResponse.json(apiSuccess({ deleted: true }));
  } catch (error) {
    return handleApiError(error);
  }
}
