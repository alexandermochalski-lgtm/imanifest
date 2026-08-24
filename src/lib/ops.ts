import { coinPacks, courses, jobs } from "@/lib/catalog";
import type {
  AccountStatus,
  AcquisitionSource,
  EnrollmentRecord,
  JobApplication,
  OpsUser,
  Payment,
  Registration,
} from "@/lib/types";

const DESK_TODAY = new Date("2026-08-17T12:00:00.000Z");

export function daysAgo(n: number): string {
  const date = new Date(DESK_TODAY);
  date.setUTCDate(date.getUTCDate() - n);
  return date.toISOString().slice(0, 10);
}

export function usd(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

export function formatDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`);
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function student(spec: {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  registeredAt: string;
  lastSeenAt: string;
  coins: number;
  courseIds: string[];
  country: string;
  source: AcquisitionSource;
  status?: AccountStatus;
  bio?: string;
  role?: OpsUser["role"];
}): OpsUser {
  return {
    ...spec,
    role: spec.role ?? "student",
    status: spec.status ?? "active",
    bio: spec.bio ?? "Campus operator in residence.",
    avatarLabel: initials(spec.name),
  };
}

export const opsUsers: OpsUser[] = [
  student({
    id: "u-admin",
    name: "iMU Registrar",
    username: "registrar",
    email: "admin@imanifest.money",
    phone: "+1 415 010 0101",
    role: "admin",
    registeredAt: daysAgo(420),
    lastSeenAt: daysAgo(0),
    coins: 5000,
    courseIds: ["c-mindset", "c-wealth"],
    country: "United States",
    source: "direct",
    bio: "Campus operations and faculty coordination.",
  }),
  student({
    id: "u-faculty",
    name: "Dean Okonkwo",
    username: "dean",
    email: "dean@imanifest.money",
    phone: "+1 415 030 0303",
    role: "admin",
    registeredAt: daysAgo(390),
    lastSeenAt: daysAgo(1),
    coins: 2400,
    courseIds: ["c-private", "c-quant", "c-wealth"],
    country: "United Kingdom",
    source: "direct",
    bio: "Faculty lead, markets and operator mindset.",
  }),
  student({
    id: "u-steve",
    name: "Steve Zee",
    username: "steve",
    email: "steve@imanifest.money",
    phone: "",
    role: "admin",
    registeredAt: daysAgo(500),
    lastSeenAt: daysAgo(0),
    coins: 9999,
    courseIds: ["c-mindset", "c-wealth"],
    country: "Singapore",
    source: "direct",
    bio: "Founder desk — content, daily notes, and campus direction.",
  }),
  student({
    id: "u-student",
    name: "Alex Operator",
    username: "alex",
    email: "student@imanifest.money",
    phone: "+1 415 020 0202",
    registeredAt: daysAgo(86),
    lastSeenAt: daysAgo(0),
    coins: 500,
    courseIds: ["c-mindset", "c-wealth", "c-career"],
    country: "United States",
    source: "organic",
    bio: "Building a personal capital stack through iMU.",
  }),
  student({
    id: "u-04",
    name: "Mara Chen",
    username: "mara",
    email: "mara.chen@example.com",
    phone: "+44 20 7946 0111",
    registeredAt: daysAgo(74),
    lastSeenAt: daysAgo(2),
    coins: 860,
    courseIds: ["c-mindset", "c-engines", "c-offer-copy"],
    country: "United Kingdom",
    source: "promo",
  }),
  student({
    id: "u-05",
    name: "Jonas Hale",
    username: "jonas",
    email: "jonas.hale@example.com",
    phone: "+1 312 555 0198",
    registeredAt: daysAgo(61),
    lastSeenAt: daysAgo(1),
    coins: 120,
    courseIds: ["c-wealth", "c-private", "c-quant"],
    country: "United States",
    source: "referral",
  }),
  student({
    id: "u-06",
    name: "Priya Shah",
    username: "priya",
    email: "priya.shah@example.com",
    phone: "+971 4 555 2201",
    registeredAt: daysAgo(55),
    lastSeenAt: daysAgo(4),
    coins: 1540,
    courseIds: ["c-ecommerce-machine", "c-marketplace", "c-email-list"],
    country: "United Arab Emirates",
    source: "organic",
  }),
  student({
    id: "u-07",
    name: "Luca Rossi",
    username: "luca",
    email: "luca.rossi@example.com",
    phone: "+39 02 555 4410",
    registeredAt: daysAgo(49),
    lastSeenAt: daysAgo(8),
    coins: 40,
    courseIds: ["c-mindset"],
    country: "Italy",
    source: "direct",
    status: "pending",
  }),
  student({
    id: "u-08",
    name: "Amara Diallo",
    username: "amara",
    email: "amara.diallo@example.com",
    phone: "+33 1 555 8821",
    registeredAt: daysAgo(44),
    lastSeenAt: daysAgo(3),
    coins: 610,
    courseIds: ["c-career", "c-personal-finance", "c-credit-matrix"],
    country: "France",
    source: "job-board",
  }),
  student({
    id: "u-09",
    name: "Noah Berg",
    username: "noah",
    email: "noah.berg@example.com",
    phone: "+46 8 555 0190",
    registeredAt: daysAgo(41),
    lastSeenAt: daysAgo(12),
    coins: 0,
    courseIds: ["c-short-form", "c-social-pipe"],
    country: "Sweden",
    source: "promo",
    status: "suspended",
  }),
  student({
    id: "u-10",
    name: "Elena Voss",
    username: "elena",
    email: "elena.voss@example.com",
    phone: "+49 30 555 7730",
    registeredAt: daysAgo(36),
    lastSeenAt: daysAgo(1),
    coins: 980,
    courseIds: ["c-private", "c-real-estate-cash", "c-wealth"],
    country: "Germany",
    source: "referral",
  }),
  student({
    id: "u-11",
    name: "Diego Alvarez",
    username: "diego",
    email: "diego.alvarez@example.com",
    phone: "+52 55 555 3312",
    registeredAt: daysAgo(33),
    lastSeenAt: daysAgo(0),
    coins: 275,
    courseIds: ["c-youtube-engine", "c-affiliate-desk"],
    country: "Mexico",
    source: "organic",
  }),
  student({
    id: "u-12",
    name: "Sofia Park",
    username: "sofia",
    email: "sofia.park@example.com",
    phone: "+82 2 555 1188",
    registeredAt: daysAgo(29),
    lastSeenAt: daysAgo(5),
    coins: 1320,
    courseIds: ["c-fitness-offers", "c-nutrition-engine", "c-high-ticket-health"],
    country: "South Korea",
    source: "promo",
  }),
  student({
    id: "u-13",
    name: "Owen Blake",
    username: "owen",
    email: "owen.blake@example.com",
    phone: "+1 646 555 0144",
    registeredAt: daysAgo(26),
    lastSeenAt: daysAgo(2),
    coins: 190,
    courseIds: ["c-mindset", "c-engines"],
    country: "United States",
    source: "direct",
  }),
  student({
    id: "u-14",
    name: "Hana Ito",
    username: "hana",
    email: "hana.ito@example.com",
    phone: "+81 3 555 2290",
    registeredAt: daysAgo(22),
    lastSeenAt: daysAgo(6),
    coins: 440,
    courseIds: ["c-wellness-practice", "c-offer-copy"],
    country: "Japan",
    source: "organic",
  }),
  student({
    id: "u-15",
    name: "James Okeke",
    username: "james",
    email: "james.okeke@example.com",
    phone: "+234 1 555 6701",
    registeredAt: daysAgo(19),
    lastSeenAt: daysAgo(1),
    coins: 720,
    courseIds: ["c-wealth", "c-career", "c-personal-finance"],
    country: "Nigeria",
    source: "referral",
  }),
  student({
    id: "u-16",
    name: "Clara Nunez",
    username: "clara",
    email: "clara.nunez@example.com",
    phone: "+34 91 555 4402",
    registeredAt: daysAgo(16),
    lastSeenAt: daysAgo(3),
    coins: 55,
    courseIds: ["c-mindset", "c-social-pipe"],
    country: "Spain",
    source: "organic",
  }),
  student({
    id: "u-17",
    name: "Theo March",
    username: "theo",
    email: "theo.march@example.com",
    phone: "+61 2 555 9088",
    registeredAt: daysAgo(14),
    lastSeenAt: daysAgo(0),
    coins: 1100,
    courseIds: ["c-quant", "c-engines", "c-marketplace"],
    country: "Australia",
    source: "promo",
  }),
  student({
    id: "u-18",
    name: "Leila Haddad",
    username: "leila",
    email: "leila.haddad@example.com",
    phone: "+961 1 555 2204",
    registeredAt: daysAgo(11),
    lastSeenAt: daysAgo(4),
    coins: 310,
    courseIds: ["c-email-list", "c-affiliate-desk", "c-offer-copy"],
    country: "Lebanon",
    source: "job-board",
  }),
  student({
    id: "u-19",
    name: "Marcus Quinn",
    username: "marcus",
    email: "marcus.quinn@example.com",
    phone: "+1 917 555 6620",
    registeredAt: daysAgo(9),
    lastSeenAt: daysAgo(1),
    coins: 205,
    courseIds: ["c-private", "c-career"],
    country: "United States",
    source: "direct",
  }),
  student({
    id: "u-20",
    name: "Ines Moreau",
    username: "ines",
    email: "ines.moreau@example.com",
    phone: "+33 1 555 1180",
    registeredAt: daysAgo(7),
    lastSeenAt: daysAgo(2),
    coins: 80,
    courseIds: ["c-mindset"],
    country: "France",
    source: "organic",
  }),
  student({
    id: "u-21",
    name: "Ravi Mehta",
    username: "ravi",
    email: "ravi.mehta@example.com",
    phone: "+91 22 555 4419",
    registeredAt: daysAgo(5),
    lastSeenAt: daysAgo(0),
    coins: 640,
    courseIds: ["c-ecommerce-machine", "c-youtube-engine"],
    country: "India",
    source: "promo",
  }),
  student({
    id: "u-22",
    name: "Greta Lind",
    username: "greta",
    email: "greta.lind@example.com",
    phone: "+47 21 555 0091",
    registeredAt: daysAgo(3),
    lastSeenAt: daysAgo(1),
    coins: 400,
    courseIds: ["c-wealth", "c-credit-matrix"],
    country: "Norway",
    source: "referral",
  }),
  student({
    id: "u-23",
    name: "Samir Khan",
    username: "samir",
    email: "samir.khan@example.com",
    phone: "+971 50 555 7733",
    registeredAt: daysAgo(2),
    lastSeenAt: daysAgo(0),
    coins: 100,
    courseIds: ["c-mindset", "c-personal-finance"],
    country: "United Arab Emirates",
    source: "organic",
  }),
  student({
    id: "u-24",
    name: "Willow Grant",
    username: "willow",
    email: "willow.grant@example.com",
    phone: "+1 415 555 2288",
    registeredAt: daysAgo(1),
    lastSeenAt: daysAgo(0),
    coins: 0,
    courseIds: [],
    country: "United States",
    source: "direct",
    status: "pending",
  }),
];

const abandoned: Array<[string, string, string, AcquisitionSource, number]> = [
  ["reg-a1", "Kai Brooks", "kai.brooks@example.com", "organic", 28],
  ["reg-a2", "Nina Patel", "nina.patel@example.com", "promo", 21],
  ["reg-a3", "Omar Farouk", "omar.farouk@example.com", "direct", 18],
  ["reg-a4", "Riley Cole", "riley.cole@example.com", "job-board", 13],
  ["reg-a5", "Yara Santos", "yara.santos@example.com", "referral", 10],
  ["reg-a6", "Ben Adler", "ben.adler@example.com", "organic", 6],
  ["reg-a7", "Mei Lin", "mei.lin@example.com", "promo", 4],
  ["reg-a8", "Chris Doyle", "chris.doyle@example.com", "direct", 1],
];

export const seedRegistrations: Registration[] = [
  ...opsUsers.map((user) => ({
    id: `reg-${user.id}`,
    userId: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.registeredAt,
    source: user.source,
    status: (user.status === "pending" ? "completed" : "verified") as Registration["status"],
  })),
  ...abandoned.map(([id, name, email, source, ago]) => ({
    id,
    userId: null,
    email,
    name,
    createdAt: daysAgo(ago),
    source,
    status: "abandoned" as const,
  })),
];

function packPay(
  id: string,
  userId: string,
  packId: string,
  ago: number,
  promo?: string,
  status: Payment["status"] = "paid",
): Payment {
  const pack = coinPacks.find((item) => item.id === packId)!;
  let amountUsd = pack.price;
  if (promo === "IMU10") amountUsd = Math.round(amountUsd * 0.9);
  if (promo === "FOUNDERS") amountUsd = Math.round(amountUsd * 0.75);
  return {
    id,
    userId,
    kind: "coins",
    sku: packId,
    label: `${pack.name} pack`,
    amountUsd: status === "failed" ? pack.price : amountUsd,
    coins: pack.coins + pack.bonus,
    promo,
    status,
    createdAt: daysAgo(ago),
  };
}

function coursePay(id: string, userId: string, courseId: string, ago: number): Payment {
  const course = courses.find((item) => item.id === courseId)!;
  return {
    id,
    userId,
    kind: "course",
    sku: courseId,
    label: course.title,
    amountUsd: 0,
    coins: -course.price,
    status: "paid",
    createdAt: daysAgo(ago),
  };
}

function bundlePay(id: string, userId: string, sku: string, label: string, coins: number, ago: number): Payment {
  return {
    id,
    userId,
    kind: "bundle",
    sku,
    label,
    amountUsd: 0,
    coins: -coins,
    status: "paid",
    createdAt: daysAgo(ago),
  };
}

export const seedPayments: Payment[] = [
  packPay("pay-01", "u-student", "coin-operator", 80),
  packPay("pay-02", "u-04", "coin-desk", 70, "FOUNDERS"),
  packPay("pay-03", "u-05", "coin-desk", 58),
  packPay("pay-04", "u-06", "coin-desk", 52, "IMU10"),
  packPay("pay-05", "u-08", "coin-operator", 40),
  packPay("pay-06", "u-09", "coin-starter", 38),
  packPay("pay-07", "u-10", "coin-desk", 34),
  packPay("pay-08", "u-11", "coin-starter", 31),
  packPay("pay-09", "u-12", "coin-desk", 27, "FOUNDERS"),
  packPay("pay-10", "u-13", "coin-operator", 24),
  packPay("pay-11", "u-14", "coin-operator", 20),
  packPay("pay-12", "u-15", "coin-operator", 17, "IMU10"),
  packPay("pay-13", "u-17", "coin-desk", 12),
  packPay("pay-14", "u-18", "coin-starter", 10),
  packPay("pay-15", "u-19", "coin-operator", 8),
  packPay("pay-16", "u-21", "coin-operator", 4, "IMU10"),
  packPay("pay-17", "u-22", "coin-operator", 3),
  packPay("pay-18", "u-23", "coin-starter", 2),
  packPay("pay-19", "u-05", "coin-starter", 15, undefined, "refunded"),
  packPay("pay-20", "u-16", "coin-operator", 9, undefined, "failed"),
  packPay("pay-21", "u-24", "coin-starter", 1, undefined, "pending"),
  packPay("pay-22", "u-06", "coin-operator", 6),
  packPay("pay-23", "u-10", "coin-operator", 5),
  packPay("pay-24", "u-04", "coin-operator", 11),
  coursePay("pay-c1", "u-student", "c-wealth", 72),
  coursePay("pay-c2", "u-student", "c-career", 40),
  coursePay("pay-c3", "u-04", "c-engines", 62),
  coursePay("pay-c4", "u-04", "c-offer-copy", 48),
  coursePay("pay-c5", "u-05", "c-wealth", 50),
  coursePay("pay-c6", "u-05", "c-private", 42),
  coursePay("pay-c7", "u-05", "c-quant", 30),
  coursePay("pay-c8", "u-06", "c-ecommerce-machine", 44),
  coursePay("pay-c9", "u-06", "c-marketplace", 36),
  coursePay("pay-c10", "u-08", "c-career", 32),
  coursePay("pay-c11", "u-10", "c-private", 28),
  coursePay("pay-c12", "u-10", "c-real-estate-cash", 21),
  coursePay("pay-c13", "u-12", "c-high-ticket-health", 18),
  coursePay("pay-c14", "u-15", "c-wealth", 14),
  coursePay("pay-c15", "u-17", "c-quant", 9),
  coursePay("pay-c16", "u-19", "c-private", 7),
  coursePay("pay-c17", "u-21", "c-ecommerce-machine", 3),
  bundlePay("pay-b1", "u-04", "bun-operator", "Operator Stack", 260, 65),
  bundlePay("pay-b2", "u-05", "bun-markets", "Markets Desk", 380, 46),
  bundlePay("pay-b3", "u-17", "bun-markets", "Markets Desk", 380, 11),
];

export const seedEnrollments: EnrollmentRecord[] = opsUsers.flatMap((user) =>
  user.courseIds.map((courseId, index) => {
    const course = courses.find((item) => item.id === courseId);
    const enrolledAt = daysAgo(Math.max(0, Math.round((DESK_TODAY.getTime() - new Date(`${user.registeredAt}T00:00:00Z`).getTime()) / 86_400_000) - index * 6));
    const progress = courseId === "c-mindset" ? 100 : Math.min(100, (index + 1) * 28 + (user.id.charCodeAt(user.id.length - 1) % 20));
    return {
      id: `en-${user.id}-${courseId}`,
      userId: user.id,
      courseId,
      enrolledAt,
      progress,
      coinsSpent: course?.price ?? 0,
    };
  }),
);

export const seedApplications: JobApplication[] = [
  { id: "app-01", jobId: "job-analyst", userId: "u-05", note: "Private Markets complete. Two memos attached in journal.", status: "reviewing", createdAt: daysAgo(12) },
  { id: "app-02", jobId: "job-analyst", userId: "u-10", note: "Underwrote three sample deals. Kill-criteria first.", status: "submitted", createdAt: daysAgo(6) },
  { id: "app-03", jobId: "job-ops", userId: "u-08", note: "Career Capital + forum moderation hours.", status: "hired", createdAt: daysAgo(20) },
  { id: "app-04", jobId: "job-ops", userId: "u-13", note: "Ran a 12-person study group. Process notes in campus journal.", status: "reviewing", createdAt: daysAgo(9) },
  { id: "app-05", jobId: "job-growth", userId: "u-04", note: "Offer copy + engines. Channel tests documented.", status: "submitted", createdAt: daysAgo(5) },
  { id: "app-06", jobId: "job-growth", userId: "u-11", note: "YouTube engine live. Contribution tracked weekly.", status: "rejected", createdAt: daysAgo(16) },
  { id: "app-07", jobId: "job-analyst", userId: "u-19", note: "Career + Private Markets in progress. First memo this week.", status: "submitted", createdAt: daysAgo(3) },
  { id: "app-08", jobId: "job-ops", userId: "u-15", note: "Campus trail on wealth + career. Available remote.", status: "reviewing", createdAt: daysAgo(8) },
];

export function opsUserById(id: string) {
  return opsUsers.find((user) => user.id === id);
}

export function jobTitle(jobId: string) {
  return jobs.find((job) => job.id === jobId)?.title ?? jobId;
}

export function courseTitle(courseId: string) {
  return courses.find((course) => course.id === courseId)?.title ?? courseId;
}

export function inLastDays(iso: string, days: number) {
  const then = new Date(`${iso}T00:00:00Z`).getTime();
  const cutoff = DESK_TODAY.getTime() - days * 86_400_000;
  return then >= cutoff;
}
