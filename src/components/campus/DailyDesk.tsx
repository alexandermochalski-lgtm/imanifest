import { closeDailyDesk } from "@/app/actions/campus";
import { Flash, GoldButton } from "@/components/ui";
import type { DailyDeskContent } from "@/lib/daily-desk";
import { DESK_COIN } from "@/lib/daily-desk";
import Link from "next/link";

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
  return (
    <section id="desk" className="mt-10 rounded-2xl border border-[var(--line)] bg-panel p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gold-deep">Daily desk</p>
          <h2 className="mt-2 font-[family-name:var(--font-cormorant)] text-2xl text-white">
            {closed ? `Campus day ${streak}` : streak > 0 ? `Day ${streak} · close today’s desk` : "Open today’s desk"}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Sixty seconds: one prompt, one clip, one mandate, one thread. {DESK_COIN} coins when you close it — once per UTC day. Miss a day and the streak resets. Missed days do not stack.
          </p>
        </div>
        <p className="text-sm text-gold">{closed ? "Closed" : "Open"}</p>
      </div>
      <Flash
        ok={ok}
        error={error}
        map={{
          desk: `Desk closed. Campus day ${streak} · ${DESK_COIN} coins.`,
          "desk-short": "Write one real line on the prompt — at least a sentence.",
        }}
      />
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <article className="rounded-xl border border-[var(--line)] bg-black/30 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-gold-deep">Prompt</p>
          <p className="mt-2 text-white">{desk.prompt}</p>
        </article>
        <Link href={desk.clip.href} className="rounded-xl border border-[var(--line)] bg-black/30 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-gold-deep">Clip</p>
          <p className="mt-2 text-white">{desk.clip.title}</p>
          <p className="mt-1 text-sm text-muted">
            {desk.clip.courseTitle} · {desk.clip.duration}
          </p>
        </Link>
        <Link href={desk.job.href} className="rounded-xl border border-[var(--line)] bg-black/30 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-gold-deep">Mandate</p>
          <p className="mt-2 text-white">{desk.job.title}</p>
          <p className="mt-1 text-sm text-muted">{desk.job.company}</p>
        </Link>
        <Link href={desk.forum.href} className="rounded-xl border border-[var(--line)] bg-black/30 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-gold-deep">Thread</p>
          <p className="mt-2 text-white">{desk.forum.title}</p>
          <p className="mt-1 text-sm text-muted">{desk.forum.line}</p>
        </Link>
      </div>
      {closed ? (
        <p className="mt-6 text-sm text-muted">Today’s desk is on the ledger. Come back after UTC midnight.</p>
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
          <GoldButton type="submit">Close desk · {DESK_COIN} coins</GoldButton>
        </form>
      )}
    </section>
  );
}
