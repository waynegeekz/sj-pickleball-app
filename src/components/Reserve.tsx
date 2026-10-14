"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { refreshTaken, submitBooking, type BookingResult, type Field } from "@/app/reserve/actions";
import {
  HOLD_MINUTES,
  MAX_HOURS,
  MAX_SCREENSHOT_BYTES,
  RATE_OFF_PEAK,
  SCREENSHOT_TYPES,
  lengthOf,
  openHours,
  peso,
  rateFor,
  tapHour,
  totalFor,
  type Range,
} from "@/lib/reserve";
import {
  COURTS,
  DAY_PARTS,
  FACILITY_TIME_ZONE,
  formatDate,
  formatHour,
  formatRange,
  isWeekday,
} from "@/lib/schedule";
import s from "./Reserve.module.css";

type Now = { date: string; hour: number };
type Step = "pick" | "checkout" | "done";
type Done = Extract<BookingResult, { ok: true }> & { court: number; date: string; range: Range };

const rangeText = (r: Range) => (r.start === r.end ? formatRange(r.start) : `${formatHour(r.start)}–${formatHour(r.end + 1)}`);
const hoursText = (n: number) => `${n} ${n === 1 ? "hour" : "hours"}`;

export default function Reserve({
  dates,
  initialTaken,
  initialNow,
}: {
  dates: string[];
  initialTaken: Record<string, string[]>;
  initialNow: Now;
}) {
  const [taken, setTaken] = useState(initialTaken);
  const [date, setDate] = useState(dates[0]);
  const [court, setCourt] = useState<number | null>(() => {
    const set = new Set(initialTaken[dates[0]]);
    return COURTS.find((c) => openHours(dates[0], c, set, initialNow).length > 0) ?? null;
  });
  const [sel, setSel] = useState<Range | null>(null);
  const [step, setStep] = useState<Step>("pick");
  const [notice, setNotice] = useState("");
  const [done, setDone] = useState<Done | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [pending, start] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const now = initialNow;
  const takenSet = useMemo(() => new Set(taken[date]), [taken, date]);
  const openByCourt = useMemo(
    () => Object.fromEntries(COURTS.map((c) => [c, openHours(date, c, takenSet, now)])) as Record<number, number[]>,
    [date, takenSet, now],
  );
  const dayOpen = (d: string) => {
    const set = new Set(taken[d]);
    return COURTS.reduce((n, c) => n + openHours(d, c, set, now).length, 0);
  };

  const firstOpenCourt = (map: Record<number, number[]>) => COURTS.find((c) => map[c].length > 0) ?? null;

  const selectDate = (d: string) => {
    const set = new Set(taken[d]);
    const map = Object.fromEntries(COURTS.map((c) => [c, openHours(d, c, set, now)])) as Record<number, number[]>;
    setDate(d);
    setSel(null);
    setNotice("");
    setCourt(court !== null && map[court].length > 0 ? court : firstOpenCourt(map));
  };

  const selectCourt = (c: number) => {
    if (c === court) return;
    setCourt(c);
    setSel(null);
    setNotice("");
  };

  const tap = (hour: number) => {
    const r = tapHour(sel, hour);
    setSel(r.range);
    setNotice(r.capped ? `${MAX_HOURS} hours is the most one booking can hold.` : "");
  };

  const hours = court === null ? [] : openByCourt[court];
  const total = sel ? totalFor(date, sel) : 0;
  const nextDayWithOpen = dayOpen(date) === 0 ? dates.find((d) => d > date && dayOpen(d) > 0) : undefined;

  const pickFile = (f: File | undefined) => {
    if (!f) return;
    if (preview) URL.revokeObjectURL(preview);
    setFile(f);
    setPreview(f.type === "image/heic" || f.type === "image/heif" ? null : URL.createObjectURL(f));
    setErrors((e) => ({ ...e, screenshot: undefined }));
    if (!SCREENSHOT_TYPES.includes(f.type)) setErrors((e) => ({ ...e, screenshot: "Use a JPG, PNG, WebP or HEIC image." }));
    else if (f.size > MAX_SCREENSHOT_BYTES) setErrors((e) => ({ ...e, screenshot: "That image is over 5 MB. Choose a smaller screenshot." }));
  };

  const dropFile = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sel || court === null) return;
    const fd = new FormData();
    fd.set("date", date);
    fd.set("court", String(court));
    fd.set("start", String(sel.start));
    fd.set("end", String(sel.end));
    fd.set("name", name);
    fd.set("phone", phone);
    fd.set("email", email);
    if (file) fd.set("screenshot", file);
    start(async () => {
      const res = await submitBooking(fd);
      if (res.ok) {
        setTaken((t) => ({ ...t, [date]: res.taken }));
        setDone({ ...res, court, date, range: sel });
        setStep("done");
        window.scrollTo({ top: 0 });
        return;
      }
      setErrors(res.errors);
      if (res.taken) setTaken((t) => ({ ...t, [date]: res.taken! }));
      if (res.errors.slots) {
        setNotice(res.errors.slots);
        setSel(null);
        setStep("pick");
      } else {
        document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      }
    });
  };

  const reset = async () => {
    const fresh = await refreshTaken(date);
    setTaken((t) => ({ ...t, [date]: fresh }));
    dropFile();
    setSel(null);
    setDone(null);
    setNotice("");
    setErrors({});
    setStep("pick");
    window.scrollTo({ top: 0 });
  };

  const goCheckout = () => {
    setStep("checkout");
    window.scrollTo({ top: 0 });
  };

  const summary =
    sel && court !== null ? (
      <Summary
        court={court}
        date={date}
        sel={sel}
        total={total}
        action={step === "pick" ? <button type="button" className={s.btnPrimary} onClick={goCheckout}>Continue</button> : null}
      />
    ) : (
      <div className={s.summaryIdle}>
        <p className={s.summaryHint}>{hours.length ? "Tap an hour to start your booking." : "Pick a day and court with open hours."}</p>
      </div>
    );

  return (
    <div className={s.shell}>
      <header className={s.head}>
        <h1 className={s.title}>Reserve a court</h1>
        <p className={s.sub}>No account needed. {peso(RATE_OFF_PEAK)} off-peak, ₱400 otherwise, per hour.</p>
      </header>

      {step === "done" && done ? (
        <Confirmation done={done} onAgain={reset} />
      ) : step === "checkout" && sel && court !== null ? (
        <form className={s.checkout} onSubmit={submit} noValidate>
          <button type="button" className={s.back} onClick={() => setStep("pick")}>
            ← Change hours
          </button>
          <Summary court={court} date={date} sel={sel} total={total} />

          <section className={s.panel} aria-labelledby="h-details">
            <h2 id="h-details" className={s.h2}>Your details</h2>
            <Input id="name" label="Full name" value={name} onChange={setName} error={errors.name} autoComplete="name" />
            <Input id="phone" label="Mobile number" value={phone} onChange={setPhone} error={errors.phone} type="tel" inputMode="tel" autoComplete="tel" hint="09XX XXX XXXX" />
            <Input id="email" label="Email" value={email} onChange={setEmail} error={errors.email} type="email" inputMode="email" autoComplete="email" />
          </section>

          <section className={s.panel} aria-labelledby="h-pay">
            <h2 id="h-pay" className={s.h2}>Pay with GCash</h2>
            <div className={s.pay}>
              <Image className={s.qr} src="/qr-ph.png" width={512} height={812} alt="QR Ph code for GCash and bank app payments" priority />
              <div className={s.payBody}>
                <p className={s.payDue}>
                  Send exactly <strong>{peso(total)}</strong>
                </p>
                <ol className={s.steps}>
                  <li>Scan the code in GCash or any QR Ph app. On this phone, save the image and pick it from your gallery in GCash.</li>
                  <li>Take a screenshot of the receipt.</li>
                  <li>Add it below.</li>
                </ol>
                <a className={s.btnQuiet} href="/qr-ph.png" download="gcash-qr.png">
                  Save QR image
                </a>
              </div>
            </div>

            <div className={s.field}>
              <span className={s.label} id="l-shot">Payment screenshot</span>
              <input
                ref={fileRef}
                id="screenshot"
                className="sr-only"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                onChange={(e) => pickFile(e.target.files?.[0])}
                aria-describedby="e-screenshot"
                aria-invalid={errors.screenshot ? true : undefined}
              />
              {file ? (
                <div className={s.file}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
                  {preview ? <img className={s.thumb} src={preview} alt="Your payment screenshot" /> : <span className={s.thumb} aria-hidden="true" />}
                  <span className={s.fileName}>
                    {file.name}
                    <span className={s.fileSize}>{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                  </span>
                  <label htmlFor="screenshot" className={s.btnQuiet}>Replace</label>
                  <button type="button" className={s.btnQuiet} onClick={dropFile}>Remove</button>
                </div>
              ) : (
                <label htmlFor="screenshot" className={s.drop}>
                  <span className={s.dropMain}>Add payment screenshot</span>
                  <span className={s.dropHint}>JPG, PNG, WebP or HEIC, up to 5 MB</span>
                </label>
              )}
              <p id="e-screenshot" className={s.error} role="alert">{errors.screenshot}</p>
            </div>
          </section>

          <div className={s.submitRow}>
            <button type="submit" className={s.btnPrimary} disabled={pending}>
              {pending ? "Submitting…" : `Submit booking · ${peso(total)}`}
            </button>
            <p className={s.fine}>
              We hold these hours for {HOLD_MINUTES} minutes while we check your payment. To cancel later, contact the facility.
            </p>
          </div>
        </form>
      ) : (
        <>
          <nav className={s.dates} aria-label="Choose a day">
            {dates.map((d, i) => {
              const n = dayOpen(d);
              const active = d === date;
              return (
                <button
                  key={d}
                  type="button"
                  className={`${s.day} ${active ? s.dayActive : ""} ${n === 0 ? s.dayFull : ""}`}
                  aria-current={active ? "date" : undefined}
                  onClick={() => selectDate(d)}
                >
                  <span className={s.dayName}>{i === 0 ? "Today" : formatDate(d, "short").split(",")[0]}</span>
                  <span className={s.dayNum}>{Number(d.split("-")[2])}</span>
                  <span className={s.dayOpen}>{n === 0 ? "Full" : `${n} open`}</span>
                  <span className="sr-only">{`${formatDate(d)}${isWeekday(d) ? ", off-peak before 4 PM" : ""}`}</span>
                </button>
              );
            })}
          </nav>

          <div className={s.body}>
            <main className={s.main}>
              {dayOpen(date) === 0 ? (
                <div className={s.soldOut}>
                  <p>{date === dates[0] ? "No open hours left today." : `Every court is taken on ${formatDate(date)}.`}</p>
                  {nextDayWithOpen ? (
                    <button type="button" className={s.btnPrimary} onClick={() => selectDate(nextDayWithOpen)}>
                      See {formatDate(nextDayWithOpen, "short")} · {dayOpen(nextDayWithOpen)} open
                    </button>
                  ) : null}
                </div>
              ) : (
                <>
                  <h2 className={s.h2}>{formatDate(date)}</h2>
                  <div className={s.courts} role="group" aria-label="Choose a court">
                    {COURTS.map((c) => {
                      const n = openByCourt[c].length;
                      return (
                        <button
                          key={c}
                          type="button"
                          disabled={n === 0}
                          className={`${s.court} ${c === court ? s.courtActive : ""}`}
                          aria-pressed={c === court}
                          aria-label={`Court ${c}, ${n === 0 ? "full" : `${n} open`}`}
                          onClick={() => selectCourt(c)}
                        >
                          <span className={s.courtNum}>{c}</span>
                          <span className={s.courtOpen}>{n === 0 ? "Full" : `${n} open`}</span>
                        </button>
                      );
                    })}
                  </div>

                  <p className={s.notice} role="status">{notice}</p>

                  {court !== null ? <Slots date={date} court={court} hours={hours} sel={sel} onTap={tap} /> : null}
                </>
              )}
            </main>
            <aside className={s.rail} aria-label="Your booking">
              {summary}
            </aside>
          </div>
          <div className={s.bar}>{summary}</div>
        </>
      )}
    </div>
  );
}

