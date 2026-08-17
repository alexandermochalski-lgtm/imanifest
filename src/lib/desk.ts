import { books, bundles, coinPacks, courses, jobs, promoCodes, seedForum, seedJournals } from "@/lib/catalog";
import { getAdminOverlay } from "@/lib/admin-state";
import { getLiveCourses } from "@/lib/live-catalog";
import {
  inLastDays,
  opsUsers,
  seedApplications,
  seedEnrollments,
  seedPayments,
  seedRegistrations,
} from "@/lib/ops";
import { getState } from "@/lib/state";
import { getSession } from "@/lib/session";
import type { EnrollmentRecord, JobApplication, OpsUser, Payment, Registration } from "@/lib/types";

export type DeskSnapshot = {
  users: OpsUser[];
  registrations: Registration[];
  payments: Payment[];
  enrollments: EnrollmentRecord[];
  applications: JobApplication[];
  notes: Record<string, string>;
  promos: Array<{ code: string; discountPct: number; active: boolean; redemptions: number; leakageUsd: number }>;
  kpis: {
    users: number;
    activeUsers: number;
    newUsers7d: number;
    newUsers30d: number;
    registrations7d: number;
    abandoned7d: number;
    conversion: number;
    cardRevenue: number;
    cardRevenue30d: number;
    refunds: number;
    failed: number;
    pendingCash: number;
    coinsOutstanding: number;
    courseGmvCoins: number;
    enrollments: number;
    enrollments30d: number;
    completions: number;
    openJobs: number;
    applicationsOpen: number;
    hired: number;
  };
  weeklyCard: number[];
  topCourses: Array<{ id: string; title: string; enrollments: number; coins: number; completion: number }>;
  recentPayments: Payment[];
  recentRegistrations: Registration[];
  alerts: string[];
};

function mergeUsers(overlay: Awaited<ReturnType<typeof getAdminOverlay>>): OpsUser[] {
  return opsUsers.map((user) => ({
    ...user,
    status: overlay.userStatus[user.id] ?? user.status,
  }));
}

function mergePayments(overlay: Awaited<ReturnType<typeof getAdminOverlay>>): Payment[] {
  const live = overlay.livePayments ?? [];
  const seen = new Set(live.map((item) => item.id));
  return [...live, ...seedPayments.filter((item) => !seen.has(item.id))].sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : -1,
  );
}

