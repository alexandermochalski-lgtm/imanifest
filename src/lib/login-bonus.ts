import type { CampusState } from "@/lib/types";
import { utcToday, utcYesterday } from "@/lib/daily-desk";

/** Free coins credited once per UTC day when the student opens campus. */
export const LOGIN_COIN = 1;

/** Milestone bonuses for consecutive daily logins (UTC). */
export const LOGIN_STREAK_BONUSES: Record<number, number> = {
  7: 5,
  14: 10,
  21: 15,
  30: 25,
};

export function loginStreakLive(state: CampusState): number {
  const last = state.lastLoginDate ?? "";
  if (last === utcToday() || last === utcYesterday()) return state.loginStreakCount ?? 0;
  return 0;
}

export function nextLoginStreak(state: CampusState, today = utcToday()): number {
  if (state.lastLoginDate === utcYesterday()) return (state.loginStreakCount ?? 0) + 1;
  if (state.lastLoginDate === today) return state.loginStreakCount ?? 0;
  return 1;
}

export function loginBonusForStreak(streak: number): number {
  return LOGIN_STREAK_BONUSES[streak] ?? 0;
}

/** Forum posts with a campus photo earn this one-time bonus (Harvard-style field credit). */
export const FORUM_PHOTO_COIN = 2;
