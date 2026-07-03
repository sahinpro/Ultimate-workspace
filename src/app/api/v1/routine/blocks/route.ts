import { NextRequest, NextResponse } from "next/server";
import { requireAuth, handleApiError } from "@/lib/api/auth-guard";
import { apiSuccess } from "@/lib/api/response";
import { prisma } from "@/lib/db/prisma";
import { routineBlockSchema, personalRuleSchema } from "@/lib/validations/schemas";

export async function GET() {
  try {
    const session = await requireAuth();
    const [blocks, templates, rules] = await Promise.all([
      prisma.routineBlock.findMany({
        where: { userId: session.user.id, deletedAt: null },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.routineTemplate.findMany({
        where: { OR: [{ userId: session.user.id }, { isSystem: true }], deletedAt: null },
        include: { blocks: true },
      }),
      prisma.personalRule.findMany({
        where: { userId: session.user.id },
        orderBy: { sortOrder: "asc" },
      }),
    ]);
    return NextResponse.json(apiSuccess({ blocks, templates, rules }));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    if (body.type === "rule") {
      const data = personalRuleSchema.parse(body);
      const rule = await prisma.personalRule.create({
        data: { userId: session.user.id, ...data },
      });
      return NextResponse.json(apiSuccess(rule), { status: 201 });
    }
    const data = routineBlockSchema.parse(body);
    const block = await prisma.routineBlock.create({
      data: {
        userId: session.user.id,
        title: data.title,
        icon: data.icon ?? "clock",
        color: data.color ?? "#4a3aa7",
        durationMinutes: data.durationMinutes,
        priority: data.priority ?? "MEDIUM",
        energyLevel: data.energyLevel ?? "MEDIUM",
        category: data.category as never,
        schedulingMode: data.schedulingMode ?? "FLEXIBLE",
        daysOfWeek: data.daysOfWeek ?? [],
        startTimeHint: data.startTimeHint,
      },
    });
    return NextResponse.json(apiSuccess(block), { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
