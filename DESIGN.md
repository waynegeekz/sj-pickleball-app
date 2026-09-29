---
name: Court availability
description: A box-office seat map for a six-court pickleball day, where open court-hours are the brightest seats in the house.
colors:
  ground: "#eef1f5"
  stock: "#f8fafc"
  ink: "#14213d"
  ink-2: "#47526b"
  ink-3: "#525b70"
  ink-mist: "#c9d1e2"
  rule: "#d3d9e2"
  open: "#d4f531"
  open-hover: "#c3e61c"
  open-edge: "#a9c90f"
  sold: "#dde1e8"
  sold-hatch: "#c9cfd9"
  sold-ink: "#535d72"
  block: "#e5e1f0"
  block-ink: "#3b3563"
  move: "#ff5a36"
  offpeak: "#d5dded"
typography:
  display:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "2.75rem"
    fontWeight: 850
    lineHeight: 1.05
    letterSpacing: "-0.015em"
    fontVariation: "'wdth' 78"
  numeral:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 800
    lineHeight: 1
    fontFeature: "'tnum'"
    fontVariation: "'wdth' 75"
  title:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 800
    lineHeight: 1.2
    fontVariation: "'wdth' 90"
  body:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.45
    fontFeature: "'tnum'"
  body-small:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 750
    letterSpacing: "0.06em"
  seat-label:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 700
    letterSpacing: "0.02em"
    fontVariation: "'wdth' 75"
rounded:
  xs: "4px"
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "12px"
  panel: "14px"
  dialog: "18px"
  seat: "10px 10px 5px 5px"
  pill: "999px"
spacing:
  gap-mobile: "4px"
  gap: "6px"
  band-pad-mobile: "6px"
  band-pad: "10px"
  gutter-mobile: "42px"
  gutter: "60px"
  seat-h-mobile: "44px"
  seat-h: "50px"
  panel-pad: "16px"
components:
  seat-open:
    backgroundColor: "{colors.open}"
    textColor: "{colors.ink}"
    typography: "{typography.seat-label}"
    rounded: "{rounded.seat}"
    height: "{spacing.seat-h}"
  seat-open-hover:
    backgroundColor: "{colors.open-hover}"
  seat-picked:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.open}"
    rounded: "{rounded.seat}"
  seat-sold:
    backgroundColor: "{colors.sold}"
    textColor: "{colors.sold-ink}"
    typography: "{typography.seat-label}"
    rounded: "{rounded.seat}"
  seat-block:
    backgroundColor: "{colors.block}"
    textColor: "{colors.block-ink}"
    rounded: "{rounded.seat}"
  seat-mine:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.open}"
    rounded: "{rounded.seat}"
  ticket:
    backgroundColor: "{colors.stock}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0 8px 0 15px"
    height: "{spacing.seat-h}"
  button-primary:
    backgroundColor: "{colors.open}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "0 18px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.open-hover}"
  button-move:
    backgroundColor: "{colors.move}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "0 18px"
    height: "44px"
  button-quiet:
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "0 18px"
    height: "44px"
  date-chip:
    backgroundColor: "{colors.stock}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "13px 8px 9px"
  date-chip-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.stock}"
  role-switch:
    backgroundColor: "{colors.stock}"
    rounded: "{rounded.pill}"
    padding: "3px"
  role-switch-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.stock}"
    rounded: "{rounded.pill}"
  panel:
    backgroundColor: "{colors.stock}"
    rounded: "{rounded.panel}"
    padding: "{spacing.panel-pad}"
  dialog:
    backgroundColor: "{colors.stock}"
    textColor: "{colors.ink}"
    rounded: "{rounded.dialog}"
    padding: "24px"
---

# Design System: Court availability

## Overview

**Creative North Star: "The Box Office Seat Map"**

The day is a seat map. Courts run across, hours run down, and every court-hour is a seat. Open seats are the brightest thing in the house: optic yellow on a cool, quiet ticket-stock field. Taken seats recede into grey hatching. Bookings, in the staff view, are ticket stubs with perforations and notched sides that can be lifted, carried, and reseated. The system exists so a player can find the yellow at a glance and a staff member can move a booking without leaving the board.

