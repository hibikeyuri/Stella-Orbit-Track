import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTimeLocalUTC(dateStr?: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const pad = (n: number) => n.toString().padStart(2, "0");

  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(
    date.getUTCDate(),
  )}T${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(
    date.getUTCSeconds(),
  )}`;
}

export function toUTCISOString(localDateTime: string): string {
  const local = new Date(localDateTime);
  return local.toISOString();
}