function mergeApplications(
  overlay: Awaited<ReturnType<typeof getAdminOverlay>>,
  live: JobApplication[],
): JobApplication[] {
  const byId = new Map<string, JobApplication>();
  for (const item of [...seedApplications, ...live]) {
    byId.set(item.id, {
      ...item,
      status: overlay.applicationStatus[item.id] ?? item.status,
    });
  }
  return [...byId.values()].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

function mergeEnrollments(
  userId: string | undefined,
  liveCourseIds: string[],
  priceByCourse: Map<string, number>,
): EnrollmentRecord[] {
  if (!userId) return seedEnrollments;
  const extra = liveCourseIds
    .filter((courseId) => !seedEnrollments.some((item) => item.userId === userId && item.courseId === courseId))
    .map((courseId) => ({
      id: `en-live-${userId}-${courseId}`,
      userId,
      courseId,
      enrolledAt: new Date().toISOString().slice(0, 10),
      progress: 0,
      coinsSpent: priceByCourse.get(courseId) ?? courses.find((item) => item.id === courseId)?.price ?? 0,
    }));
  return [...extra, ...seedEnrollments];
}

function weekBuckets(payments: Payment[]): number[] {
  const buckets = Array.from({ length: 8 }, () => 0);
  for (const payment of payments) {
    if (payment.kind !== "coins" || payment.status !== "paid") continue;
    const ago = Math.floor(
      (new Date("2026-08-17T12:00:00Z").getTime() - new Date(`${payment.createdAt}T00:00:00Z`).getTime()) / 86_400_000,
    );
    const week = Math.min(7, Math.floor(ago / 7));
    buckets[7 - week] += payment.amountUsd;
  }
  return buckets;
}

export async function getDesk(): Promise<DeskSnapshot> {
  const [overlay, campus, session, liveCourses] = await Promise.all([
    getAdminOverlay(),
    getState(),
    getSession(),
    getLiveCourses(),
  ]);
  const users = mergeUsers(overlay);
  const payments = mergePayments(overlay);
  const applications = mergeApplications(overlay, campus.applications);
  const enrollments = mergeEnrollments(
    session?.userId,
    campus.enrollments,
    new Map(liveCourses.map((course) => [course.id, course.price])),
  );
  const registrations = seedRegistrations;

  const paidCard = payments.filter((item) => item.kind === "coins" && item.status === "paid");
  const cardRevenue = paidCard.reduce((sum, item) => sum + item.amountUsd, 0);
  const cardRevenue30d = paidCard.filter((item) => inLastDays(item.createdAt, 30)).reduce((sum, item) => sum + item.amountUsd, 0);
  const refunds = payments.filter((item) => item.status === "refunded").reduce((sum, item) => sum + item.amountUsd, 0);
  const completedRegs = registrations.filter((item) => item.status !== "abandoned");
  const conversion = registrations.length === 0 ? 0 : Math.round((completedRegs.length / registrations.length) * 100);
  const completions = enrollments.filter((item) => item.progress >= 100).length;
  const courseSpend = payments.filter((item) => item.kind !== "coins" && item.status === "paid");

  const topMap = new Map<string, { enrollments: number; coins: number; done: number }>();
  for (const row of enrollments) {
    const current = topMap.get(row.courseId) ?? { enrollments: 0, coins: 0, done: 0 };
    current.enrollments += 1;
    current.coins += row.coinsSpent;
    if (row.progress >= 100) current.done += 1;
    topMap.set(row.courseId, current);
  }
  const topCourses = [...topMap.entries()]
    .map(([id, stats]) => ({
      id,
      title: liveCourses.find((course) => course.id === id)?.title ?? id,
      enrollments: stats.enrollments,
      coins: stats.coins,
      completion: stats.enrollments === 0 ? 0 : Math.round((stats.done / stats.enrollments) * 100),
    }))
    .sort((a, b) => b.enrollments - a.enrollments)
    .slice(0, 6);

  const promos = promoCodes.map((promo) => {
    const active = overlay.promoActive[promo.code] ?? promo.active;
    const hits = paidCard.filter((item) => item.promo === promo.code);
    const packBySku = new Map(coinPacks.map((pack) => [pack.id, pack.price]));
    const leakageUsd = hits.reduce((sum, item) => sum + Math.max(0, (packBySku.get(item.sku) ?? item.amountUsd) - item.amountUsd), 0);
    return { ...promo, active, redemptions: hits.length, leakageUsd };
  });

  const alerts: string[] = [];
  const pendingUsers = users.filter((user) => user.status === "pending").length;
  const openApps = applications.filter((item) => item.status === "submitted" || item.status === "reviewing").length;
  const failed = payments.filter((item) => item.status === "failed").length;
  const pendingCash = payments.filter((item) => item.status === "pending").reduce((sum, item) => sum + item.amountUsd, 0);
  const abandoned7d = registrations.filter((item) => item.status === "abandoned" && inLastDays(item.createdAt, 7)).length;
  if (pendingUsers) alerts.push(`${pendingUsers} account${pendingUsers === 1 ? "" : "s"} waiting on verification.`);
  if (openApps) alerts.push(`${openApps} job application${openApps === 1 ? "" : "s"} in the hiring pipeline.`);
  if (failed) alerts.push(`${failed} failed card capture${failed === 1 ? "" : "s"} on the coin desk.`);
  if (pendingCash) alerts.push(`${pendingCash.toFixed(0)} USD in pending coin checkouts.`);
  if (abandoned7d) alerts.push(`${abandoned7d} registration${abandoned7d === 1 ? "" : "s"} abandoned in the last 7 days.`);

  return {
    users,
    registrations,
    payments,
    enrollments,
    applications,
    notes: overlay.notes,
    promos,
    kpis: {
      users: users.length,
      activeUsers: users.filter((user) => user.status === "active").length,
      newUsers7d: users.filter((user) => inLastDays(user.registeredAt, 7)).length,
      newUsers30d: users.filter((user) => inLastDays(user.registeredAt, 30)).length,
      registrations7d: registrations.filter((item) => inLastDays(item.createdAt, 7)).length,
      abandoned7d,
      conversion,
      cardRevenue,
      cardRevenue30d,
      refunds,
      failed,
      pendingCash,
      coinsOutstanding: users.reduce((sum, user) => sum + user.coins, 0),
      courseGmvCoins: Math.abs(courseSpend.reduce((sum, item) => sum + item.coins, 0)),
      enrollments: enrollments.length,
      enrollments30d: enrollments.filter((item) => inLastDays(item.enrolledAt, 30)).length,
      completions,
      openJobs: jobs.filter((job) => job.status === "open").length,
      applicationsOpen: openApps,
      hired: applications.filter((item) => item.status === "hired").length,
    },
    weeklyCard: weekBuckets(payments),
    topCourses,
    recentPayments: payments.slice(0, 8),
    recentRegistrations: [...registrations].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, 8),
    alerts,
  };
}

export const catalogCounts = {
  courses: courses.length,
  books: books.length,
  bundles: bundles.length,
  jobs: jobs.length,
  forum: seedForum.length,
  journals: seedJournals.length,
};
