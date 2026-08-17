"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { appendLivePayment, getAdminOverlay } from "@/lib/admin-state";
import { jobs, promoCodes, coinPacks, seedForum } from "@/lib/catalog";
import { DESK_COIN, deskClosedToday, nextStreak, utcToday } from "@/lib/daily-desk";
import { getLiveCourseById } from "@/lib/live-catalog";
import { isCampusUnlocked } from "@/lib/membership";
import { getSession } from "@/lib/session";
import { getState, mutateState, notify } from "@/lib/state";
import type { ForumPost, Journal } from "@/lib/types";

async function authed() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

async function campusAuthed() {
  const session = await authed();
  const state = await getState();
  if (!(await isCampusUnlocked(session.role, state, session.userId, session.email))) redirect("/get");
  return session;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

export async function enrollCourse(courseId: string, useBalance = true) {
  const session = await campusAuthed();
  const course = await getLiveCourseById(courseId);
  if (!course) redirect("/courses?error=missing");
  const current = await getState();
  if (!current.enrollments.includes(courseId) && course.price > 0 && useBalance && current.coins < course.price) {
    redirect("/pricing?error=coins");
  }
  const already = current.enrollments.includes(courseId);
  await mutateState((state) => {
    if (state.enrollments.includes(courseId)) return state;
    const paid = course.price > 0 && useBalance ? { ...state, coins: state.coins - course.price } : state;
    return notify(
      { ...paid, enrollments: [...paid.enrollments, courseId] },
      "Enrolled",
      `${course.title} is on your campus ledger.`,
      `/courses/${course.slug}`,
    );
  });
  if (!already && course.price > 0 && useBalance) {
    await appendLivePayment({
      id: `live-course-${courseId}-${Date.now()}`,
      userId: session.userId,
      kind: "course",
      sku: courseId,
      label: course.title,
      amountUsd: 0,
      coins: -course.price,
      status: "paid",
      createdAt: new Date().toISOString().slice(0, 10),
    });
  }
  revalidatePath("/courses");
  redirect(`/courses/${course.slug}?ok=enrolled`);
}

export async function completeModule(courseId: string, moduleId: string) {
  await campusAuthed();
  await mutateState((state) => {
    if (!state.enrollments.includes(courseId)) return state;
    if (state.completedModules.includes(moduleId)) return state;
    return { ...state, completedModules: [...state.completedModules, moduleId] };
  });
  const course = await getLiveCourseById(courseId);
  revalidatePath(`/courses/${course?.slug ?? ""}`);
}

export async function submitQuiz(formData: FormData) {
  const session = await campusAuthed();
  const courseId = String(formData.get("courseId"));
  const moduleId = String(formData.get("moduleId"));
  const quizId = String(formData.get("quizId"));
  const retake = String(formData.get("retake") ?? "") === "1";
  const course = await getLiveCourseById(courseId);
  const module = course?.modules.find((item) => item.id === moduleId);
  if (!course || !module) redirect("/courses");
  const state = await getState();
  if (!state.enrollments.includes(courseId)) redirect(`/courses/${course.slug}?error=enroll`);

  let score = 0;
  let total = 0;
  for (const question of module.quiz.questions) {
    total += question.marks;
    const picked = Number(formData.get(`q-${question.id}`));
    if (picked === question.answerIndex) score += question.marks;
  }
  const pct = total === 0 ? 0 : Math.round((score / total) * 100);
  const passed = pct >= module.quiz.passMark;

  await mutateState((current) => {
    const quizResults = current.quizResults.filter(
      (result) => !(result.quizId === quizId && result.moduleId === moduleId),
    );
    quizResults.push({ quizId, courseId, moduleId, score: pct, passed });
    let completedModules = current.completedModules;
    if (passed && !completedModules.includes(moduleId)) {
      completedModules = [...completedModules, moduleId];
    }
    return notify(
      { ...current, quizResults, completedModules },
      retake ? "Quiz retake scored" : "Quiz submitted",
      `${session.name}: ${pct}% ${passed ? "PASS" : "FAIL"} (pass mark ${module.quiz.passMark}%).`,
      `/courses/${course.slug}`,
    );
  });
  revalidatePath(`/courses/${course.slug}`);
  redirect(`/courses/${course.slug}?quiz=${passed ? "pass" : "fail"}&score=${pct}`);
}

export async function toggleFavorite(kind: "book" | "job" | "journal" | "bundle", id: string) {
  await campusAuthed();
  await mutateState((state) => {
    const key =
      kind === "book"
        ? "favoriteBooks"
        : kind === "job"
          ? "favoriteJobs"
          : kind === "journal"
            ? "favoriteJournals"
            : "favoriteBundles";
    const set = new Set(state[key]);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    return { ...state, [key]: [...set] };
  });
  revalidatePath("/");
}

export async function applyToJob(formData: FormData) {
  const session = await campusAuthed();
  const jobId = String(formData.get("jobId"));
  const note = String(formData.get("note") ?? "").trim();
  const job = jobs.find((item) => item.id === jobId);
  if (!job || !note) redirect("/jobs?error=apply");
  await mutateState((state) => {
    if (state.applications.some((application) => application.jobId === jobId)) return state;
    return notify(
      {
        ...state,
        applications: [
          {
            id: `app-${Date.now()}`,
            jobId,
            userId: session.userId,
            note,
            status: "submitted",
            createdAt: new Date().toISOString().slice(0, 10),
          },
          ...state.applications,
        ],
      },
      "Application sent",
      `Applied to ${job.title}.`,
      "/jobs/applications",
    );
  });
  redirect("/jobs/applications?ok=1");
}

export async function createJournal(formData: FormData) {
  const session = await campusAuthed();
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const type = String(formData.get("type") ?? "public") === "private" ? "private" : "public";
  if (!title || !body) redirect("/journals/new?error=invalid");
  const slug = `${slugify(title)}-${Date.now().toString().slice(-4)}`;
  const journal: Journal = {
    id: `j-${Date.now()}`,
    slug,
    title,
    authorId: session.userId,
    authorName: session.name,
    type,
    excerpt: body.slice(0, 140),
    body,
    createdAt: new Date().toISOString().slice(0, 10),
  };
  await mutateState((state) => ({ ...state, journals: [journal, ...state.journals].slice(0, 30) }));
  redirect(`/journals/${slug}`);
}

export async function deleteJournal(journalId: string) {
  const session = await campusAuthed();
  await mutateState((state) => ({
    ...state,
    journals: state.journals.filter((journal) => journal.id !== journalId || journal.authorId !== session.userId),
  }));
  redirect("/journals/mine");
}

export async function createForumPost(formData: FormData) {
  const session = await campusAuthed();
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const category = String(formData.get("category") ?? "wealth-creation");
  if (!title || !body) redirect("/forum/new?error=invalid");
  const slug = `${slugify(title)}-${Date.now().toString().slice(-4)}`;
  const post: ForumPost = {
    id: `f-${Date.now()}`,
    slug,
    title,
    category,
    authorId: session.userId,
    authorName: session.name,
    body,
    createdAt: new Date().toISOString().slice(0, 10),
    replies: [],
  };
  await mutateState((state) => ({ ...state, forumPosts: [post, ...state.forumPosts].slice(0, 30) }));
  redirect(`/forum/${slug}`);
}

export async function replyForum(formData: FormData) {
  const session = await campusAuthed();
  const slug = String(formData.get("slug"));
  const body = String(formData.get("body") ?? "").trim();
  if (!body) redirect(`/forum/${slug}`);
  await mutateState((state) => {
    const all = [...seedForum, ...state.forumPosts];
    const existing = all.find((post) => post.slug === slug);
    if (!existing) return state;
    const reply = {
      id: `r-${Date.now()}`,
      authorId: session.userId,
      authorName: session.name,
      body,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    if (seedForum.some((post) => post.slug === slug)) {
      return {
        ...state,
        forumPosts: [
          { ...existing, replies: [...existing.replies, reply] },
          ...state.forumPosts.filter((post) => post.slug !== slug),
        ],
      };
    }
    return {
      ...state,
      forumPosts: state.forumPosts.map((post) =>
        post.slug === slug ? { ...post, replies: [...post.replies, reply] } : post,
      ),
    };
  });
  redirect(`/forum/${slug}`);
}

export async function likeForum(postId: string, slug: string) {
  await campusAuthed();
  await mutateState((state) => {
    const set = new Set(state.likedForum);
    if (set.has(postId)) set.delete(postId);
    else set.add(postId);
    return { ...state, likedForum: [...set] };
  });
  redirect(`/forum/${slug}`);
}

export async function buyCoins(formData: FormData) {
  const session = await campusAuthed();
  const packId = String(formData.get("packId"));
  const promo = String(formData.get("promo") ?? "").trim().toUpperCase();
  const pack = coinPacks.find((item) => item.id === packId);
  if (!pack) redirect("/pricing");
  let payable = pack.price;
  const overlay = await getAdminOverlay();
  const catalogCode = promoCodes.find((item) => item.code === promo);
  const codeActive = promo ? (overlay.promoActive[promo] ?? catalogCode?.active ?? false) : false;
  const code = catalogCode && codeActive ? catalogCode : undefined;
  if (promo && !code) redirect(`/pricing/${packId}?error=promo`);
  if (code) payable = Math.round(payable * (1 - code.discountPct / 100));
  await mutateState((state) =>
    notify(
      { ...state, coins: state.coins + pack.coins + pack.bonus },
      "Coins credited",
      `${pack.coins + pack.bonus} coins added. Simulated card capture $${payable}.`,
      "/pricing",
    ),
  );
  await appendLivePayment({
    id: `live-coins-${packId}-${Date.now()}`,
    userId: session.userId,
    kind: "coins",
    sku: packId,
    label: `${pack.name} pack`,
    amountUsd: payable,
    coins: pack.coins + pack.bonus,
    promo: code?.code,
    status: "paid",
    createdAt: new Date().toISOString().slice(0, 10),
  });
  redirect("/pricing?ok=purchase");
}

export async function buyBundle(bundleId: string) {
  const session = await campusAuthed();
  const { bundles } = await import("@/lib/catalog");
  const bundle = bundles.find((item) => item.id === bundleId);
  if (!bundle) redirect("/bundles");
  const current = await getState();
  if (current.coins < bundle.price) redirect("/pricing?error=coins");
  await mutateState((state) => {
    const enrollments = new Set([...state.enrollments, ...bundle.courseIds]);
    return notify(
      { ...state, coins: state.coins - bundle.price, enrollments: [...enrollments] },
      "Bundle unlocked",
      `${bundle.title} courses are now enrolled.`,
      `/bundles/${bundle.slug}`,
    );
  });
  await appendLivePayment({
    id: `live-bundle-${bundleId}-${Date.now()}`,
    userId: session.userId,
    kind: "bundle",
    sku: bundleId,
    label: bundle.title,
    amountUsd: 0,
    coins: -bundle.price,
    status: "paid",
    createdAt: new Date().toISOString().slice(0, 10),
  });
  redirect(`/bundles/${bundle.slug}?ok=1`);
}

export async function closeDailyDesk(formData: FormData) {
  await campusAuthed();
  const note = String(formData.get("note") ?? "").trim();
  if (note.length < 12) redirect("/campus?error=desk-short");
  const current = await getState();
  if (deskClosedToday(current)) redirect("/campus?ok=desk");
  const today = utcToday();
  const streak = nextStreak(current, today);
  await mutateState((state) => {
    if (deskClosedToday(state)) return state;
    return notify(
      {
        ...state,
        coins: state.coins + DESK_COIN,
        streakCount: nextStreak(state, today),
        lastDeskDate: today,
      },
      "Desk closed",
      `Campus day ${streak}. ${DESK_COIN} coins on the ledger.`,
      "/campus",
    );
  });
  revalidatePath("/campus");
  revalidatePath("/profile");
  redirect("/campus?ok=desk");
}

export async function updateProfile(formData: FormData) {
  await campusAuthed();
  await mutateState((state) => ({
    ...state,
    profile: {
      name: String(formData.get("name") ?? state.profile.name),
      phone: String(formData.get("phone") ?? state.profile.phone),
      bio: String(formData.get("bio") ?? state.profile.bio),
    },
  }));
  redirect("/profile?ok=1");
}

export async function sendMessage(formData: FormData) {
  const session = await campusAuthed();
  const body = String(formData.get("body") ?? "").trim();
  if (!body) redirect("/messages");
  await mutateState((state) => ({
    ...state,
    messages: [
      {
        id: `msg-${Date.now()}`,
        fromId: session.userId,
        fromName: session.name,
        body,
        createdAt: new Date().toISOString().slice(0, 10),
      },
      ...state.messages,
    ].slice(0, 40),
  }));
  redirect("/messages?ok=1");
}

export async function markNotification(id: string) {
  await campusAuthed();
  await mutateState((state) => ({
    ...state,
    notifications: state.notifications.map((item) => (item.id === id ? { ...item, read: true } : item)),
  }));
  revalidatePath("/notifications");
}