Density is high but calm. Six columns of seats, grouped into day-part bands, fill the viewport below a date strip and a sticky court header. Every number is tabular, every label is short, and color does the sorting work so type can stay small. The palette is deliberately light only: players read it on phones in daylight and staff read it under gym lights, so there is no dark theme.

The world refuses the white spreadsheet with green cells. Nothing here is a table row; every slot is a physical seat or stub with its own silhouette.

**Key Characteristics:**
- Cool blue-grey ground, navy ink, one loud optic yellow for open seats and booking actions.
- One vermilion accent, held back for the lift, drop, confirm, and reseat sequence only.
- Seats with a taller top radius and a pressed lower edge; tickets with a dashed perforation line and notched sides.
- Archivo variable, condensed via the width axis for numerals and seat labels; tabular numerals everywhere.
- Day-part bands (morning, midday, evening, night) with off-peak expressed as a tinted band field.
- A live navy now-line across the map; ended hours fold away.

## Colors

A cool, quiet field of blue-greys and navy, lit by a single optic yellow, with vermilion kept in reserve for movement.

### Primary
- **Optic Yellow** (open): the open seat and every booking action (the Book button, sold-out "next open" jump, the underline bar under open counts, text selection). It is the loudest color on screen by design.
- **Optic Yellow Pressed** (open-hover): hover state for open seats and primary buttons, and the lit drop target during a move.
- **Optic Yellow Edge** (open-edge): the 3 to 4px inset lower edge that makes open seats and primary buttons read as pressable.

### Secondary
- **Ticket Vermilion** (move): the move sequence only. The lifted ticket's perforation and outline, the drag ghost and its destination tag, the outline on a hot drop seat, the active move stub border, the reseat arrow and destination outline in the confirm dialog, and the move button. Nowhere else.

### Neutral
- **Ticket-Stock Ground** (ground): page background and sticky court header fill; also the "from" stub in the reseat dialog and hover fill on rail list rows.
- **Card Stock** (stock): panels, date chips, ticket faces, dialog surface, and text on navy.
- **Box-Office Navy** (ink): primary text, the active date chip, the active role segment, picked and "your booking" seats, the court header rule, the now-line, focus rings.
- **Slate Ink** (ink-2): secondary text, meta lines, day names, section heads.
- **Muted Slate** (ink-3): tertiary text, AM/PM suffixes, past hours, hover borders, the default ticket perforation.
- **Mist on Navy** (ink-mist): muted text sitting on navy surfaces (day name on the active chip, meta on the open booking stub).
- **Rule Grey** (rule): 1px borders on panels, chips, bands, tickets, and quiet buttons.
- **Sold Grey** (sold) with **Sold Hatch** (sold-hatch) and **Sold Ink** (sold-ink): taken seats, drawn as a 135 degree hatch with a small solid label patch.
- **Hold Lavender** (block) with **Hold Ink** (block-ink): maintenance or hold seats and hold tickets, drawn as a fine crosshatch.
- **Off-Peak Field** (offpeak): the full background of a day-part band that falls before 4 PM on weekdays, and its key swatch.

### Named Rules
**The Brightest Seat Rule.** Optic yellow is the loudest thing on a cool, quiet field, and it is used only for open seats and booking actions. If yellow appears on anything that is not bookable or a booking action (or the underline marking an open count), it is wrong.

**The Reserved Vermilion Rule.** Vermilion is held back entirely for the lift, drop, confirm, and reseat sequence. It never appears at rest, in the player view, or as decoration. There is no other accent.

**The Field Not Mark Rule.** Off-peak is a tinted band field (weekdays before 4 PM), never a stripe, border, or badge on individual seats. Peak hours carry no label at all; peak is the default.

## Typography

**Display Font:** Archivo variable (with system-ui, sans-serif), loaded through next/font with the wdth axis
**Body Font:** Archivo variable (same family)

**Character:** One grotesque family doing all the work, stretched and squeezed through its width axis: condensed and heavy for titles and numerals like a printed ticket, normal width for reading text. Tabular numerals are set on the body so every hour and count lines up.

