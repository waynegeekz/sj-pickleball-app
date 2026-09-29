"use client";

import { useEffect, useRef, useState } from "react";
import { formatDate, formatRange, type MoveCheck, type Slot } from "@/lib/schedule";
import s from "./CourtBoard.module.css";

type Pending = { slot: Slot; court: number; hour: number };

export default function MoveDialog({
  pending,
  onCancel,
  onConfirm,
}: {
  pending: Pending | null;
  onCancel: () => void;
  onConfirm: () => MoveCheck;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (pending && !d.open) d.showModal();
    else if (!pending && d.open) {
      d.close();
    }
  }, [pending]);

  if (!pending) return <dialog ref={ref} className={s.dialog} />;
  const { slot, court, hour } = pending;
  const isBlock = slot.kind === "block";

  const confirm = () => {
    const result = onConfirm();
    if (!result.ok) setError(`Court ${court}, ${formatRange(hour)} is no longer free (${result.reason.toLowerCase()}). Pick another slot.`);
  };

  const cancel = () => {
    setError(null);
    onCancel();
  };

  return (
    <dialog
      ref={ref}
      className={s.dialog}
      aria-labelledby="move-title"
      onCancel={(e) => {
        e.preventDefault();
        cancel();
      }}
    >
      <h2 id="move-title" className={s.dialogTitle}>
        Move {isBlock ? "this hold" : "this booking"}?
      </h2>
      <p className={s.dialogWho}>
        {isBlock ? `Hold: ${slot.name}` : slot.name} · {formatDate(slot.date)}
      </p>

      <div className={s.reseat}>
        <div className={`${s.reseatStub} ${s.reseatFrom}`}>
          <span className={s.reseatLabel}>From</span>
          <span className={s.reseatCourt}>Court {slot.court}</span>
          <span className={s.reseatTime}>{formatRange(slot.hour)}</span>
        </div>
        <svg className={s.reseatArrow} viewBox="0 0 24 24" width="24" height="24" aria-hidden>
          <path d="M4 12h15m-5-6 6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div className={`${s.reseatStub} ${s.reseatTo}`}>
          <span className={s.reseatLabel}>To</span>
          <span className={s.reseatCourt}>Court {court}</span>
          <span className={s.reseatTime}>{formatRange(hour)}</span>
        </div>
      </div>

      {error ? (
        <p className={s.dialogError} role="alert">
          {error}
        </p>
      ) : !isBlock ? (
        <p className={s.dialogNote}>{slot.name} won&apos;t be notified automatically.</p>
      ) : null}

      <div className={s.dialogActions}>
        <button type="button" className={s.btnQuiet} onClick={cancel} autoFocus>
          {error ? "Back to board" : "Keep it where it is"}
        </button>
        {error ? null : (
          <button type="button" className={s.btnMove} onClick={confirm}>
            Move {isBlock ? "hold" : "booking"}
          </button>
        )}
      </div>
    </dialog>
  );
}
