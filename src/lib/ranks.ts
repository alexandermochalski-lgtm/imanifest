import type { CampusState } from "@/lib/types";

/** Student desk classification — Operator campus identity ladder. */
export const STUDENT_RANKS = [
  "Observer",
  "Player",
  "Apprentice",
  "Practitioner",
  "Operator",
  "Architect",
] as const;

export type StudentRank = (typeof STUDENT_RANKS)[number];

/** Desk / login streak thresholds for each rank (inclusive). */
const RANK_THRESHOLDS: { rank: StudentRank; min: number }[] = [
  { rank: "Architect", min: 30 },
  { rank: "Operator", min: 21 },
  { rank: "Practitioner", min: 14 },
  { rank: "Apprentice", min: 7 },
  { rank: "Player", min: 1 },
  { rank: "Observer", min: 0 },
];

export function effectiveStreak(state: CampusState): number {
  return Math.max(state.streakCount ?? 0, state.loginStreakCount ?? 0);
}

export function studentRank(state: CampusState): StudentRank {
  const streak = effectiveStreak(state);
  for (const tier of RANK_THRESHOLDS) {
    if (streak >= tier.min) return tier.rank;
  }
  return "Observer";
}

export function nextRankInfo(state: CampusState): { next: StudentRank | null; need: number } {
  const current = studentRank(state);
  const idx = STUDENT_RANKS.indexOf(current);
  if (idx < 0 || idx >= STUDENT_RANKS.length - 1) return { next: null, need: 0 };
  const next = STUDENT_RANKS[idx + 1];
  const threshold = RANK_THRESHOLDS.find((tier) => tier.rank === next)?.min ?? 0;
  return { next, need: Math.max(0, threshold - effectiveStreak(state)) };
}

export function rankHint(state: CampusState): string {
  const { next, need } = nextRankInfo(state);
  if (!next) return "Top of the ladder — keep the desk open.";
  if (need === 0) return `Ready for ${next}.`;
  return `${need} more streak day${need === 1 ? "" : "s"} to reach ${next}.`;
}