### Hierarchy
- **Display** (850, 1.75rem mobile to 2.75rem at 768px, 1.05, width 78%, tracking -0.015em): the page title only.
- **Numeral** (800, 1.75rem to 2.25rem, 1, width 75%): court numbers in the sticky header. Date chip day numbers use the same voice at 1.5rem, width 80%; hour numbers at 1.0625rem, 750, width 78%.
- **Title** (800, 1.25rem to 1.375rem, 1.2, width 90%): stub headlines, dialog titles, the selected day line (1.1875rem, 750).
- **Body** (400, 16px, 1.45, tabular): default text. **Body small** (0.875rem, slate ink) carries meta lines, hints, and rail list rows.
- **Label** (650 to 800, 0.6875rem to 0.8125rem, tracked 0.06em to 0.1em, uppercase): day names, day-part names, the corner "Court" label, rail section heads, the Now tag, From/To in the reseat dialog.
- **Seat label** (700, 0.6875rem mobile / 0.75rem desktop, width 75% to 85%, uppercase): OPEN, TAKEN, MOVE HERE inside seats. Ticket names are sentence case at 650, width 85%.

### Named Rules
**The Tabular Everything Rule.** All numerals are tabular (set on body). Times, counts, and court numbers must align column to column.

**The Width Axis Rule.** Condense with the wdth axis (75% to 90%) rather than switching families or shrinking size. Numerals and seat labels are condensed; reading text is not.

## Layout

Single column below 1024px, a main column plus a 300px sticky right rail at 1024px and up (gap 36px), inside a 1320px max container. Shell padding is 18px 16px on mobile (with 120px plus safe area at the bottom for the booking sheet), 28px at 768px, 32px 36px at 1024px.

The seat map is a grid of a time gutter plus six equal court columns. Mobile uses a 42px gutter, 4px gaps, 6px band padding, and 44px seats; 768px and up uses 60px, 6px, 10px, and 50px. The court header row is sticky at the top with a 3px navy underline, so counts stay visible while scrolling hours.

Top to bottom: title row with role switch, a horizontally scrolling date strip (snap, hidden scrollbar, full bleed on mobile), the selected day line, the sticky court header with per-court open counts, then day-part bands spaced 12px apart. Ended hours on today are hidden behind a "Show earlier hours" toggle aligned to the seat columns. The rail (summary stub, next open list, key) becomes a two-up grid between 640px and 1023px and gives way to a fixed bottom sheet for the booking stub on mobile.

## Elevation & Depth

Flat at rest. Depth comes from tone (ground vs stock vs navy) and from inset edges that make seats look pressable, not from shadows. Real lift is reserved for things that are physically picked up or floating: the lifted ticket, the drag ghost, the mobile sheet, and the confirm dialog. All shadows are tinted with navy, never neutral black.

### Shadow Vocabulary
- **Lift** (`box-shadow: 0 14px 28px -10px rgb(20 33 61 / 0.45), 0 3px 8px -2px rgb(20 33 61 / 0.25)`): the confirm dialog.
- **Low** (`box-shadow: 0 1px 2px rgb(20 33 61 / 0.12)`): small floating tags like the drag ghost destination.
- **Lifted ticket** (`filter: drop-shadow(0 10px 12px rgb(20 33 61 / 0.35)) drop-shadow(0 2px 3px rgb(20 33 61 / 0.25))`): drop-shadow filter so the notched mask casts a true silhouette. The sheet and ghost use the same pattern.
- **Pressed edge** (`box-shadow: inset 0 -4px 0 #a9c90f`): open seats (3px on buttons).

### Named Rules
**The Lift Means Moving Rule.** A shadow means the object is in hand or floating above the board. Nothing resting on the board casts one.

## Shapes

Two silhouettes define the world. The **seat** has a softer top than bottom (10px 10px 5px 5px), like a chair back. The **ticket** is a 6px rectangle with semicircular notches cut into both sides by a CSS mask (5px on board tickets, 8px at the tear line of the booking stub) and a dashed 1px perforation line 9px in from the left.

Containers step up in radius with scale: 4px for tiny patches and the Now tag, 8px for list rows and the earlier-hours toggle, 10px for buttons, 12px for date chips and notices, 14px for bands and panels, 18px for the dialog. Pills (999px) are for the role switch, open-count badges, and tags. Borders are 1px rule grey, drawn as inset box-shadows on interactive pieces so they never shift layout.

## Components

