"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { emptyMatchingAnalytics, recommendFromCatalog, type MatchingAnalytics } from "@/lib/matching";
import { getLiveBundles, getDeliverableBooks, getDeliverableCourses } from "@/lib/live-catalog";
import { getSession } from "@/lib/session";
import { mutateState } from "@/lib/state";
import { mutateOverlay } from "@/lib/storage";

const RESULT_COOKIE = "imu_match_result";

export type StoredMatchResult = {
  at: string;
  pathLabel: string;
  format: string;
  courseIds: string[];
  bookIds: string[];
  bundleIds: string[];
  answerSummary: { questionId: string; optionId: string; label: string }[];
  source: "marketing" | "campus";
};

function parseAnswers(formData: FormData) {
  const answers: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("q_")) continue;
    answers[key.slice(2)] = String(value);
  }
  return answers;
}

export async function trackMatchStart() {
  await mutateOverlay((overlay) => {
    const matching = { ...emptyMatchingAnalytics(), ...(overlay.matching ?? {}) };
    matching.starts += 1;
    return { ...overlay, matching };
  });
}

export async function completeMatching(formData: FormData) {
  const answers = parseAnswers(formData);
  const source: "marketing" | "campus" =
    String(formData.get("source") ?? "marketing") === "campus" ? "campus" : "marketing";
  if (Object.keys(answers).length < 3) {
    redirect(source === "campus" ? "/campus/match?error=incomplete" : "/match?error=incomplete");
  }

  const [courses, books, bundles] = await Promise.all([
    getDeliverableCourses(),
    getDeliverableBooks(),
    getLiveBundles(),
  ]);
  const rec = recommendFromCatalog({ answers, courses, books, bundles });
  const at = new Date().toISOString();
  const payload: StoredMatchResult = {
    at,
    pathLabel: rec.pathLabel,
    format: rec.format,
    courseIds: rec.courses.map((row) => row.item.id),
    bookIds: rec.books.map((row) => row.item.id),
    bundleIds: rec.bundles.map((row) => row.item.id),
    answerSummary: rec.answerSummary,
    source,
  };

  await mutateOverlay((overlay) => {
    const matching = { ...emptyMatchingAnalytics(), ...(overlay.matching ?? {}) };
    matching.completions += 1;
    matching.lastAt = at.slice(0, 10);
    const goal = answers.goal ?? "";
    const format = answers.format ?? rec.format;
    if (goal) matching.byGoal[goal] = (matching.byGoal[goal] ?? 0) + 1;
    if (format) matching.byFormat[format] = (matching.byFormat[format] ?? 0) + 1;
    matching.byPath[rec.pathLabel] = (matching.byPath[rec.pathLabel] ?? 0) + 1;
    const entry: MatchingAnalytics["recent"][number] = {
      at: at.slice(0, 10),
      pathLabel: rec.pathLabel,
      goal: answers.goal,
      format: answers.format ?? rec.format,
      topCourseIds: payload.courseIds.slice(0, 3),
      topBookIds: payload.bookIds.slice(0, 2),
      topBundleIds: payload.bundleIds.slice(0, 2),
      source,
    };
    matching.recent = [entry, ...(matching.recent ?? [])].slice(0, 40);
    return { ...overlay, matching };
  });

  const session = await getSession();
  if (session) {
    await mutateState((state) => ({
      ...state,
      lastMatch: {
        at: at.slice(0, 10),
        pathLabel: rec.pathLabel,
        courseIds: payload.courseIds,
        bookIds: payload.bookIds,
        bundleIds: payload.bundleIds,
      },
    }));
  }

  (await cookies()).set(RESULT_COOKIE, JSON.stringify(payload), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  revalidatePath("/admin/matching");
  revalidatePath("/admin");
  revalidatePath("/campus");
  redirect(source === "campus" ? "/campus/match/results" : "/match/results");
}

export async function readMatchResult(): Promise<StoredMatchResult | null> {
  const raw = (await cookies()).get(RESULT_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredMatchResult;
  } catch {
    return null;
  }
}
