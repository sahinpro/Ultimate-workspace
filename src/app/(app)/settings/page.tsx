"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LocationPicker } from "@/components/shared/location-picker";
import type { SelectedLocation } from "@/lib/location/types";

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

type Profile = {
  timezone: string;
  country: string;
  city: string | null;
  locationLabel: string | null;
  latitude: number | null;
  longitude: number | null;
  prayerPreference: string | null;
  prayerMethod: number;
};

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [location, setLocation] = useState<SelectedLocation | null>(null);
  const [prayerPreference, setPrayerPreference] = useState("enabled");
  const [prayerMethod, setPrayerMethod] = useState("1");
  const [saved, setSaved] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await fetch("/api/v1/profile");
      const json = await res.json();
      return json.data as Profile;
    },
  });

  useEffect(() => {
    if (profile) {
      setPrayerPreference(profile.prayerPreference ?? "enabled");
      setPrayerMethod(String(profile.prayerMethod ?? 1));
      if (profile.latitude && profile.longitude) {
        setLocation({
          label: profile.locationLabel ?? `${profile.city}, ${profile.country}`,
          city: profile.city ?? "",
          country: profile.country,
          latitude: profile.latitude,
          longitude: profile.longitude,
          timezone: profile.timezone,
        });
      }
    }
  }, [profile]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/v1/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timezone: location?.timezone ?? profile?.timezone,
          country: location?.country ?? profile?.country,
          city: location?.city ?? profile?.city,
          locationLabel: location?.label,
          latitude: location?.latitude,
          longitude: location?.longitude,
          prayerPreference,
          prayerMethod: Number(prayerMethod),
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["prayer-times"] });
      queryClient.invalidateQueries({ queryKey: ["routine-week"] });
      queryClient.invalidateQueries({ queryKey: ["routine-day"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  if (isLoading) return <div className="animate-pulse rounded-xl bg-muted h-64" />;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your location and prayer preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Location</CardTitle>
          <CardDescription>
            Accurate coordinates ensure precise prayer times year-round
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <LocationPicker value={location} onChange={setLocation} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Prayer Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Prayer-aware scheduling</Label>
            <Select value={prayerPreference} onValueChange={setPrayerPreference}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="enabled">Enabled</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Calculation method</Label>
            <Select value={prayerMethod} onValueChange={setPrayerMethod}>
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
        </CardContent>
      </Card>

      <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
        {saveMutation.isPending ? "Saving..." : saved ? "Saved!" : "Save changes"}
      </Button>
    </div>
  );
}
