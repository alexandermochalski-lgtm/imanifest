"use client";

import { closeDailyDesk } from "@/app/actions/campus";
import { Flash, GoldButton } from "@/components/ui";
import type { DailyDeskContent } from "@/lib/daily-desk";
import { DESK_COIN } from "@/lib/daily-desk";
import Link from "next/link";
import { useEffect, useState } from "react";

export function DailyDesk({
  desk,
  streak,
  closed,
  ok,
  error,
}: {
  desk: DailyDeskContent;
  streak: number;
  closed: boolean;
  ok?: string;
  error?: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (error === "desk-short") {
      setOpen(true);
      return;
    }
    if (window.location.hash === "#desk") {
      setOpen(true);
    }
  }, [error]);

  const headline = closed
    ? streak > 0
      ? `Campus day ${streak}`
      : "Today's desk"
    : streak > 0
      ? `Day ${streak} · close today's desk`
      : "Open today's desk";

  return (
    <section id="desk" className="imu-panel mt-10 rounded-2xl p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gold-deep">Daily desk</p>
          <h2 className="mt-2 font-[family-name:var(--font-cormorant)] text-2xl text-white">{headline}</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Master Tenet pinned. Founder note of the day. Then one prompt, one clip, one mandate, one thread.{" "}
            {DESK_COIN} coins when you close it — once per UTC day.
          </p>
        </div>
        {!open ? (
          <button className="gold-btn rounded-lg px-5 py-2.5 text-[11px]" type="button" onClick={() => setOpen(true)}>
            {closed ? "View today's desk" : "Open today's desk"}
          </button>
        ) : (
          <button
            className="ghost-btn rounded-lg px-5 py-2.5 text-[11px]"
            type="button"
            onClick={() => setOpen(false)}
          >
            Minimize
          </button>
        )}
      </div>

      <Flash
        ok={ok}
        error={error}
        map={{
          desk: `Desk closed. Campus day ${streak} · ${DESK_COIN} coins.`,
          "desk-short": "Write one real line on the prompt — at least a sentence.",
        }}
      />

      {!open ? (
        <p className="mt-4 text-sm text-[var(--muted)]">
          {closed
            ? "Today's desk is on the ledger. Open to review, or come back after UTC midnight."
            : "Press Open today's desk when you're ready to run the session."}
        </p>
      ) : (
        <>
          <article className="mt-6 rounded-xl border border-gold/30 bg-black/40 p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-gold-deep">Pinned · Master Tenet</p>
            <h3 className="mt-2 font-[family-name:var(--font-cormorant)] text-xl text-white">{desk.pin.title}</h3>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--text-soft)]">‘{desk.pin.body}’</p>
            {desk.pin.attribution ? <p className="mt-3 text-sm text-gold">— {desk.pin.attribution}</p> : null}
          </article>

          <article className="mt-4 rounded-xl border border-[var(--line)] bg-black/30 p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-gold-deep">Daily Notes · Founder</p>
            <h3 className="mt-2 text-lg text-white">{desk.founderNote.title}</h3>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-muted">{desk.founderNote.body}</p>
            <p className="mt-3 text-xs text-gold">Steven Zee</p>
          </article>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <article className="rounded-xl border border-[var(--line)] bg-black/30 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-gold-deep">Prompt</p>
              <p className="mt-2 text-white">{desk.prompt}</p>
            </article>
            <Link href={desk.clip.href} className="rounded-xl border border-[var(--line)] bg-black/30 p-4 transition hover:border-gold/30">
              <p className="text-xs uppercase tracking-[0.16em] text-gold-deep">Clip</p>
              <p className="mt-2 text-white">{desk.clip.title}</p>
              <p className="mt-1 text-sm text-muted">
                {desk.clip.courseTitle} · {desk.clip.duration}
              </p>
            </Link>
            <Link href={desk.job.href} className="rounded-xl border border-[var(--line)] bg-black/30 p-4 transition hover:border-gold/30">
              <p className="text-xs uppercase tracking-[0.16em] text-gold-deep">Mandate</p>
              <p className="mt-2 text-white">{desk.job.title}</p>
              <p className="mt-1 text-sm text-muted">{desk.job.company}</p>
            </Link>
            <Link href={desk.forum.href} className="rounded-xl border border-[var(--line)] bg-black/30 p-4 transition hover:border-gold/30">
              <p className="text-xs uppercase tracking-[0.16em] text-gold-deep">Thread</p>
              <p className="mt-2 text-white">{desk.forum.title}</p>
              <p className="mt-1 text-sm text-muted">{desk.forum.line}</p>
            </Link>
          </div>

          {closed ? (
            <p className="mt-6 text-sm text-muted">Today's desk is on the ledger. Come back after UTC midnight.</p>
          ) : (
            <form action={closeDailyDesk} className="mt-6 space-y-3">
              <textarea
                name="note"
                rows={3}
                required
                minLength={12}
                placeholder="Answer the prompt in one line."
                className="w-full rounded-xl border border-[var(--line)] bg-black/40 px-3 py-2 text-sm"
              />
              <GoldButton pendingLabel="Closing…" type="submit">
                Close desk · {DESK_COIN} coins
              </GoldButton>
            </form>
          )}
        </>
      )}
    </section>
  );
}
