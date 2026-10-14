"use server";

import { addHold, bookingsToday, takenKeys } from "@/lib/holds";
import {
  MAX_HOURS,
  MAX_SCREENSHOT_BYTES,
  PHONE_LIMIT_PER_DAY,
  SCREENSHOT_TYPES,
  dayOffset,
  isEmail,
  normalizePhone,
  openHours,
  totalFor,
} from "@/lib/reserve";
import { COURTS, facilityNow } from "@/lib/schedule";

export type Field = "name" | "phone" | "email" | "screenshot" | "slots";
export type BookingResult =
  | { ok: true; reference: string; heldUntil: number; total: number; taken: string[] }
  | { ok: false; errors: Partial<Record<Field, string>>; taken?: string[] };

const REF_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const makeReference = () =>
  "PB-" + Array.from({ length: 6 }, () => REF_CHARS[Math.floor(Math.random() * REF_CHARS.length)]).join("");

export async function submitBooking(fd: FormData): Promise<BookingResult> {
  const now = facilityNow();
  const date = String(fd.get("date") ?? "");
  const court = Number(fd.get("court"));
  const start = Number(fd.get("start"));
  const end = Number(fd.get("end"));
  const name = String(fd.get("name") ?? "").trim();
  const email = String(fd.get("email") ?? "").trim();
  const phone = normalizePhone(String(fd.get("phone") ?? ""));
  const shot = fd.get("screenshot");
  const errors: Partial<Record<Field, string>> = {};

  if (name.length < 2) errors.name = "Enter your full name.";
  if (!phone) errors.phone = "Enter a Philippine mobile number, like 0917 123 4567.";
  if (!isEmail(email)) errors.email = "Enter an email address, like name@example.com.";
  if (!(shot instanceof File) || shot.size === 0) errors.screenshot = "Add a screenshot of your GCash payment.";
  else if (!SCREENSHOT_TYPES.includes(shot.type)) errors.screenshot = "Use a JPG, PNG, WebP or HEIC image.";
  else if (shot.size > MAX_SCREENSHOT_BYTES) errors.screenshot = "That image is over 5 MB. Choose a smaller screenshot.";

  const range = { start, end };
  const valid =
    dayOffset(now.date, date) >= 0 &&
    COURTS.includes(court as (typeof COURTS)[number]) &&
    Number.isInteger(start) &&
    Number.isInteger(end) &&
    end >= start &&
    end - start + 1 <= MAX_HOURS;
  if (!valid) return { ok: false, errors: { ...errors, slots: "Those hours are no longer a valid choice. Pick them again." } };

  const taken = takenKeys(now.date, date);
  const free = new Set(openHours(date, court, new Set(taken), now));
  const hours = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  if (!hours.every((h) => free.has(h))) {
    return { ok: false, errors: { slots: "One of those hours is no longer available. Pick again." }, taken };
  }

  if (phone && bookingsToday(phone, now.date) >= PHONE_LIMIT_PER_DAY) {
    errors.phone = `This number has reached today's limit of ${PHONE_LIMIT_PER_DAY} bookings. Try again tomorrow.`;
  }
  if (Object.keys(errors).length) return { ok: false, errors };

  // The screenshot is checked and then dropped: nothing stores it until staff review exists.
  const hold = addHold({ reference: makeReference(), date, court, hours, phone: phone!, createdDate: now.date });
  return {
    ok: true,
    reference: hold.reference,
    heldUntil: hold.expiresAt,
    total: totalFor(date, range),
    taken: takenKeys(now.date, date),
  };
}

export async function refreshTaken(date: string): Promise<string[]> {
  return takenKeys(facilityNow().date, date);
}
