import { NextRequest, NextResponse } from "next/server";
import { requireAuth, handleApiError } from "@/lib/api/auth-guard";
import { apiSuccess } from "@/lib/api/response";
import { taskSchema } from "@/lib/validations/schemas";
import { createTask, listTasks } from "@/server/services/task.service";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = req.nextUrl;
    const result = await listTasks(session.user.id, {
      status: searchParams.get("status") as never,
      priority: searchParams.get("priority") as never,
      page: Number(searchParams.get("page") ?? 1),
      limit: Number(searchParams.get("limit") ?? 20),
    });
    return NextResponse.json(apiSuccess(result.tasks, { total: result.total, page: result.page }));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = taskSchema.parse(await req.json());
    const task = await createTask(session.user.id, {
      ...body,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
    });
    return NextResponse.json(apiSuccess(task), { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
