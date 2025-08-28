import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDateTimeLocalUTC(dateStr?: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const pad = (n: number) => n.toString().padStart(2, "0");

  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(
    date.getUTCDate()
  )}T${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(
    date.getUTCSeconds()
  )}`;
}

export function toUTCISOString(localDateTime: string): string {
  const local = new Date(localDateTime);
  return local.toISOString();
}

export function randomTLE(id: number) {
  const name = `SAT-${id}`;
  const inclination = +(Math.random() * 100).toFixed(4);       // 0~100°
  const raan = +(Math.random() * 360).toFixed(4);             // 0~360°
  const eccentricity = +(Math.random() * 0.8).toFixed(7);     // 0~0.8
  const meanMotion = +(Math.random() * 15 + 1).toFixed(8);    // 1~16 rev/day
  const year = 2000 + Math.floor(Math.random() * 24);         // 2000~2023
  const date = new Date(
    year,
    Math.floor(Math.random() * 12),
    Math.floor(Math.random() * 28) + 1
  ).toISOString();

  return {
    id: String(10000 + id),
    is_active: Math.random() > 0.05,
    category: "Tle",
    norad_id: 10000 + id,
    name,
    date,
    line1: `1 ${10000 + id}U ${year % 100}XXX   23${Math.floor(Math.random() * 365)}.${Math.floor(Math.random() * 100000)}  .00000000  00000-0  00000-0 0  9990`,
    line2: `2 ${10000 + id} ${inclination} ${raan} ${String(eccentricity).split(".")[1].padStart(7,"0")} 0 0 ${meanMotion} 0`,
  };
}