"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { appendLivePayment } from "@/lib/admin-state";
import { jobs, seedForum } from "@/lib/catalog";
import { DESK_COIN, deskClosedToday, nextStreak, utcToday } from "@/lib/daily-desk";
import {
  FORUM_PHOTO_COIN,
  LOGIN_COIN,
  loginBonusForStreak,
  nextLoginStreak,
} from "@/lib/login-bonus";
import { getLiveCourseById, getLiveCourses } from "@/lib/live-catalog";
import { isCampusUnlocked } from "@/lib/membership";
import { getSession } from "@/lib/session";
import { getState, mutateState, notify } from "@/lib/state";
import { COIN_PENDING_COOKIE, coinCheckoutUrl, coinPackFromId } from "@/lib/stripe";
import type { ForumPost, Journal, Message } from "@/lib/types";
import { findDirectoryContact, upsertDirectoryProfile } from "@/lib/directory";
import {
  PEER_MESSAGE_COST,
  courseIdFromMentor,
  findContact,
  persistRemoteMessage,
} from "@/lib/messenger";
import { cookies } from "next/headers";

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
  const imageUrl = String(formData.get("imageUrl") ?? "").trim() || undefined;
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
    imageUrl,
    createdAt: new Date().toISOString().slice(0, 10),
    replies: [],
  };
  const photoBonus = imageUrl ? FORUM_PHOTO_COIN : 0;
  await mutateState((state) => {
    const next = {
      ...state,
      forumPosts: [post, ...state.forumPosts].slice(0, 30),
      coins: state.coins + photoBonus,
    };
    if (!photoBonus) return next;
    return notify(
      next,
      "Field photo credited",
      `+${FORUM_PHOTO_COIN} coins for posting campus work with a photo.`,
      `/forum/${slug}`,
    );
  });
  redirect(`/forum/${slug}${photoBonus ? "?ok=photo" : ""}`);
}

