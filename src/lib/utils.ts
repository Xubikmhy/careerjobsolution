import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Nepal Rupee currency formatter.
 * Always renders as `NPR 25,000` (thousands separators, no decimals for whole values).
 * Falls back gracefully for non-numeric input.
 */
export function formatNPR(amount: number | null | undefined): string {
  const n = Number(amount);
  if (!isFinite(n)) return "NPR 0";
  const hasDecimals = n % 1 !== 0;
  const formatted = n.toLocaleString("en-IN", {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  });
  return `NPR ${formatted}`;
}

/**
 * Normalize a phone number for wa.me / tel: links.
 * Adds Nepal country code (977) if a Nepal mobile prefix (98/97) is detected.
 */
export function normalizePhone(phone: string): string {
  let cleaned = (phone || "").replace(/[^0-9+]/g, "");
  if (cleaned.startsWith("+")) cleaned = cleaned.slice(1);
  if (/^9[78]\d{8}$/.test(cleaned)) cleaned = "977" + cleaned;
  return cleaned;
}
