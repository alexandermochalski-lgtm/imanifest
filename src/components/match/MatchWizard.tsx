"use client";

import { useMemo, useState, useTransition } from "react";
import { completeMatching, trackMatchStart } from "@/app/actions/matching";
import { MATCH_QUESTIONS } from "@/lib/matching";

export function MatchWizard({ source = "marketing" }: { source?: "marketing" | "campus" }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [started, setStarted] = useState(false);
  const [pending, startTransition] = useTransition();

  const question = MATCH_QUESTIONS[step];
  const progress = useMemo(() => Math.round(((step + (answers[question?.id] ? 0.5 : 0)) / MATCH_QUESTIONS.length) * 100), [answers, question?.id, step]);
  const selected = question ? answers[question.id] : undefined;
  const isLast = step >= MATCH_QUESTIONS.length - 1;

  function choose(optionId: string) {
    if (!question) return;
    if (!started) {
      setStarted(true);
      void trackMatchStart();
    }
    setAnswers((prev) => ({ ...prev, [question.id]: optionId }));
  }

  function next() {
    if (!selected) return;
    if (isLast) {
      const body = new FormData();
      body.set("source", source);
      for (const [key, value] of Object.entries({ ...answers, [question.id]: selected })) {
        body.set(`q_${key}`, value);
      }
      startTransition(() => {
        void completeMatching(body);
      });
      return;
    }
    setStep((value) => value + 1);
  }

  function back() {
    setStep((value) => Math.max(0, value - 1));
  }

  if (!question) return null;

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-6 md:p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">
          Step {step + 1} / {MATCH_QUESTIONS.length}
        </p>
        <p className="text-xs text-muted">{progress}%</p>
      </div>
      <div className="mb-6 h-1 overflow-hidden rounded-full bg-white/5">
        <div className="h-full rounded-full bg-gold transition-all" style={{ width: `${Math.max(progress, 8)}%` }} />
      </div>

      <h2 className="font-[family-name:var(--font-cormorant)] text-3xl text-white md:text-4xl">{question.prompt}</h2>
      {question.sub ? <p className="mt-3 text-sm text-muted">{question.sub}</p> : null}

      <div className="mt-8 grid gap-3">
        {question.options.map((option) => {
          const active = selected === option.id;
          return (
            <button
              key={option.id}
              className={`rounded-xl border px-4 py-4 text-left transition ${
                active
                  ? "border-gold/60 bg-gold/10 text-white"
                  : "border-[var(--line)] bg-black/20 text-[var(--text-soft)] hover:border-gold/30 hover:text-white"
              }`}
              onClick={() => choose(option.id)}
              type="button"
            >
              <span className="block text-base text-white">{option.label}</span>
              {option.hint ? <span className="mt-1 block text-xs text-muted">{option.hint}</span> : null}
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        {step > 0 ? (
          <button className="ghost-btn rounded-lg px-5 py-2.5 text-[11px]" onClick={back} type="button">
            Back
          </button>
        ) : null}
        <button
          className="gold-btn rounded-xl px-5 py-2.5 text-xs disabled:opacity-50"
          disabled={!selected || pending}
          onClick={next}
          type="button"
        >
          {pending ? "Matching…" : isLast ? "See my path" : "Continue"}
        </button>
      </div>
    </div>
  );
}
