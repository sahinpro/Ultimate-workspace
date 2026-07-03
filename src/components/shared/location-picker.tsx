"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { LocationResult, SelectedLocation } from "@/lib/location/types";

type LocationPickerProps = {
  value?: SelectedLocation | null;
  onChange: (location: SelectedLocation) => void;
  label?: string;
  placeholder?: string;
  className?: string;
};

export function LocationPicker({
  value,
  onChange,
  label = "Location",
  placeholder = "Search city, address, or place worldwide…",
  className,
}: LocationPickerProps) {
  const [query, setQuery] = useState(value?.label ?? "");
  const [results, setResults] = useState<LocationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (value?.label) setQuery(value.label);
  }, [value?.label]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 2 || (value && query === value.label)) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/geocode/search?q=${encodeURIComponent(query)}`);
        const json = await res.json();
        setResults(json.data ?? []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, value]);

  function selectLocation(item: LocationResult) {
    setSelectedId(item.id);
    setQuery(item.label);
    setOpen(false);
    onChange({
      label: item.label,
      city: item.city,
      country: item.countryCode,
      latitude: item.latitude,
      longitude: item.longitude,
      timezone: item.timezone,
    });
  }

  async function useCurrentLocation() {
    if (!navigator.geolocation) return;
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `/api/v1/geocode/search?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`,
          );
          const json = await res.json();
          const items = json.data as LocationResult[];
          if (items[0]) selectLocation(items[0]);
        } finally {
          setLoading(false);
        }
      },
      () => setLoading(false),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  return (
    <div className={cn("space-y-2", className)} ref={containerRef}>
      <Label>{label}</Label>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedId(null);
          }}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className="pl-9 pr-9"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {open && results.length > 0 && (
        <div className="glass-panel z-50 max-h-64 overflow-y-auto rounded-2xl shadow-xl">
          {results.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => selectLocation(item)}
              className={cn(
                "flex w-full items-start gap-2 border-b px-3 py-2.5 text-left text-sm transition-colors last:border-0 hover:bg-accent",
                selectedId === item.id && "bg-accent",
              )}
            >
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{item.city}, {item.country}</p>
                <p className="truncate text-xs text-muted-foreground">{item.label}</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  {item.timezone} · {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
                </p>
              </div>
              {selectedId === item.id && <Check className="h-4 w-4 shrink-0 text-primary" />}
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={useCurrentLocation}
        className="text-xs text-primary hover:underline"
      >
        Use my current location
      </button>

      {value && (
        <p className="text-xs text-muted-foreground">
          Prayer times calculated for <span className="font-medium text-foreground">{value.city}</span> ({value.timezone})
        </p>
      )}
    </div>
  );
}
