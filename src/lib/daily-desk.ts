import { jobs, seedForum } from "@/lib/catalog";
import type { CampusState, Course, DeskPin, ForumPost, FounderNote, JobPost } from "@/lib/types";

export const DESK_COIN = 0.5;

/** Default pinned Master Tenet — editable from admin Content. */
export const DEFAULT_DESK_PIN: DeskPin = {
  title: "The iManifest Master Tenet",
  body: "I affirm that by adopting a growth mindset, aligning my thoughts with my desires, taking consistent action, and embracing failure as a necessary stepping-stone to success, I am able to manifest abundance and effortlessly achieve my goals in all areas of my life.",
  attribution: "Steven Zee",
};

/** Rotating Daily Notes from the Founder when no overlay notes are set. */
export const DEFAULT_FOUNDER_NOTES: FounderNote[] = [
  {
    id: "fn-1",
    title: "Daily Note · Surplus first",
    body: "Before you open a new method, name the surplus you already produce. If you cannot measure it, you are collecting hobbies.",
  },
  {
    id: "fn-2",
    title: "Daily Note · Failure is tuition",
    body: "A failed offer that taught you the buyer is cheaper than a ‘successful’ offer that taught you nothing. Log the lesson. Keep the streak.",
  },
  {
    id: "fn-3",
    title: "Daily Note · Align then act",
    body: "Thought without action is fantasy. Action without alignment is thrash. Today: one aligned move that a stranger could pay for.",
  },
  {
    id: "fn-4",
    title: "Daily Note · Growth mindset",
    body: "Skill compounds. Mood does not. Ask what the desk needs from you this week — not what you feel like doing.",
  },
];

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

export function utcMonth(): string {
  return new Date().toISOString().slice(0, 7);
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
  pin: DeskPin;
  founderNote: FounderNote;
  clip: { title: string; href: string; duration: string; courseTitle: string };
  job: { title: string; href: string; company: string };
  forum: { title: string; href: string; line: string };
};

export function buildDailyDesk(
  date: string,
  courses: Course[],
  enrolledIds: string[],
  extraPosts: ForumPost[] = [],
  pin: DeskPin = DEFAULT_DESK_PIN,
  founderNotes: FounderNote[] = DEFAULT_FOUNDER_NOTES,
): DailyDeskContent {
  const enrolled = courses.filter((course) => enrolledIds.includes(course.id) && course.status === "active");
  const pool = enrolled.length ? enrolled : courses.filter((course) => course.status === "active");
  const course = pick(pool.length ? pool : courses, date, 1);
  const lesson = course?.modules[0]?.lessons[0];
  const openJobs = jobs.filter((job) => job.status === "open");
  const job: JobPost = pick(openJobs.length ? openJobs : jobs, date, 2);
  const posts = [...extraPosts, ...seedForum];
  const post = pick(posts, date, 3);
  const notes = founderNotes.length ? founderNotes : DEFAULT_FOUNDER_NOTES;

  return {
    date,
    prompt: pick(prompts, date, 0),
    pin: pin.title.trim() ? pin : DEFAULT_DESK_PIN,
    founderNote: pick(notes, date, 4),
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
