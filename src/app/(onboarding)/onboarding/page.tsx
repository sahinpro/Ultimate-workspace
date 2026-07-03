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

const STEPS = ["Profile", "Location", "Schedule", "Profession", "Prayer"];

const PROFESSIONS = [
  { value: "software_engineer", label: "Software Engineer" },
  { value: "ui_ux_designer", label: "UI/UX Designer" },
  { value: "freelancer", label: "Freelancer" },
  { value: "student", label: "Student" },
  { value: "startup_founder", label: "Startup Founder" },
  { value: "remote_worker", label: "Remote Worker" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      city: "Dhaka",
    },
  });

  async function handleComplete() {
    setLoading(true);
    setError("");
    try {
      const valid = await form.trigger();
      if (!valid) return;
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
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Welcome to Ultimate Workspace</CardTitle>
          <CardDescription>Step {step + 1} of {STEPS.length}: {STEPS[step]}</CardDescription>
          <Progress value={progress} className="mt-2" />
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
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Input {...form.register("timezone")} />
                  </div>
                  <div className="space-y-2">
                    <Label>Country (ISO code)</Label>
                    <Input {...form.register("country")} placeholder="BD" />
                  </div>
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input {...form.register("city")} placeholder="Dhaka" />
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
                  <p className="text-xs text-muted-foreground">
                    We&apos;ll seed a personalized routine template based on your profession.
                  </p>
                </div>
              )}
              {step === 4 && (
                <div className="space-y-2">
                  <Label>Prayer times</Label>
                  <Select
                    value={form.watch("prayerPreference")}
                    onValueChange={(v) => form.setValue("prayerPreference", v as "enabled" | "disabled")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="enabled">Enable prayer-aware scheduling</SelectItem>
                      <SelectItem value="disabled">Disable prayer scheduling</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Prayer blocks will be automatically placed and shift throughout the year.
                  </p>
                </div>
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
  );
}