function Slots({ date, court, hours, sel, onTap }: { date: string; court: number; hours: number[]; sel: Range | null; onTap: (h: number) => void }) {
  const parts = DAY_PARTS.map((p) => ({ ...p, hours: hours.filter((h) => h >= p.from && h < p.to) })).filter((p) => p.hours.length);
  const gapBefore = new Set(hours.filter((h, i) => i > 0 && h !== hours[i - 1] + 1));
  return (
    <div className={s.slots}>
      {parts.map((p) => {
        const off = isWeekday(date) && p.from < 16;
        return (
          <section key={p.id} className={`${s.part} ${off ? s.partOff : ""}`} aria-label={`${p.label}, Court ${court}`}>
            <div className={s.partHead}>
              <span className={s.partName}>{p.label}</span>
              <span className={s.partRange}>{formatHour(p.from)}–{formatHour(p.to)}</span>
              {off ? <span className={s.offTag}>Off-peak until 4 PM</span> : null}
            </div>
            <ul className={s.list}>
              {p.hours.map((h) => {
                const picked = !!sel && h >= sel.start && h <= sel.end;
                return (
                  <li key={h}>
                    {gapBefore.has(h) ? <div className={s.gap} aria-hidden="true">Not available</div> : null}
                    <button
                      type="button"
                      className={`${s.seat} ${picked ? s.picked : s.open}`}
                      aria-pressed={picked}
                      onClick={() => onTap(h)}
                    >
                      <span className={s.seatTime}>{formatRange(h)}</span>
                      <span className={s.seatRate}>{peso(rateFor(date, h))}</span>
                      <span className={s.seatLabel}>{picked ? "Added" : "Open"}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function Summary({ court, date, sel, total, action }: { court: number; date: string; sel: Range; total: number; action?: React.ReactNode }) {
  const n = lengthOf(sel);
  return (
    <div className={s.summary}>
      <div className={s.summaryBody}>
        <span className={s.summaryMain}>Court {court} · {rangeText(sel)}</span>
        <span className={s.summaryMeta}>
          {formatDate(date)} · {hoursText(n)} · <strong>{peso(total)}</strong>
        </span>
        {action && n < MAX_HOURS ? <span className={s.summaryHint}>Tap the next hour to add it.</span> : null}
      </div>
      {action}
    </div>
  );
}

function Input({
  id,
  label,
  value,
  onChange,
  error,
  hint,
  ...rest
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  hint?: string;
} & Pick<React.InputHTMLAttributes<HTMLInputElement>, "type" | "inputMode" | "autoComplete">) {
  return (
    <div className={s.field}>
      <label htmlFor={id} className={s.label}>{label}</label>
      <input
        id={id}
        className={s.input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={hint}
        aria-invalid={error ? true : undefined}
        aria-describedby={`e-${id}`}
        {...rest}
      />
      <p id={`e-${id}`} className={s.error} role="alert">{error}</p>
    </div>
  );
}

function Confirmation({ done, onAgain }: { done: Done; onAgain: () => void }) {
  const until = new Intl.DateTimeFormat("en-US", { timeZone: FACILITY_TIME_ZONE, hour: "numeric", minute: "2-digit" }).format(done.heldUntil);
  return (
    <div className={s.doneWrap}>
      <h2 className={s.doneTitle} tabIndex={-1} ref={(el) => el?.focus()}>Booking received</h2>
      <p className={s.doneSub}>We are checking your payment. Your hours are held until {until}.</p>
      <div className={s.receipt}>
        <div className={s.receiptTop}>
          <span className={s.receiptRef}>{done.reference}</span>
          <span className={s.receiptTag}>Awaiting payment check</span>
        </div>
        <dl className={s.receiptBody}>
          <div><dt>Court</dt><dd>{done.court}</dd></div>
          <div><dt>Date</dt><dd>{formatDate(done.date)}</dd></div>
          <div><dt>Time</dt><dd>{rangeText(done.range)}</dd></div>
          <div><dt>Paid</dt><dd>{peso(done.total)}</dd></div>
        </dl>
      </div>
      <p className={s.fine}>Keep the reference. To cancel or change this booking, contact the facility.</p>
      <button type="button" className={s.btnQuiet} onClick={onAgain}>Book another court</button>
    </div>
  );
}
