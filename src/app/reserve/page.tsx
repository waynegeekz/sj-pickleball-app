import type { Metadata } from "next";
import Reserve from "@/components/Reserve";
import { takenKeys } from "@/lib/holds";
import { DAYS_AHEAD } from "@/lib/reserve";
import { addDays, facilityNow } from "@/lib/schedule";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Reserve a court",
  description: "Pick a day, a court and your hours. No account needed.",
};

export default function ReservePage() {
  const now = facilityNow();
  const dates = Array.from({ length: DAYS_AHEAD }, (_, i) => addDays(now.date, i));
  const taken = Object.fromEntries(dates.map((d) => [d, takenKeys(now.date, d)]));
  return <Reserve dates={dates} initialTaken={taken} initialNow={now} />;
}
