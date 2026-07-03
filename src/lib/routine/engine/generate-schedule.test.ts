import { describe, it, expect } from "vitest";
import {
  detectConflicts,
  generatePrayerBlocks,
  getEnergyForHour,
} from "@/lib/routine/engine/generate-schedule";
import type { Profile } from "@prisma/client";
import { encryptVaultPayload, decryptVaultPayload } from "@/lib/crypto/vault";

describe("Routine Engine", () => {
  it("detects overlapping blocks", () => {
    const date = new Date("2026-07-02T09:00:00");
    const end = new Date("2026-07-02T10:00:00");
    const conflicts = detectConflicts([
      {
        title: "A",
        color: "#000",
        icon: "clock",
        category: "DEEP_WORK",
        startTime: date,
        endTime: end,
        isFlexible: true,
        isPrayerBlock: false,
        sortOrder: 0,
      },
      {
        title: "B",
        color: "#000",
        icon: "clock",
        category: "LEARNING",
        startTime: new Date("2026-07-02T09:30:00"),
        endTime: new Date("2026-07-02T11:00:00"),
        isFlexible: true,
        isPrayerBlock: false,
        sortOrder: 1,
      },
    ]);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].message).toContain("overlaps");
  });

  it("generates prayer blocks including Jumuah on Friday", () => {
    const friday = new Date("2026-07-03T12:00:00");
    const blocks = generatePrayerBlocks(
      friday,
      { Fajr: "3:47", Sunrise: "5:15", Dhuhr: "12:02", Asr: "15:21", Maghrib: "18:50", Isha: "20:17" },
      true,
    );
    const juma = blocks.find((b) => b.title.includes("Jumu"));
    expect(juma).toBeDefined();
    expect(juma?.isPrayerBlock).toBe(true);
  });

  it("maps energy levels by time of day", () => {
    const profile = {
      energyProfile: { morning: "HIGH", afternoon: "MEDIUM", evening: "LOW", night: "LOW" },
    } as Profile;
    expect(getEnergyForHour(8, profile)).toBe("HIGH");
    expect(getEnergyForHour(14, profile)).toBe("MEDIUM");
    expect(getEnergyForHour(19, profile)).toBe("LOW");
  });
});

describe("Vault encryption", () => {
  it("encrypts and decrypts payload", () => {
    const userId = "test-user-id";
    const plaintext = "sk-secret-api-key-12345";
    const { encrypted, iv } = encryptVaultPayload(plaintext, userId);
    const decrypted = decryptVaultPayload(encrypted, iv, userId);
    expect(decrypted).toBe(plaintext);
    expect(encrypted).not.toBe(plaintext);
  });
});
