---
version: 1
slug: "src-app-page-tsx"
primary_target: "src/app/page.tsx"
related_targets: []
---

# Court availability board

Mode: Operate. Players (phone first) scan one day for open court-hours and tap to book; staff (desktop/tablet) move bookings by drag with a confirm step, plus a select-then-place alternative. 6 courts, 1-hour slots, one day at a time. Off-peak band on weekdays before 4 PM only. Players never see who booked.

Open: real hours (demo 7:00-21:00, synthetic), multi-hour bookings, player notification on move, booking flow after tap (hands off court + hour).

## Direction contract

THESIS: The day is a seat map. Open court-hours are the brightest seats in the house; bookings are ticket stubs staff lift and reseat. Refuses the white CourtReserve table with green cells.

OWN-WORLD: Cool ticket-stock ground, navy ink, optic-yellow open seats, grey hatched sold seats, one vermilion accent reserved for moving. Perforated stubs, notched corners, tabular numerals, day-part bands, live now-line.

STORY: A player sees where the yellow is, taps it, books. Staff flip into move mode on the same board, lift a ticket, drop it on a lit seat, confirm.

FIRST VIEWPORT: Date strip across the top; per-court open counts as a seat-row header; seat map fills the rest, courts across, hours down, grouped by day-part with an off-peak band on weekdays. Desktop adds a right rail: summary, next open, move-mode switch.

FORM: Box Office Seat Map, position 7 of 7, seed 0f197320. Raises: day-parts (cyclorama), move-only accent (drawcord), lifted ticket (console), one board two modes (hypercard), now-line (oscilloscope).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
