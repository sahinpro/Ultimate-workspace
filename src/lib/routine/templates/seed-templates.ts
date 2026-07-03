import type { BlockCategory } from "@prisma/client";

export type TemplateBlockDef = {
  title: string;
  icon: string;
  color: string;
  durationMinutes: number;
  category: BlockCategory;
  startTimeHint?: string;
  daysOfWeek: number[];
  priority: "LOW" | "MEDIUM" | "HIGH" | "SACRED";
  energyLevel: "LOW" | "MEDIUM" | "HIGH";
};

export type ProfessionTemplate = {
  name: string;
  profession: string;
  blocks: TemplateBlockDef[];
  rules: { title: string; description: string; severity: "INFO" | "IMPORTANT" | "SACRED" }[];
};

export const SYSTEM_TEMPLATES: ProfessionTemplate[] = [
  {
    name: "Software Engineer",
    profession: "software_engineer",
    blocks: [
      { title: "JS Study", icon: "book-open", color: "#2a78d6", durationMinutes: 120, category: "LEARNING", startTimeHint: "06:00", daysOfWeek: [1, 3, 4, 5, 6], priority: "SACRED", energyLevel: "HIGH" },
      { title: "Post Content", icon: "send", color: "#1baf7a", durationMinutes: 30, category: "CONTENT_CREATION", startTimeHint: "08:00", daysOfWeek: [1, 3, 4, 5, 6], priority: "MEDIUM", energyLevel: "MEDIUM" },
      { title: "Job Work", icon: "briefcase", color: "#4a3aa7", durationMinutes: 180, category: "OFFICE_WORK", startTimeHint: "09:00", daysOfWeek: [1, 2, 3, 4, 5, 6], priority: "HIGH", energyLevel: "HIGH" },
      { title: "Job Work", icon: "briefcase", color: "#4a3aa7", durationMinutes: 90, category: "OFFICE_WORK", startTimeHint: "12:30", daysOfWeek: [1, 2, 3, 4, 6], priority: "HIGH", energyLevel: "MEDIUM" },
      { title: "Rest/Eat", icon: "coffee", color: "#e1e0d9", durationMinutes: 60, category: "BREAK", startTimeHint: "14:00", daysOfWeek: [1, 2, 3, 4, 5, 6], priority: "LOW", energyLevel: "LOW" },
      { title: "Freelance DMs", icon: "message-circle", color: "#e24b4a", durationMinutes: 120, category: "DEEP_WORK", startTimeHint: "15:30", daysOfWeek: [1, 3, 5], priority: "HIGH", energyLevel: "MEDIUM" },
      { title: "Blog Draft", icon: "pen-line", color: "#1baf7a", durationMinutes: 120, category: "CONTENT_CREATION", startTimeHint: "15:30", daysOfWeek: [2, 4], priority: "MEDIUM", energyLevel: "MEDIUM" },
      { title: "Weekly Proposal", icon: "file-text", color: "#e24b4a", durationMinutes: 90, category: "DEEP_WORK", startTimeHint: "15:30", daysOfWeek: [5], priority: "HIGH", energyLevel: "HIGH" },
      { title: "Family Time", icon: "heart", color: "#e1e0d9", durationMinutes: 60, category: "FAMILY_TIME", startTimeHint: "19:00", daysOfWeek: [0, 1, 2, 3, 4, 5, 6], priority: "MEDIUM", energyLevel: "LOW" },
      { title: "Wind Down", icon: "moon", color: "#e1e0d9", durationMinutes: 90, category: "SLEEP", startTimeHint: "20:30", daysOfWeek: [0, 1, 2, 3, 4, 5, 6], priority: "LOW", energyLevel: "LOW" },
    ],
    rules: [
      { title: "6am block is sacred", description: "Miss everything else before you miss Fajr or the 6–8am study block.", severity: "SACRED" },
      { title: "Sunday = full rest", description: "No code, no DMs, no content. Scheduled recovery, not guilt-driven rest.", severity: "SACRED" },
      { title: "Prayer = natural context switch", description: "Use the 5–10 min after prayer to set intention for the next block.", severity: "IMPORTANT" },
      { title: "Bangladesh weekend: Fri–Sat", description: "Fri is Jumu'ah + half rest. Sat is study + light job work. Sun is complete rest.", severity: "IMPORTANT" },
    ],
  },
  {
    name: "UI/UX Designer",
    profession: "ui_ux_designer",
    blocks: [
      { title: "Design Inspiration", icon: "palette", color: "#2a78d6", durationMinutes: 60, category: "LEARNING", startTimeHint: "07:00", daysOfWeek: [1, 2, 3, 4, 5], priority: "MEDIUM", energyLevel: "HIGH" },
      { title: "Deep Design Work", icon: "figma", color: "#4a3aa7", durationMinutes: 180, category: "DEEP_WORK", startTimeHint: "09:00", daysOfWeek: [1, 2, 3, 4, 5], priority: "HIGH", energyLevel: "HIGH" },
      { title: "Client Reviews", icon: "users", color: "#1baf7a", durationMinutes: 60, category: "MEETINGS", startTimeHint: "14:00", daysOfWeek: [1, 3, 5], priority: "MEDIUM", energyLevel: "MEDIUM" },
      { title: "Portfolio Update", icon: "layout", color: "#e24b4a", durationMinutes: 90, category: "CONTENT_CREATION", startTimeHint: "16:00", daysOfWeek: [2, 4], priority: "MEDIUM", energyLevel: "MEDIUM" },
    ],
    rules: [
      { title: "Morning is for creative work", description: "Schedule demanding design tasks before noon.", severity: "IMPORTANT" },
    ],
  },
  {
    name: "Freelancer",
    profession: "freelancer",
    blocks: [
      { title: "Client Outreach", icon: "mail", color: "#e24b4a", durationMinutes: 90, category: "DEEP_WORK", startTimeHint: "09:00", daysOfWeek: [1, 2, 3, 4, 5], priority: "HIGH", energyLevel: "HIGH" },
      { title: "Project Work", icon: "code", color: "#4a3aa7", durationMinutes: 240, category: "DEEP_WORK", startTimeHint: "10:30", daysOfWeek: [1, 2, 3, 4, 5], priority: "HIGH", energyLevel: "HIGH" },
      { title: "Admin & Invoicing", icon: "receipt", color: "#1baf7a", durationMinutes: 60, category: "OFFICE_WORK", startTimeHint: "16:00", daysOfWeek: [5], priority: "MEDIUM", energyLevel: "LOW" },
    ],
    rules: [],
  },
  {
    name: "Student",
    profession: "student",
    blocks: [
      { title: "Morning Study", icon: "book-open", color: "#2a78d6", durationMinutes: 120, category: "LEARNING", startTimeHint: "07:00", daysOfWeek: [1, 2, 3, 4, 5], priority: "HIGH", energyLevel: "HIGH" },
      { title: "Classes", icon: "graduation-cap", color: "#4a3aa7", durationMinutes: 180, category: "LEARNING", startTimeHint: "10:00", daysOfWeek: [1, 2, 3, 4, 5], priority: "HIGH", energyLevel: "MEDIUM" },
      { title: "Assignment Work", icon: "pen", color: "#1baf7a", durationMinutes: 120, category: "DEEP_WORK", startTimeHint: "15:00", daysOfWeek: [1, 2, 3, 4, 5, 6], priority: "MEDIUM", energyLevel: "MEDIUM" },
    ],
    rules: [],
  },
  {
    name: "Startup Founder",
    profession: "startup_founder",
    blocks: [
      { title: "Strategy & Planning", icon: "target", color: "#2a78d6", durationMinutes: 60, category: "DEEP_WORK", startTimeHint: "07:00", daysOfWeek: [1, 2, 3, 4, 5], priority: "HIGH", energyLevel: "HIGH" },
      { title: "Deep Work", icon: "zap", color: "#4a3aa7", durationMinutes: 180, category: "DEEP_WORK", startTimeHint: "09:00", daysOfWeek: [1, 2, 3, 4, 5], priority: "SACRED", energyLevel: "HIGH" },
      { title: "Meetings", icon: "video", color: "#1baf7a", durationMinutes: 120, category: "MEETINGS", startTimeHint: "14:00", daysOfWeek: [1, 2, 3, 4, 5], priority: "MEDIUM", energyLevel: "MEDIUM" },
    ],
    rules: [],
  },
  {
    name: "Remote Worker",
    profession: "remote_worker",
    blocks: [
      { title: "Morning Routine", icon: "sun", color: "#eda100", durationMinutes: 60, category: "MORNING_ROUTINE", startTimeHint: "07:00", daysOfWeek: [1, 2, 3, 4, 5], priority: "MEDIUM", energyLevel: "MEDIUM" },
      { title: "Focus Block", icon: "focus", color: "#4a3aa7", durationMinutes: 150, category: "DEEP_WORK", startTimeHint: "09:00", daysOfWeek: [1, 2, 3, 4, 5], priority: "HIGH", energyLevel: "HIGH" },
      { title: "Break", icon: "coffee", color: "#e1e0d9", durationMinutes: 30, category: "BREAK", startTimeHint: "12:00", daysOfWeek: [1, 2, 3, 4, 5], priority: "LOW", energyLevel: "LOW" },
      { title: "Afternoon Work", icon: "laptop", color: "#4a3aa7", durationMinutes: 180, category: "OFFICE_WORK", startTimeHint: "13:00", daysOfWeek: [1, 2, 3, 4, 5], priority: "HIGH", energyLevel: "MEDIUM" },
    ],
    rules: [],
  },
];

export function findTemplateByProfession(profession: string): ProfessionTemplate | undefined {
  return SYSTEM_TEMPLATES.find((t) => t.profession === profession);
}
