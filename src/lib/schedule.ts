export const COURTS = [1, 2, 3, 4, 5, 6] as const;
export const OPEN_HOUR = 7; // demo hours until the facility confirms real ones
export const CLOSE_HOUR = 21;
export const HOURS = Array.from({ length: CLOSE_HOUR - OPEN_HOUR }, (_, i) => OPEN_HOUR + i);
export const OFF_PEAK_BEFORE = 16;
// ponytail: placeholder zone, set to the facility's real IANA zone
export const FACILITY_TIME_ZONE = "Asia/Manila";

export type SlotKind = "booking" | "block";

export type Slot = {
  id: string;
  date: string; // YYYY-MM-DD, facility local
  court: number;
  hour: number; // start hour, 1-hour slot
  kind: SlotKind;
  name: string; // player name for bookings, reason for blocks
  mine?: boolean;
};

export type SeatState = "open" | "taken" | "block" | "mine" | "past";

export const DAY_PARTS = [
  { id: "morning", label: "Morning", from: 7, to: 11 },
  { id: "midday", label: "Midday", from: 11, to: 16 },
  { id: "evening", label: "Evening", from: 16, to: 19 },
  { id: "night", label: "Night", from: 19, to: 21 },
] as const;

/** Day of week for a YYYY-MM-DD date, 0 = Sunday. */
export function weekday(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function isWeekday(date: string): boolean {
  const w = weekday(date);
  return w >= 1 && w <= 5;
}

/** Off-peak: Monday to Friday, slots starting before 4 PM. Weekends are always peak. */
export function isOffPeak(date: string, hour: number): boolean {
  return isWeekday(date) && hour < OFF_PEAK_BEFORE;
}

export function addDays(date: string, days: number): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/** Current date and fractional hour at the facility. */
export function facilityNow(at: Date = new Date()): { date: string; hour: number } {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: FACILITY_TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(at)
      .map((p) => [p.type, p.value]),
  );
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    hour: Number(parts.hour) + Number(parts.minute) / 60,
  };
}

/** A slot is past once its start time has gone by. */
export function isPast(date: string, hour: number, now: { date: string; hour: number } | null): boolean {
  if (!now) return false;
  return date < now.date || (date === now.date && hour <= now.hour);
}

export function formatHour(hour: number): string {
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${h} ${hour < 12 ? "AM" : "PM"}`;
}

export function formatRange(hour: number): string {
  const a = formatHour(hour);
  const b = formatHour(hour + 1);
  return a.slice(-2) === b.slice(-2) ? `${a.slice(0, -3)}–${b}` : `${a}–${b}`;
}

export function formatDate(date: string, style: "long" | "short" = "long"): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    weekday: style === "long" ? "long" : "short",
    month: style === "long" ? "long" : "short",
    day: "numeric",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

export const slotKey = (court: number, hour: number) => `${court}:${hour}`;

export function seatState(slot: Slot | undefined, date: string, hour: number, now: { date: string; hour: number } | null): SeatState {
  if (slot?.mine) return "mine";
  if (slot?.kind === "block") return "block";
  if (slot) return "taken";
  if (isPast(date, hour, now)) return "past";
  return "open";
}

export type MoveCheck = { ok: true } | { ok: false; reason: string };

/** Whether a slot can move to court/hour on the same day. */
export function checkMove(
  slots: Slot[],
  slot: Slot,
  court: number,
  hour: number,
  now: { date: string; hour: number } | null,
): MoveCheck {
  if (slot.court === court && slot.hour === hour) return { ok: false, reason: "Already here" };
  if (!HOURS.includes(hour) || !COURTS.includes(court as (typeof COURTS)[number])) return { ok: false, reason: "Outside opening hours" };
  if (isPast(slot.date, hour, now)) return { ok: false, reason: "That time has passed" };
  const occupant = slots.find((s) => s.court === court && s.hour === hour && s.id !== slot.id);
  if (occupant) return { ok: false, reason: occupant.kind === "block" ? "Court is closed then" : "Already booked" };
  return { ok: true };
}

// ---- Synthetic demo data (replace with the real schedule API) ----

const FIRST = ["Jamie", "Ana", "Marco", "Lea", "Paolo", "Rina", "Tom", "Bea", "Carlo", "Mika", "Nico", "Ivy", "Rafa", "Joy", "Sam", "Kat"];
const LAST = ["Rivera", "Santos", "Cruz", "Reyes", "Lim", "Tan", "Garcia", "Mendoza", "Ocampo", "Dela Cruz", "Navarro", "Uy"];

function rng(seed: string) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

/** Deterministic sample schedule for a date. `offset` is days from today. */
export function sampleDay(date: string, offset: number): Slot[] {
  const rand = rng(date);
  const weekend = !isWeekday(date);
  const slots: Slot[] = [];
  for (const court of COURTS) {
    for (const hour of HOURS) {
      let p = hour >= 17 ? 0.72 : hour >= 15 ? 0.5 : hour < 9 ? 0.35 : 0.22;
      if (weekend) p += 0.22;
      p -= offset * 0.03; // later days are emptier
      if (court === 6 && hour < 9 && weekday(date) === 2) {
        slots.push({ id: `${date}-${court}-${hour}`, date, court, hour, kind: "block", name: "Resurfacing" });
        continue;
      }
      if (rand() < p) {
        const first = FIRST[Math.floor(rand() * FIRST.length)];
        const last = LAST[Math.floor(rand() * LAST.length)];
        slots.push({ id: `${date}-${court}-${hour}`, date, court, hour, kind: "booking", name: `${first} ${last}` });
      }
    }
  }
  if (offset === 1) {
    const i = slots.findIndex((s) => s.kind === "booking" && s.hour >= 17);
    if (i >= 0) slots[i] = { ...slots[i], name: "You", mine: true };
  }
  if (offset === 5) {
    // one fully booked day to exercise the sold-out state
    return COURTS.flatMap((court) =>
      HOURS.map((hour) => slots.find((s) => s.court === court && s.hour === hour) ?? {
        id: `${date}-${court}-${hour}`, date, court, hour, kind: "booking" as const, name: `${FIRST[(court + hour) % FIRST.length]} ${LAST[(court * hour) % LAST.length]}`,
      }),
    );
  }
  return slots;
}
