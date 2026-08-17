import { jobs, seedForum } from "@/lib/catalog";
import type { CampusState, Course, ForumPost, JobPost } from "@/lib/types";

export const DESK_COIN = 0.5;

const prompts = [
  "Name one outflow you will kill this week. Be specific.",
  "What is the unit of the method you are running — buyer, pain, price?",
  "Where did surplus leak yesterday? One line.",
  "If this offer cannot name a buyer in one breath, what do you cut?",
  "What is the one metric that proves you worked today?",
  "Which position or project is a second personality, not ballast?",
  "Write the kill-criteria for the thing you are most attached to.",
  "What did you ship that a stranger could pay for?",
  "Where did you trade process for mood?",
  "Name the concentrated bet you already have. Size the rest around it.",
  "What would a partner decline if they saw your trail this week?",
  "One sentence: what is still a hobby on your desk?",
  "What did you refuse today that used to get a meeting?",
  "If surplus is the product, what did you produce since yesterday?",
];

export function utcToday(): string {
  return new Date().toISOString().slice(0, 10);
}

export function utcYesterday(): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

export function formatCoins(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function liveStreak(state: CampusState): number {
  const last = state.lastDeskDate;
  if (last === utcToday() || last === utcYesterday()) return state.streakCount;
  return 0;
}

export function deskClosedToday(state: CampusState): boolean {
  return state.lastDeskDate === utcToday();
}

export function nextStreak(state: CampusState, today = utcToday()): number {
  if (state.lastDeskDate === utcYesterday()) return state.streakCount + 1;
  if (state.lastDeskDate === today) return state.streakCount;
  return 1;
}

function dayIndex(date: string): number {
  return Math.floor(Date.parse(`${date}T00:00:00Z`) / 86_400_000);
}

function pick<T>(items: T[], date: string, salt: number): T {
  return items[Math.abs(dayIndex(date) + salt) % items.length];
}

export type DailyDeskContent = {
  date: string;
  prompt: string;
  clip: { title: string; href: string; duration: string; courseTitle: string };
  job: { title: string; href: string; company: string };
  forum: { title: string; href: string; line: string };
};

export function buildDailyDesk(
  date: string,
  courses: Course[],
  enrolledIds: string[],
  extraPosts: ForumPost[] = [],
): DailyDeskContent {
  const enrolled = courses.filter((course) => enrolledIds.includes(course.id) && course.status === "active");
  const pool = enrolled.length ? enrolled : courses.filter((course) => course.status === "active");
  const course = pick(pool.length ? pool : courses, date, 1);
  const lesson = course?.modules[0]?.lessons[0];
  const openJobs = jobs.filter((job) => job.status === "open");
  const job: JobPost = pick(openJobs.length ? openJobs : jobs, date, 2);
  const posts = [...extraPosts, ...seedForum];
  const post = pick(posts, date, 3);

  return {
    date,
    prompt: pick(prompts, date, 0),
    clip: {
      title: lesson?.title ?? "Open a lesson",
      href: course ? `/courses/${course.slug}` : "/courses",
      duration: lesson?.duration ?? "10 min",
      courseTitle: course?.title ?? "Campus catalog",
    },
    job: {
      title: job.title,
      href: `/jobs/${job.slug}`,
      company: job.company,
    },
    forum: {
      title: post.title,
      href: `/forum/${post.slug}`,
      line: post.body.slice(0, 140),
    },
  };
}
