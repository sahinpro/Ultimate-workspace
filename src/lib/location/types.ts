export type LocationResult = {
  id: string;
  label: string;
  city: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  timezone: string;
};

export type SelectedLocation = {
  label: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
};

export function parseNominatimResult(item: {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: Record<string, string>;
}): LocationResult | null {
  const address = item.address ?? {};
  const city =
    address.city ||
    address.town ||
    address.village ||
    address.municipality ||
    address.county ||
    address.state ||
    "Unknown";
  const countryCode = (address.country_code ?? "").toUpperCase();
  if (!countryCode) return null;

  return {
    id: String(item.place_id),
    label: item.display_name,
    city,
    country: address.country ?? countryCode,
    countryCode,
    latitude: parseFloat(item.lat),
    longitude: parseFloat(item.lon),
    timezone: "UTC",
  };
}
