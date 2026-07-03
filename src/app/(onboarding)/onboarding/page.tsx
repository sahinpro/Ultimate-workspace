"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { onboardingSchema, type OnboardingInput } from "@/lib/validations/schemas";
import { completeOnboarding } from "@/server/actions/onboarding.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { LocationPicker } from "@/components/shared/location-picker";
import { LiquidBackground } from "@/components/shared/liquid-background";
import type { SelectedLocation } from "@/lib/location/types";

const STEPS = ["Profile", "Location", "Schedule", "Profession", "Prayer"];

const PROFESSIONS = [
  { value: "software_engineer", label: "Software Engineer" },
  { value: "ui_ux_designer", label: "UI/UX Designer" },
  { value: "freelancer", label: "Freelancer" },
  { value: "student", label: "Student" },
  { value: "startup_founder", label: "Startup Founder" },
  { value: "remote_worker", label: "Remote Worker" },
];

const PRAYER_METHODS = [
  { value: 1, label: "University of Islamic Sciences, Karachi" },
  { value: 2, label: "Islamic Society of North America (ISNA)" },
  { value: 3, label: "Muslim World League" },
  { value: 4, label: "Umm Al-Qura University, Makkah" },
  { value: 5, label: "Egyptian General Authority of Survey" },
  { value: 8, label: "Gulf Region" },
  { value: 9, label: "Kuwait" },
  { value: 10, label: "Qatar" },
  { value: 11, label: "Singapore" },
  { value: 13, label: "Turkey (Diyanet)" },
  { value: 14, label: "Russia" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [location, setLocation] = useState<SelectedLocation | null>(null);

  const form = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: "",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      country: "BD",
      language: "en",
      profession: "software_engineer",
      workingHoursStart: "09:00",
      workingHoursEnd: "17:00",
      sleepStart: "22:30",
      sleepEnd: "06:00",
      prayerPreference: "enabled",
      prayerMethod: 1,
      city: "Dhaka",
    },
  });

  function handleLocationChange(loc: SelectedLocation) {
    setLocation(loc);
    form.setValue("city", loc.city);
    form.setValue("country", loc.country);
    form.setValue("latitude", loc.latitude);
    form.setValue("longitude", loc.longitude);
    form.setValue("timezone", loc.timezone);
    form.setValue("locationLabel", loc.label);
  }

  async function handleComplete() {
    setLoading(true);
    setError("");
    try {
      const valid = await form.trigger();
      if (!valid) return;
      if (!location && !form.getValues("latitude")) {
        setError("Please select your location for accurate prayer times");
        return;
      }
      await completeOnboarding(form.getValues());
      router.push("/routine");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to complete onboarding");
    } finally {
      setLoading(false);
    }
  }

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <LiquidBackground variant="mesh">
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <Card className="glass-panel w-full max-w-lg border-0 shadow-none">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome to Ultimate Workspace</CardTitle>
            <CardDescription>Step {step + 1} of {STEPS.length}: {STEPS[step]}</CardDescription>
            <Progress value={progress} className="mt-3 h-2" />
          </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {step === 0 && (
                <>
                  <div className="space-y-2">
                    <Label>Your name</Label>
                    <Input {...form.register("name")} placeholder="Sahin" />
                  </div>
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Input {...form.register("language")} />
                  </div>
                </>
              )}
              {step === 1 && (
                <>
                  <LocationPicker
                    value={location}
                    onChange={handleLocationChange}
                    label="Your location (for prayer times)"
                  />
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Input {...form.register("timezone")} readOnly className="bg-muted" />
                  </div>
                </>
              )}
              {step === 2 && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Work start</Label>
                      <Input type="time" {...form.register("workingHoursStart")} />
                    </div>
                    <div className="space-y-2">
                      <Label>Work end</Label>
                      <Input type="time" {...form.register("workingHoursEnd")} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Sleep start</Label>
                      <Input type="time" {...form.register("sleepStart")} />
                    </div>
                    <div className="space-y-2">
                      <Label>Wake up</Label>
                      <Input type="time" {...form.register("sleepEnd")} />
                    </div>
                  </div>
                </>
              )}
              {step === 3 && (
                <div className="space-y-2">
                  <Label>Profession</Label>
                  <Select
                    value={form.watch("profession")}
                    onValueChange={(v) => form.setValue("profession", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PROFESSIONS.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {step === 4 && (
                <>
                  <div className="space-y-2">
                    <Label>Prayer-aware scheduling</Label>
                    <Select
                      value={form.watch("prayerPreference")}
                      onValueChange={(v) => form.setValue("prayerPreference", v as "enabled" | "disabled")}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="enabled">Enable prayer blocks in routine</SelectItem>
                        <SelectItem value="disabled">Disable prayer scheduling</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Prayer calculation method</Label>
                    <Select
                      value={String(form.watch("prayerMethod") ?? 1)}
                      onValueChange={(v) => form.setValue("prayerMethod", Number(v))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRAYER_METHODS.map((m) => (
                          <SelectItem key={m.value} value={String(m.value)}>
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

          <div className="mt-6 flex justify-between">
            <Button variant="outline" disabled={step === 0} onClick={() => setStep(step - 1)}>
              Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={() => setStep(step + 1)}>Next</Button>
            ) : (
              <Button onClick={handleComplete} disabled={loading}>
                {loading ? "Setting up..." : "Complete Setup"}
              </Button>
            )}
          </div>
        </CardContent>
        </Card>
      </div>
    </LiquidBackground>
  );
}
