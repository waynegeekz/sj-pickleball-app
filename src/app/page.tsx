import CourtBoard from "@/components/CourtBoard";
import { facilityNow } from "@/lib/schedule";

export const dynamic = "force-dynamic";

export default function Home() {
  const now = facilityNow();
  return <CourtBoard today={now.date} initialNow={now} />;
}
