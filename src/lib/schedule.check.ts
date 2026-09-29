// Run: node src/lib/schedule.check.ts
import assert from "node:assert/strict";
import { checkMove, formatRange, isOffPeak, isPast, type Slot } from "./schedule.ts";

// 2026-09-28 is a Monday, 2026-10-03 a Saturday.
assert.equal(isOffPeak("2026-09-28", 15), true, "weekday 3 PM slot is off-peak");
assert.equal(isOffPeak("2026-09-28", 16), false, "weekday 4 PM slot is peak");
assert.equal(isOffPeak("2026-10-03", 9), false, "Saturday is always peak");
assert.equal(isOffPeak("2026-10-04", 9), false, "Sunday is always peak");

const now = { date: "2026-09-28", hour: 14.5 };
assert.equal(isPast("2026-09-28", 14, now), true, "started slot is past");
assert.equal(isPast("2026-09-28", 15, now), false);

const a: Slot = { id: "a", date: "2026-09-28", court: 1, hour: 18, kind: "booking", name: "A" };
const b: Slot = { id: "b", date: "2026-09-28", court: 2, hour: 18, kind: "block", name: "Hold" };
assert.deepEqual(checkMove([a, b], a, 3, 19, now), { ok: true });
assert.equal(checkMove([a, b], a, 2, 18, now).ok, false, "cannot drop on a block");
assert.equal(checkMove([a, b], a, 3, 14, now).ok, false, "cannot drop in the past");
assert.equal(checkMove([a, b], a, 1, 18, now).ok, false, "same seat is not a move");

assert.equal(formatRange(11), "11 AM–12 PM");
assert.equal(formatRange(18), "6–7 PM");
console.log("schedule checks passed");
