import { prisma } from "@/lib/db/prisma";
import type { TaskPriority, TaskStatus } from "@prisma/client";
import { routineEngine } from "@/server/services/routine-engine.service";

export async function listTasks(
  userId: string,
  filters?: { status?: TaskStatus; priority?: TaskPriority; page?: number; limit?: number },
) {
  const page = filters?.page ?? 1;
  const limit = filters?.limit ?? 20;
  const where = {
    userId,
    deletedAt: null,
    ...(filters?.status && { status: filters.status }),
    ...(filters?.priority && { priority: filters.priority }),
  };

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      include: {
        category: true,
        tags: true,
        scheduledBlocks: {
          take: 1,
          orderBy: { startTime: "asc" },
          select: { id: true, startTime: true, endTime: true, title: true },
        },
      },
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.task.count({ where }),
  ]);

  return { tasks, total, page, limit };
}

export async function createTask(
  userId: string,
  data: {
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    dueDate?: Date | null;
    categoryId?: string | null;
    autoSchedule?: boolean;
  },
) {
  const task = await prisma.task.create({
    data: {
      userId,
      title: data.title,
      description: data.description,
      status: data.status ?? "TODO",
      priority: data.priority ?? "MEDIUM",
      dueDate: data.dueDate,
      categoryId: data.categoryId,
      autoSchedule: data.autoSchedule ?? false,
    },
    include: { category: true },
  });

  if (task.autoSchedule) {
    const date = task.dueDate ?? new Date();
    await routineEngine.generateSchedule(userId, date);
  }

  return task;
}

export async function updateTask(
  userId: string,
  taskId: string,
  data: Partial<{
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate: Date | null;
    categoryId: string | null;
    autoSchedule: boolean;
  }>,
) {
  const existing = await prisma.task.findFirst({ where: { id: taskId, userId, deletedAt: null } });
  if (!existing) throw new Error("Task not found");

  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      ...data,
      completedAt: data.status === "DONE" ? new Date() : data.status ? null : undefined,
    },
    include: { category: true, scheduledBlocks: { take: 1, orderBy: { startTime: "asc" } } },
  });

  if (data.autoSchedule === true && !existing.autoSchedule) {
    const date = task.dueDate ?? new Date();
    await routineEngine.generateSchedule(userId, date);
  }

  return task;
}

export async function deleteTask(userId: string, taskId: string) {
  const existing = await prisma.task.findFirst({ where: { id: taskId, userId, deletedAt: null } });
  if (!existing) throw new Error("Task not found");
  return prisma.task.update({ where: { id: taskId }, data: { deletedAt: new Date() } });
}
