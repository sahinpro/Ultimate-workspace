import { NextRequest, NextResponse } from "next/server";
import { find as findTimezone } from "geo-tz";
import { parseNominatimResult } from "@/lib/location/types";

export async function GET(req: NextRequest) {
  const lat = req.nextUrl.searchParams.get("lat");
  const lon = req.nextUrl.searchParams.get("lon");
  const q = req.nextUrl.searchParams.get("q")?.trim();

  try {
    let url: URL;

    if (lat && lon) {
      url = new URL("https://nominatim.openstreetmap.org/reverse");
      url.searchParams.set("lat", lat);
      url.searchParams.set("lon", lon);
      url.searchParams.set("format", "json");
      url.searchParams.set("addressdetails", "1");
    } else {
      if (!q || q.length < 2) {
        return NextResponse.json({ data: [], error: null });
      }
      url = new URL("https://nominatim.openstreetmap.org/search");
      url.searchParams.set("q", q);
      url.searchParams.set("format", "json");
      url.searchParams.set("addressdetails", "1");
      url.searchParams.set("limit", "10");
    }

    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent": "UltimateWorkspace/1.0 (prayer-time-location)",
        Accept: "application/json",
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json({ data: null, error: "Geocoding service unavailable" }, { status: 502 });
    }

    const json = await res.json();

    const items = lat && lon
      ? [{ place_id: json.place_id, display_name: json.display_name, lat, lon, address: json.address }]
      : json;

    const results = (items as Array<{
      place_id: number;
      display_name: string;
      lat: string;
      lon: string;
      address?: Record<string, string>;
    }>)
      .map(parseNominatimResult)
      .filter(Boolean)
      .map((item) => {
        const zones = findTimezone(item!.latitude, item!.longitude);
        return { ...item!, timezone: zones[0] ?? "UTC" };
      });

    return NextResponse.json({ data: results, error: null });
  } catch {
    return NextResponse.json({ data: null, error: "Failed to search locations" }, { status: 500 });
  }
}