export async function replyForum(formData: FormData) {
  const session = await campusAuthed();
  const slug = String(formData.get("slug"));
  const body = String(formData.get("body") ?? "").trim().slice(0, 800);
  if (!body) redirect(`/forum/${slug}?error=empty`);
  await mutateState((state) => {
    // Prefer the live overlay so prior student replies are not wiped by seed copies.
    const existing =
      state.forumPosts.find((post) => post.slug === slug) ?? seedForum.find((post) => post.slug === slug);
    if (!existing) return state;
    const reply = {
      id: `r-${Date.now()}`,
      authorId: session.userId,
      authorName: session.name,
      body,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    const nextPost = {
      ...existing,
      replies: [...existing.replies, reply].slice(-40),
    };
    const others = state.forumPosts.filter((post) => post.slug !== slug);
    return {
      ...state,
      forumPosts: [nextPost, ...others].slice(0, 40),
    };
  });
  redirect(`/forum/${slug}?ok=replied`);
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

export async function startCoinCheckout(formData: FormData) {
  const session = await campusAuthed();
  const packId = String(formData.get("packId") ?? "");
  const pack = coinPackFromId(packId);
  if (!pack) redirect("/pricing");
  (await cookies()).set(COIN_PENDING_COOKIE, pack.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 2,
  });
  redirect(coinCheckoutUrl(pack, session.email, session.userId));
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

/** Credit free coins once per UTC day when the student opens campus. */
export async function claimDailyLogin() {
  await campusAuthed();
  const today = utcToday();
  const current = await getState();
  if (current.lastLoginDate === today) return { credited: false, coins: 0, streak: current.loginStreakCount ?? 0 };

  const streak = nextLoginStreak(current, today);
  const milestone = loginBonusForStreak(streak);
  const credited = LOGIN_COIN + milestone;

  await mutateState((state) => {
    if (state.lastLoginDate === today) return state;
    const next = {
      ...state,
      coins: state.coins + credited,
      loginStreakCount: streak,
      lastLoginDate: today,
    };
    const body =
      milestone > 0
        ? `Day ${streak} login · +${LOGIN_COIN} daily + ${milestone} streak bonus.`
        : `Day ${streak} login · +${LOGIN_COIN} coin. Hit 7 / 14 / 21 / 30 for bonuses.`;
    return notify(next, "Daily login", body, "/campus");
  });
  revalidatePath("/campus");
  revalidatePath("/profile");
  return { credited: true, coins: credited, streak };
}

export async function updateProfile(formData: FormData) {
  const session = await campusAuthed();
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "");
  const bio = String(formData.get("bio") ?? "");
  const listed = formData.get("listed") === "on";
  await mutateState((state) => ({
    ...state,
    profile: {
      name: name || state.profile.name,
      phone,
      bio,
    },
  }));
  try {
    await upsertDirectoryProfile({
      userId: session.userId,
      name: name || session.name,
      bio,
      listed,
    });
  } catch {
    /* profiles table may not exist yet */
  }
  revalidatePath("/directory");
  revalidatePath("/messages");
  redirect("/profile?ok=1");
}

export async function sendMessage(formData: FormData) {
  const session = await campusAuthed();
  const body = String(formData.get("body") ?? "").trim();
  const toId = String(formData.get("toId") ?? "").trim();
  if (body.length < 8 || !toId) redirect("/messages?error=invalid");
  if (toId === session.userId) redirect("/messages?error=invalid");

  const courses = await getLiveCourses();
  const current = await getState();
  const contact =
    findContact(toId, courses, session.userId) ?? (await findDirectoryContact(toId, session.userId));
  if (!contact) redirect("/messages?error=missing");

  const courseId = contact.courseId ?? courseIdFromMentor(toId);
  if (contact.kind === "mentor" && courseId && !current.enrollments.includes(courseId) && session.role !== "admin") {
    redirect(`/messages/${toId}?error=enroll`);
  }

  const cost = contact.kind === "peer" && session.role !== "admin" ? PEER_MESSAGE_COST : 0;
  if (cost > 0 && current.coins < cost) redirect(`/messages/${toId}?error=coins`);

  const now = new Date().toISOString();
  const outbound: Message = {
    id: `msg-${Date.now()}`,
    fromId: session.userId,
    fromName: session.name,
    toId: contact.id,
    toName: contact.name,
    kind: contact.kind,
    courseId,
    coinsSpent: cost,
    body,
    createdAt: now,
  };
  const ack: Message | null =
    contact.kind === "mentor"
      ? {
          id: `msg-${Date.now()}-ack`,
          fromId: contact.id,
          fromName: contact.name,
          toId: session.userId,
          toName: session.name,
          kind: "mentor",
          courseId,
          coinsSpent: 0,
          body: courseId
            ? "Noted on this desk. Keep shipping. I will mark anything that is still a hobby."
            : "Noted. Faculty reads the campus thread. Bring a metric next time, not a mood.",
          createdAt: new Date(Date.now() + 1000).toISOString(),
        }
      : null;

  await mutateState((state) => {
    if (cost > 0 && state.coins < cost) return state;
    const next = {
      ...state,
      coins: state.coins - cost,
      messages: [outbound, ...(ack ? [ack] : []), ...state.messages].slice(0, 80),
    };
    if (cost <= 0) return next;
    return notify(next, "Message sent", `${cost} coins for a student thread with ${contact.name}.`, `/messages/${contact.id}`);
  });
  try {
    await persistRemoteMessage(outbound);
    if (ack) await persistRemoteMessage(ack);
  } catch {
    /* cookie ledger still holds the thread */
  }
  revalidatePath("/messages");
  revalidatePath(`/messages/${contact.id}`);
  redirect(`/messages/${contact.id}?ok=sent`);
}

export async function markNotification(id: string) {
  await campusAuthed();
  await mutateState((state) => ({
    ...state,
    notifications: state.notifications.map((item) => (item.id === id ? { ...item, read: true } : item)),
  }));
  revalidatePath("/notifications");
}