### Buttons
Chunky, pressable, and 44px tall.
- **Shape:** gently rounded (10px).
- **Primary:** optic yellow with a 3px inset yellow-edge bottom, navy text, 750 weight, 0 18px padding. Hover goes to the pressed yellow.
- **Move:** vermilion fill, navy text. Only appears inside the move sequence.
- **Quiet:** transparent with a 1px inset rule outline, 650 weight; outline darkens to muted slate on hover. On navy it uses a 35% white outline.
- **Active:** every button nudges down 1px on press. Transitions are 140ms on the ease-out curve.

### Chips
- **Date chip:** stock face, 1px rule border, 12px radius, uppercase day name over a condensed numeral over an open count underlined with an optic-yellow bar. Active chip turns navy with a yellow count. A full day shows "Full" in muted slate, no bar.
- **Open-count badge:** yellow pill under each court number; a court with none uses sold grey.
- **Tags:** small pills. Navy fill for the band's "Off-peak until 4 PM" tag, navy outline for "Off-peak" in the next open list.

### Cards / Containers
- **Corner Style:** 14px.
- **Background:** card stock on the ground.
- **Shadow Strategy:** none (see Elevation).
- **Border:** 1px rule grey.
- **Internal Padding:** 16px.
- **Booking stub:** when a seat is picked, the rail stub turns navy, tears at a notched perforation above its actions, and carries the yellow Book button. In move mode the stub takes a 2px vermilion border.

### Navigation
- **Role switch:** a stock pill with a small "Preview as" label and two 36px segments; the checked segment is navy with stock text.
- **Date strip:** the primary date navigation, described under Chips.

### Seat Map (signature)
- **Open:** optic yellow, pressed edge, lifts 1px on hover and sinks 1px on press.
- **Picked:** navy with a 3px inset yellow ring and yellow label.
- **Taken:** 135 degree grey hatch, label on a solid grey patch.
- **Hold:** lavender crosshatch.
- **Your booking:** navy with yellow label.
- **Past:** dashed rule outline; past taken seats fade to 55%.
- **Day-part band:** 14px rounded field with a 1px inset rule; off-peak bands drop the rule and fill with the off-peak tint. Head shows the uppercase part name and its range.
- **Now-line:** 2px navy rule across the map with a navy "Now" tag at the right.

### Ticket and Move Sequence (signature)
- **Ticket at rest:** stock face, notched sides, muted perforation, 1px rule outline, grab cursor. Hold tickets use lavender with a hold-ink perforation.
- **Lifted:** rises 5px and tilts -2.5 degrees; perforation and a 2px outline turn vermilion; a navy drop shadow appears. The origin seat ghosts to 40% with a vermilion outline; other tickets and taken seats dim to 55%.
- **Drop target:** open seats relabel MOVE HERE; the hovered one scales to 1.04 with a 3px vermilion outline.
- **Drag ghost:** a 180px tilted stub with vermilion perforation and a vermilion destination tag (navy if the drop is invalid).
- **Confirm dialog:** 18px stock dialog on a 50% navy backdrop, From stub (ground) and To stub (yellow with vermilion outline) joined by a vermilion arrow. Actions stack full width below 480px.
- **Reseat:** the landed ticket settles over 620ms from a tilted lift with a vermilion ring that fades out.

## Do's and Don'ts

### Do:
- **Do** keep optic yellow for open seats and booking actions only, and keep it the loudest thing on screen.
- **Do** keep vermilion for the lift, drop, confirm, and reseat sequence, and nothing else.
- **Do** express off-peak as a tinted band field for weekdays before 4 PM.
- **Do** fold ended hours behind a "Show earlier hours" toggle rather than showing a wall of past seats.
- **Do** condense numerals and seat labels with the wdth axis and keep all numerals tabular.
- **Do** draw taken and hold states with hatch patterns so they read without color alone.
- **Do** tint every shadow with navy (rgb 20 33 61) and reserve shadows for objects in hand or floating.
- **Do** use the 3px navy focus outline with a 2px offset on every interactive element.
- **Do** honor reduced motion; the lift, pop, rise, and reseat animations collapse to instant.

### Don't:
- **Don't** ship a dark theme; the world is light only by design.
- **Don't** add a second accent color, or use vermilion outside the move sequence.
- **Don't** mark off-peak with a stripe or per-seat badge, and don't label peak hours.
- **Don't** render the schedule as a white table with green cells.
- **Don't** put kicker or eyebrow labels above headings.
- **Don't** add shadows to resting panels, seats, or chips.
