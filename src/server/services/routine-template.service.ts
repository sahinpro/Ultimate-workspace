import { prisma } from "@/lib/db/prisma";
import { findTemplateByProfession, SYSTEM_TEMPLATES } from "@/lib/routine/templates/seed-templates";

export async function seedRoutineForUser(userId: string, profession: string) {
  const template = findTemplateByProfession(profession) ?? SYSTEM_TEMPLATES[0];

  await prisma.routineBlock.deleteMany({ where: { userId } });
  await prisma.personalRule.deleteMany({ where: { userId } });

  const routineTemplate = await prisma.routineTemplate.create({
    data: {
      userId,
      name: template.name,
      profession: template.profession,
      isSystem: false,
    },
  });

  await Promise.all(
    template.blocks.map((block, index) =>
      prisma.routineBlock.create({
        data: {
          userId,
          templateId: routineTemplate.id,
          title: block.title,
          icon: block.icon,
          color: block.color,
          durationMinutes: block.durationMinutes,
          category: block.category,
          startTimeHint: block.startTimeHint,
          daysOfWeek: block.daysOfWeek,
          priority: block.priority,
          energyLevel: block.energyLevel,
          schedulingMode: "FLEXIBLE",
          sortOrder: index,
        },
      }),
    ),
  );

  await Promise.all(
    template.rules.map((rule, index) =>
      prisma.personalRule.create({
        data: {
          userId,
          title: rule.title,
          description: rule.description,
          severity: rule.severity,
          sortOrder: index,
        },
      }),
    ),
  );

  return routineTemplate;
}

export async function seedSystemTemplates() {
  for (const template of SYSTEM_TEMPLATES) {
    const existing = await prisma.routineTemplate.findFirst({
      where: { isSystem: true, profession: template.profession },
    });
    if (existing) continue;

    const created = await prisma.routineTemplate.create({
      data: {
        name: template.name,
        profession: template.profession,
        isSystem: true,
      },
    });

    await Promise.all(
      template.blocks.map((block, index) =>
        prisma.routineBlock.create({
          data: {
            templateId: created.id,
            title: block.title,
            icon: block.icon,
            color: block.color,
            durationMinutes: block.durationMinutes,
            category: block.category,
            startTimeHint: block.startTimeHint,
            daysOfWeek: block.daysOfWeek,
            priority: block.priority,
            energyLevel: block.energyLevel,
            schedulingMode: "FLEXIBLE",
            sortOrder: index,
          },
        }),
      ),
    );
  }
}
