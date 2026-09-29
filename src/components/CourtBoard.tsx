"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  COURTS,
  DAY_PARTS,
  HOURS,
  OFF_PEAK_BEFORE,
  addDays,
  checkMove,
  facilityNow,
  formatDate,
  formatHour,
  formatRange,
  isOffPeak,
  isPast,
  isWeekday,
  sampleDay,
  seatState,
  slotKey,
  type MoveCheck,
  type Slot,
} from "@/lib/schedule";
import MoveDialog from "./MoveDialog";
import s from "./CourtBoard.module.css";

const DAYS_AHEAD = 14;
type Now = { date: string; hour: number };
type Role = "player" | "staff";
type Target = { court: number; hour: number };
type Drag = { id: string; x: number; y: number; target: Target | null; check: MoveCheck | null };
type Pending = { slot: Slot; court: number; hour: number };

const shortName = (name: string) => name.split(" ")[0];

export default function CourtBoard({ today, initialNow }: { today: string; initialNow: Now }) {
  const dates = useMemo(() => Array.from({ length: DAYS_AHEAD }, (_, i) => addDays(today, i)), [today]);
  const [days, setDays] = useState<Record<string, Slot[]>>(() =>
    Object.fromEntries(dates.map((d, i) => [d, sampleDay(d, i)])),
  );
  const [date, setDate] = useState(today);
  const [role, setRole] = useState<Role>("player");
  const [now, setNow] = useState<Now>(initialNow);
  const [picked, setPicked] = useState<Target | null>(null);
  const [liftedId, setLiftedId] = useState<string | null>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const [landedId, setLandedId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [canDrag, setCanDrag] = useState(false);
  const [showEarlier, setShowEarlier] = useState(false);

  const slots = days[date];
  const byKey = useMemo(() => new Map(slots.map((x) => [slotKey(x.court, x.hour), x])), [slots]);
  const lifted = liftedId ? slots.find((x) => x.id === liftedId) ?? null : null;
  const moving = role === "staff" && lifted !== null;

  useEffect(() => {
    const tick = () => setNow(facilityNow());
    const t = setInterval(tick, 30_000);
    return () => clearInterval(t);
  }, []);

  // Drag is for desktop and tablet; phones use select-then-place.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => setCanDrag(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const clearMove = useCallback(() => {
    setLiftedId(null);
    setDrag(null);
  }, []);

  useEffect(() => {
    if (!moving && !picked) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || pending) return;
      clearMove();
      setPicked(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [moving, picked, pending, clearMove]);

  const openCount = (d: string) => {
    const taken = new Set(days[d].map((x) => slotKey(x.court, x.hour)));
    let n = 0;
    for (const c of COURTS) for (const h of HOURS) if (!taken.has(slotKey(c, h)) && !isPast(d, h, now)) n++;
    return n;
  };

  const courtStats = COURTS.map((court) => {
    const free = HOURS.filter((h) => !byKey.has(slotKey(court, h)) && !isPast(date, h, now));
    return { court, open: free.length, next: free[0] };
  });
  const dayOpen = courtStats.reduce((a, c) => a + c.open, 0);
  const nextOpen = HOURS.flatMap((h) => COURTS.filter((c) => !byKey.has(slotKey(c, h)) && !isPast(date, h, now)).map((c) => ({ court: c, hour: h }))).slice(0, 6);
  const nextDayWithOpen = dayOpen === 0 ? dates.find((d) => d > date && openCount(d) > 0) : undefined;
  const weekday = isWeekday(date);
  // Hours that have fully ended today fold away so open slots lead.
  const ended = HOURS.filter((h) => isPast(date, h + 1, now));
  const visibleHours = showEarlier ? HOURS : HOURS.filter((h) => !ended.includes(h));
  const parts = DAY_PARTS.map((part) => ({ ...part, hours: visibleHours.filter((h) => h >= part.from && h < part.to) })).filter((p) => p.hours.length);
  const firstOffPeakPart = weekday ? parts.find((p) => p.from < OFF_PEAK_BEFORE)?.id : undefined;

  const selectDate = (d: string) => {
    setDate(d);
    setPicked(null);
    clearMove();
  };

  const switchRole = (r: Role) => {
    setRole(r);
    setPicked(null);
    clearMove();
    setNotice("");
  };

  const requestMove = (slot: Slot, court: number, hour: number) => {
    const check = checkMove(slots, slot, court, hour, now);
    if (!check.ok) {
      setLiftedId(null);
      setNotice(`Can't move there: ${check.reason.toLowerCase()}.`);
      return;
    }
    setPending({ slot, court, hour });
  };

  const confirmMove = (): MoveCheck => {
    if (!pending) return { ok: false, reason: "Nothing to move" };
    const { slot, court, hour } = pending;
    // Re-check against the latest schedule; it may have changed while the dialog was open.
    const check = checkMove(days[slot.date], slot, court, hour, facilityNow());
    if (!check.ok) return check;
    setDays((prev) => ({
      ...prev,
      [slot.date]: prev[slot.date].map((x) => (x.id === slot.id ? { ...x, court, hour } : x)),
    }));
    setPending(null);
    clearMove();
    setLandedId(slot.id);
    setNotice(`Moved ${slot.kind === "block" ? slot.name.toLowerCase() : slot.name} to Court ${court}, ${formatRange(hour)}.`);
    return { ok: true };
  };

  const book = (t: Target) => {
    const id = `${date}-${t.court}-${t.hour}-you`;
    setDays((prev) => ({
      ...prev,
      [date]: [...prev[date], { id, date, court: t.court, hour: t.hour, kind: "booking", name: "You", mine: true }],
    }));
    setPicked(null);
    setLandedId(id);
    setNotice(`Booked Court ${t.court}, ${formatRange(t.hour)} on ${formatDate(date, "short")}.`);
  };

  // ---- pointer drag (desktop and tablet) ----
  const dragRef = useRef<{ id: string; sx: number; sy: number; active: boolean } | null>(null);
  const suppressClick = useRef(false);

  const targetAt = (x: number, y: number): Target | null => {
    const el = document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-court]");
    return el ? { court: Number(el.dataset.court), hour: Number(el.dataset.hour) } : null;
  };

  const onTicketPointerDown = (e: React.PointerEvent, slot: Slot) => {
    if (role !== "staff" || !canDrag || e.button !== 0) return;
    dragRef.current = { id: slot.id, sx: e.clientX, sy: e.clientY, active: false };
    const move = (ev: PointerEvent) => {
      const d = dragRef.current;
      if (!d) return;
      if (!d.active) {
        if (Math.hypot(ev.clientX - d.sx, ev.clientY - d.sy) < 6) return;
        d.active = true;
        setLiftedId(slot.id);
      }
      ev.preventDefault();
      const target = targetAt(ev.clientX, ev.clientY);
      setDrag({
        id: slot.id,
        x: ev.clientX,
        y: ev.clientY,
        target,
        check: target ? checkMove(slots, slot, target.court, target.hour, now) : null,
      });
    };
    const up = (ev: PointerEvent) => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      const d = dragRef.current;
      dragRef.current = null;
      if (!d?.active) return;
      // Swallow only the click this drag produces, if any.
      suppressClick.current = true;
      setTimeout(() => (suppressClick.current = false), 0);
      setDrag(null);
      const target = ev.type === "pointerup" ? targetAt(ev.clientX, ev.clientY) : null;
      if (target && !(target.court === slot.court && target.hour === slot.hour)) requestMove(slot, target.court, target.hour);
      else setLiftedId(null);
    };
    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  const onTicketClick = (slot: Slot) => {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    setNotice("");
    setLiftedId((id) => (id === slot.id ? null : slot.id));
  };

  const draggingSlot = drag ? slots.find((x) => x.id === drag.id) : null;

  // ---- seat rendering ----
  const renderSeat = (court: number, hour: number) => {
    const slot = byKey.get(slotKey(court, hour));
    const state = seatState(slot, date, hour, now);
    const past = isPast(date, hour, now);
    const range = formatRange(hour);
    const offPeak = isOffPeak(date, hour);
    const base = `Court ${court}, ${range}${offPeak ? ", off-peak" : ""}`;
    const cellProps = { "data-court": court, "data-hour": hour, role: "cell" as const };

    if (state === "open") {
      const isPicked = picked?.court === court && picked.hour === hour;
      if (moving && lifted) {
        const check = checkMove(slots, lifted, court, hour, now);
        const hot = drag?.target?.court === court && drag.target.hour === hour;
        return (
          <div key={court} {...cellProps} className={s.cell}>
            <button
              type="button"
              className={`${s.seat} ${s.open} ${hot ? s.hot : ""}`}
              onClick={() => requestMove(lifted, court, hour)}
              disabled={!check.ok}
              aria-label={`Move here: ${base}`}
            >
              <span className={s.seatLabel}>{hot ? "Drop" : "Move here"}</span>
            </button>
          </div>
        );
      }
      if (role === "staff") {
        return (
          <div key={court} {...cellProps} className={s.cell}>
            <div id={`seat-${court}-${hour}`} tabIndex={-1} className={`${s.seat} ${s.open}`} role="img" aria-label={`${base}, open`}>
              <span className={s.seatLabel}>Open</span>
            </div>
          </div>
        );
      }
      return (
        <div key={court} {...cellProps} className={s.cell}>
          <button
            type="button"
            id={`seat-${court}-${hour}`}
            className={`${s.seat} ${s.open} ${isPicked ? s.picked : ""}`}
            onClick={() => setPicked(isPicked ? null : { court, hour })}
            aria-pressed={isPicked}
            aria-label={`${base}, open`}
          >
            <span className={s.seatLabel}>{isPicked ? "Picked" : "Open"}</span>
          </button>
        </div>
      );
    }

    if (state === "past" || (slot && past && role === "player")) {
      return (
        <div key={court} {...cellProps} className={s.cell} aria-label={`${base}, ${slot ? (slot.mine ? "your booking" : "taken") : "past"}`}>
          <div className={`${s.seat} ${slot ? s.soldPast : s.past}`} aria-hidden>
            {slot?.mine ? <span className={s.seatLabel}>Yours</span> : null}
          </div>
        </div>
      );
    }

    if (role === "staff" && slot) {
      const isLifted = liftedId === slot.id;
      return (
        <div key={court} {...cellProps} className={s.cell}>
          <button
            type="button"
            className={`${s.ticket} ${slot.kind === "block" ? s.ticketBlock : ""} ${isLifted ? (drag ? s.ghostOrigin : s.lifted) : ""} ${landedId === slot.id ? s.landed : ""}`}
            onPointerDown={past ? undefined : (e) => onTicketPointerDown(e, slot)}
            onClick={past ? undefined : () => onTicketClick(slot)}
            onAnimationEnd={() => setLandedId(null)}
            disabled={past}
            aria-pressed={isLifted}
            aria-label={`${slot.kind === "block" ? `Hold: ${slot.name}` : slot.name}, ${base}. ${isLifted ? "Selected to move." : "Select to move."}`}
          >
            <span className={s.ticketName}>
              <span className={s.nameShort}>{slot.kind === "block" ? slot.name : shortName(slot.name)}</span>
              <span className={s.nameFull}>{slot.name}</span>
            </span>
            {slot.kind === "block" ? <span className={s.ticketMeta}>Hold</span> : null}
          </button>
        </div>
      );
    }

    // player view of a taken, held, or own seat
    const label = state === "mine" ? "Yours" : state === "block" ? "Closed" : "Taken";
    return (
      <div key={court} {...cellProps} className={s.cell}>
        <div
          className={`${s.seat} ${state === "mine" ? s.mine : state === "block" ? s.block : s.sold} ${slot && landedId === slot.id ? s.landed : ""}`}
          onAnimationEnd={() => setLandedId(null)}
          aria-label={`${base}, ${state === "mine" ? "your booking" : state === "block" ? "closed" : "taken"}`}
          role="img"
        >
          <span className={s.seatLabel}>{label}</span>
        </div>
      </div>
    );
  };

  const nowInRow = (hour: number) => now.date === date && now.hour >= hour && now.hour < hour + 1;

  const panel = (
    <Panel
      role={role}
      date={date}
      picked={picked}
      lifted={lifted}
      canDrag={canDrag}
      notice={notice}
      dayOpen={dayOpen}
      onBook={book}
      onClearPick={() => setPicked(null)}
      onCancelMove={clearMove}
    />
  );

  return (
    <div className={`${s.shell} ${moving ? s.isMoving : ""}`}>
      <header className={s.top}>
        <div className={s.titleRow}>
          <div>
            <h1 className={s.title}>Court availability</h1>
            <p className={s.sub}>
              <span className={s.subItem}>
                <span className={s.placeholder}>[Facility name]</span>
              </span>{" "}
              <span className={s.subItem}>· 6 courts</span> <span className={s.subItem}>· 1-hour slots</span>{" "}
              <span className={s.subItem}>
                · <span className={s.sample}>Sample schedule, demo hours 7 AM–9 PM</span>
              </span>
            </p>
          </div>
          <div className={s.roleSwitch} role="radiogroup" aria-label="Preview as">
            <span className={s.roleLabel} aria-hidden>Preview as</span>
            {(["player", "staff"] as const).map((r) => (
              <button
                key={r}
                type="button"
                role="radio"
                aria-checked={role === r}
                className={s.roleBtn}
                onClick={() => switchRole(r)}
              >
                {r === "player" ? "Player" : "Staff"}
              </button>
            ))}
          </div>
        </div>

        <nav className={s.dates} aria-label="Choose a day">
          {dates.map((d, i) => {
            const n = openCount(d);
            const active = d === date;
            const [, , dd] = d.split("-");
            return (
              <button
                key={d}
                type="button"
                className={`${s.day} ${active ? s.dayActive : ""} ${n === 0 ? s.dayFull : ""}`}
                aria-current={active ? "date" : undefined}
                onClick={() => selectDate(d)}
              >
                <span className={s.dayName}>{i === 0 ? "Today" : formatDate(d, "short").split(",")[0]}</span>
                <span className={s.dayNum}>{Number(dd)}</span>
                <span className={s.dayOpen}>{n === 0 ? "Full" : `${n} open`}</span>
                <span className="sr-only">{`${formatDate(d)}${isWeekday(d) ? ", off-peak before 4 PM" : ""}`}</span>
              </button>
            );
          })}
        </nav>
      </header>

      <div className={s.body}>
        <main className={s.main}>
          <div className={s.dayLine}>
            <h2 className={s.dayTitle}>{formatDate(date)}</h2>
            <p className={s.dayMeta}>
              <span>
                <strong>{dayOpen}</strong> open {dayOpen === 1 ? "slot" : "slots"}
              </span>
            </p>
          </div>

          {dayOpen === 0 ? (
            <div className={s.soldOut} role="status">
              <p>{date === today ? "No open courts left today." : `Every court is taken on ${formatDate(date)}.`}</p>
              {nextDayWithOpen ? (
                <button type="button" className={s.soldOutBtn} onClick={() => selectDate(nextDayWithOpen)}>
                  See {formatDate(nextDayWithOpen, "short")} · {openCount(nextDayWithOpen)} open
                </button>
              ) : null}
            </div>
          ) : null}


          <div className={s.map} role="table" aria-label={`Court availability for ${formatDate(date)}`}>
            <div className={s.courtRow} role="row">
              <div className={s.corner} role="columnheader">
                <span className={s.cornerLabel} aria-hidden>Court</span>
                <span className="sr-only">Time</span>
              </div>
              {courtStats.map((c) => (
                <div key={c.court} className={s.courtHead} role="columnheader">
                  <span className={s.courtNum}>
                    <span className="sr-only">Court </span>
                    {c.court}
                  </span>
                  <span className={`${s.courtOpen} ${c.open === 0 ? s.courtNone : ""}`}>{c.open === 0 ? "Full" : `${c.open} open`}</span>
                  <span className={s.courtNext}>{c.next !== undefined ? `Next ${formatHour(c.next)}` : " "}</span>
                </div>
              ))}
            </div>

            {ended.length ? (
              <div className={s.earlierRow}>
                <button type="button" className={s.earlierBtn} aria-expanded={showEarlier} onClick={() => setShowEarlier((v) => !v)}>
                  {showEarlier ? "Hide" : "Show"} earlier hours
                  <span className={s.earlierRange}>
                    {formatHour(ended[0])}–{formatHour(ended[ended.length - 1] + 1)}
                  </span>
                </button>
              </div>
            ) : null}

            {parts.map((part) => {
              const partOffPeak = weekday && part.from < OFF_PEAK_BEFORE;
              return (
                <div key={part.id} role="rowgroup" className={`${s.part} ${partOffPeak ? s.partOffPeak : ""}`}>
                  <div className={s.partHead} role="row">
                    <div role="rowheader" className={s.partLabel}>
                      <span className={s.partName}>{part.label}</span>
                      <span className={s.partRange}>{formatHour(part.from)}–{formatHour(part.to)}</span>
                      {part.id === firstOffPeakPart ? <span className={s.offPeakTag}>Off-peak until {formatHour(OFF_PEAK_BEFORE)}</span> : null}
                    </div>
                  </div>
                  {part.hours.map((hour) => (
                    <div
                      key={hour}
                      role="row"
                      className={`${s.row} ${isPast(date, hour + 1, now) ? s.rowPast : ""}`}
                    >
                      <div role="rowheader" className={s.hour}>
                        <span className={s.hourNum}>{formatHour(hour).split(" ")[0]}</span>
                        <span className={s.hourAmPm}>{formatHour(hour).split(" ")[1]}</span>
                      </div>
                      {COURTS.map((court) => renderSeat(court, hour))}
                      {nowInRow(hour) ? (
                        <div className={s.nowLine} style={{ top: `${(now.hour - hour) * 100}%` }} aria-hidden>
                          <span className={s.nowTag}>Now</span>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </main>

        <aside className={s.rail} aria-label="Summary">
          <div className={s.railPanel}>{panel}</div>

          <section className={s.railSection}>
            <h3 className={s.railHead}>Next open</h3>
            {nextOpen.length ? (
              <ul className={s.nextList}>
                {nextOpen.map((t) => (
                  <li key={slotKey(t.court, t.hour)}>
                    <button
                      type="button"
                      className={s.nextItem}
                      onClick={() => {
                        const el = document.getElementById(`seat-${t.court}-${t.hour}`);
                        el?.scrollIntoView({ block: "center", behavior: "smooth" });
                        el?.focus({ preventScroll: true });
                        if (role === "player") setPicked(t);
                      }}
                    >
                      <span className={s.nextTime}>{formatRange(t.hour)}</span>
                      <span className={s.nextCourt}>Court {t.court}</span>
                      {isOffPeak(date, t.hour) ? <span className={s.nextTag}>Off-peak</span> : null}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={s.railEmpty}>Nothing open for the rest of this day.</p>
            )}
          </section>

          <section className={s.railSection}>
            <h3 className={s.railHead}>Key</h3>
            <ul className={s.key}>
              {role === "player" ? (
                <>
                  <li><span className={`${s.keySwatch} ${s.open}`} /> Open, tap to book</li>
                  <li><span className={`${s.keySwatch} ${s.sold}`} /> Taken</li>
                </>
              ) : (
                <>
                  <li><span className={`${s.keySwatch} ${s.open}`} /> Open, a ticket can move here</li>
                  <li><span className={`${s.keySwatch} ${s.keyTicket}`} /> Booking, drag or tap to move</li>
                </>
              )}
              <li><span className={`${s.keySwatch} ${s.block}`} /> Closed for maintenance or a hold</li>
              {role === "player" ? <li><span className={`${s.keySwatch} ${s.mine}`} /> Your booking</li> : null}
              <li><span className={s.keyBand} /> Off-peak band: weekdays before 4 PM</li>
            </ul>
          </section>
        </aside>
      </div>

      <div className={s.sheet}>{panel}</div>

      <p className="sr-only" aria-live="polite">{notice}</p>

      {drag && draggingSlot ? (
        <div className={s.dragGhost} style={{ transform: `translate(${drag.x}px, ${drag.y}px)` }} aria-hidden>
          <div className={`${s.ghostTicket} ${draggingSlot.kind === "block" ? s.ticketBlock : ""}`}>
            <span className={s.ticketName}>{draggingSlot.name}</span>
            <span className={s.ghostFrom}>Court {draggingSlot.court} · {formatRange(draggingSlot.hour)}</span>
          </div>
          <div className={`${s.ghostTo} ${drag.check && !drag.check.ok ? s.ghostBad : ""}`}>
            {drag.target && drag.check
              ? drag.check.ok
                ? (
                    <>
                      <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden>
                        <path d="M4 12h15m-5-6 6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Court {drag.target.court} · {formatRange(drag.target.hour)}
                    </>
                  )
                : drag.check.reason
              : "Drop on a lit seat"}
          </div>
        </div>
      ) : null}

      <MoveDialog
        pending={pending}
        onCancel={() => {
          setPending(null);
          clearMove();
        }}
        onConfirm={confirmMove}
      />
    </div>
  );
}

function Panel({
  role,
  date,
  picked,
  lifted,
  canDrag,
  notice,
  dayOpen,
  onBook,
  onClearPick,
  onCancelMove,
}: {
  role: Role;
  date: string;
  picked: Target | null;
  lifted: Slot | null;
  canDrag: boolean;
  notice: string;
  dayOpen: number;
  onBook: (t: Target) => void;
  onClearPick: () => void;
  onCancelMove: () => void;
}) {
  if (role === "player" && picked) {
    return (
      <div className={`${s.stub} ${s.stubOpen}`}>
        <div className={s.stubBody}>
          <span className={s.stubMain}>Court {picked.court} · {formatRange(picked.hour)}</span>
          <span className={s.stubMeta}>{formatDate(date)}{isOffPeak(date, picked.hour) ? " · Off-peak" : ""}</span>
        </div>
        <div className={s.stubActions}>
          <button type="button" className={s.btnPrimary} onClick={() => onBook(picked)}>
            Book this court
          </button>
          <button type="button" className={s.btnQuiet} onClick={onClearPick}>
            Clear
          </button>
        </div>
      </div>
    );
  }
  if (role === "staff" && lifted) {
    return (
      <div className={`${s.stub} ${s.stubMove}`}>
        <div className={s.stubBody}>
          <span className={s.stubMain}>Moving {lifted.kind === "block" ? `hold: ${lifted.name}` : lifted.name}</span>
          <span className={s.stubMeta}>From Court {lifted.court} · {formatRange(lifted.hour)}</span>
        </div>
        <div className={s.stubActions}>
          <p className={s.stubHint}>{canDrag ? "Drag it or pick a lit seat." : "Tap a lit seat."} You&apos;ll confirm before it moves.</p>
          <button type="button" className={s.btnQuiet} onClick={onCancelMove}>
            Cancel
          </button>
        </div>
      </div>
    );
  }
  if (notice) {
    return (
      <div className={`${s.stub} ${s.stubNotice}`}>
        <p className={s.noticeText}>{notice}</p>
      </div>
    );
  }
  return (
    <div className={`${s.stub} ${s.stubIdle}`}>
      <div className={s.stubBody}>
        <span className={s.summaryCount}>
          <strong>{dayOpen}</strong> open {dayOpen === 1 ? "slot" : "slots"}
        </span>
        <span className={s.stubMeta}>{formatDate(date)}</span>
      </div>
      <p className={s.idleText}>
        {role === "player"
          ? "Pick a yellow slot to book it."
          : canDrag
            ? "Drag any ticket to a free slot to move it. You'll confirm first."
            : "Tap a ticket, then a free slot, to move it. You'll confirm first."}
      </p>
    </div>
  );
}
