import { HOURS, addDays, isOffPeak, isPast, sampleDay, slotKey } from "./schedule.ts";

export const DAYS_AHEAD = 14;
export const MAX_HOURS = 5;
export const HOLD_MINUTES = 20;
export const PHONE_LIMIT_PER_DAY = 5;
export const RATE_PEAK = 400;
export const RATE_OFF_PEAK = 300;
export const MAX_SCREENSHOT_BYTES = 5 * 1024 * 1024;
export const SCREENSHOT_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

export type Range = { start: number; end: number }; // inclusive start hours

export const rateFor = (date: string, hour: number) => (isOffPeak(date, hour) ? RATE_OFF_PEAK : RATE_PEAK);

export function totalFor(date: string, r: Range): number {
  let sum = 0;
  for (let h = r.start; h <= r.end; h++) sum += rateFor(date, h);
  return sum;
}

export const peso = (n: number) => `₱${n.toLocaleString("en-US")}`;

export const lengthOf = (r: Range) => r.end - r.start + 1;

/**
 * What a tap on `hour` does to the current range. Taken hours are never rendered, so
 * adjacency is plain hour arithmetic: a tap beside the range extends it, anything else restarts.
 */
export function tapHour(sel: Range | null, hour: number): { range: Range | null; capped?: boolean } {
  if (!sel) return { range: { start: hour, end: hour } };
  const { start, end } = sel;
  if (hour >= start && hour <= end) {
    if (start === end) return { range: null };
    if (hour === end) return { range: { start, end: end - 1 } };
    if (hour === start) return { range: { start: start + 1, end } };
    return { range: { start: hour, end: hour } };
  }
  if (hour === end + 1 || hour === start - 1) {
    if (lengthOf(sel) >= MAX_HOURS) return { range: sel, capped: true };
    return { range: hour > end ? { start, end: hour } : { start: hour, end } };
  }
  return { range: { start: hour, end: hour } };
}

export function dayOffset(today: string, date: string): number {
  for (let i = 0; i < DAYS_AHEAD; i++) if (addDays(today, i) === date) return i;
  return -1;
}

/** Normalises a Philippine mobile number to 09XXXXXXXXX, or null. */
export function normalizePhone(raw: string): string | null {
  const d = raw.replace(/[\s\-().]/g, "");
  const m = d.match(/^(?:\+?63|0)(9\d{9})$/);
  return m ? `0${m[1]}` : null;
}

export const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);

/** Court → open hours for one date, given every key that is taken. */
export function openHours(date: string, court: number, taken: ReadonlySet<string>, now: { date: string; hour: number }): number[] {
  return HOURS.filter((h) => !taken.has(slotKey(court, h)) && !isPast(date, h, now));
}

export function sampleTaken(today: string, date: string): string[] {
  const off = dayOffset(today, date);
  return off < 0 ? [] : sampleDay(date, off).map((s) => slotKey(s.court, s.hour));
}
