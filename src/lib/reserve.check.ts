// Run: node src/lib/reserve.check.ts
import assert from "node:assert/strict";
import { MAX_HOURS, normalizePhone, tapHour, totalFor } from "./reserve.ts";

assert.deepEqual(tapHour(null, 9).range, { start: 9, end: 9 });
assert.equal(tapHour({ start: 9, end: 9 }, 9).range, null, "tap the only hour to clear");
assert.deepEqual(tapHour({ start: 9, end: 9 }, 10).range, { start: 9, end: 10 }, "extend forward");
assert.deepEqual(tapHour({ start: 9, end: 9 }, 8).range, { start: 8, end: 9 }, "extend back");
assert.deepEqual(tapHour({ start: 9, end: 11 }, 11).range, { start: 9, end: 10 }, "tap end shrinks");
assert.deepEqual(tapHour({ start: 9, end: 9 }, 12).range, { start: 12, end: 12 }, "non-adjacent restarts");
const full = { start: 9, end: 9 + MAX_HOURS - 1 };
assert.deepEqual(tapHour(full, full.end + 1), { range: full, capped: true }, "sixth hour is refused");

// 2026-09-28 Monday: 3 PM off-peak (300), 4 PM peak (400). 2026-10-03 Saturday: all 400.
assert.equal(totalFor("2026-09-28", { start: 15, end: 16 }), 700);
assert.equal(totalFor("2026-10-03", { start: 9, end: 10 }), 800);

assert.equal(normalizePhone("0917 123 4567"), "09171234567");
assert.equal(normalizePhone("+63 917 123 4567"), "09171234567");
assert.equal(normalizePhone("12345"), null);
console.log("reserve checks passed");
