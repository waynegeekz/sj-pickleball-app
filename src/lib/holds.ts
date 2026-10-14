import { HOLD_MINUTES, sampleTaken } from "./reserve.ts";
import { slotKey } from "./schedule.ts";

export type Hold = {
  reference: string;
  date: string;
  court: number;
  hours: number[];
  phone: string;
  createdDate: string; // facility date, for the per-phone daily limit
  expiresAt: number;
};

// ponytail: in-memory stand-in until there is a database. Resets on restart, single process only.
const g = globalThis as unknown as { __holds?: Hold[] };
const holds = (g.__holds ??= []);

const live = () => {
  const t = Date.now();
  for (let i = holds.length - 1; i >= 0; i--) if (holds[i].expiresAt <= t) holds.splice(i, 1);
  return holds;
};

export function takenKeys(today: string, date: string): string[] {
  const keys = new Set(sampleTaken(today, date));
  for (const h of live()) if (h.date === date) for (const hr of h.hours) keys.add(slotKey(h.court, hr));
  return [...keys];
}

// Submissions per phone per facility day; kept after a hold expires so the daily limit still counts.
const counts = ((g as { __counts?: Map<string, number> }).__counts ??= new Map<string, number>());

export const bookingsToday = (phone: string, createdDate: string) => counts.get(`${phone}:${createdDate}`) ?? 0;

export function addHold(h: Omit<Hold, "expiresAt">): Hold {
  const hold = { ...h, expiresAt: Date.now() + HOLD_MINUTES * 60_000 };
  holds.push(hold);
  const k = `${h.phone}:${h.createdDate}`;
  counts.set(k, (counts.get(k) ?? 0) + 1);
  return hold;
}
