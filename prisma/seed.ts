import { PrismaClient } from "@prisma/client";
import { SYSTEM_TEMPLATES } from "../src/lib/routine/templates/seed-templates";

const prisma = new PrismaClient();

async function seedSystemTemplates() {
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

async function main() {
  await seedSystemTemplates();
  console.log("Seeded system routine templates");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
