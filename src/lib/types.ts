export type Role = "student" | "admin";

export type CategorySlug =
  | "personal-development"
  | "wealth-creation"
  | "investing"
  | "marketing"
  | "e-commerce"
  | "health-wellness"
  | "fitness-nutrition"
  | "social-media";

export type User = {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  role: Role;
  bio: string;
  avatarLabel: string;
};

export type LessonKind = "video" | "audio" | "reading" | "pdf";

export type Lesson = {
  id: string;
  title: string;
  kind: LessonKind;
  duration: string;
  body: string;
  mediaUrl?: string;
  mediaId?: string;
};

export type Question = {
  id: string;
  prompt: string;
  options: string[];
  answerIndex: number;
  marks: number;
};

export type Quiz = {
  id: string;
  title: string;
  passMark: number;
  questions: Question[];
};

export type Module = {
  id: string;
  title: string;
  lessons: Lesson[];
  quiz: Quiz;
};

export type Course = {
  id: string;
  slug: string;
  title: string;
  faculty: string;
  category: CategorySlug;
  duration: string;
  level: "Foundation" | "Practitioner" | "Mastery";
  price: number;
  summary: string;
  modules: Module[];
  status: "active" | "hidden";
  coverUrl?: string;
};

export type Book = {
  id: string;
  slug: string;
  title: string;
  author: string;
  category: CategorySlug;
  pages: number;
  summary: string;
  price: number;
  fileUrl?: string;
  coverUrl?: string;
};

export type MediaKind = "video" | "audio" | "pdf" | "image" | "other";

export type MediaAsset = {
  id: string;
  title: string;
  kind: MediaKind;
  contentType: string;
  size: number;
  url: string;
  pathname: string;
  createdAt: string;
};

export type CatalogOverlay = {
  courses: Course[];
  books: Book[];
  media: MediaAsset[];
};

export type Guide = {
  id: string;
  slug: string;
  title: string;
  tag: string;
  summary: string;
  body: string;
};

export type Journal = {
  id: string;
  slug: string;
  title: string;
  authorId: string;
  authorName: string;
  type: "public" | "private";
  excerpt: string;
  body: string;
  createdAt: string;
};

export type ForumPost = {
  id: string;
  slug: string;
  title: string;
  category: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string;
  replies: ForumReply[];
};

export type ForumReply = {
  id: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string;
};

export type JobPost = {
  id: string;
  slug: string;
  title: string;
  company: string;
  location: string;
  type: "Remote" | "Hybrid" | "On-site";
  salary: string;
  facilities: string[];
  summary: string;
  body: string;
  status: "open" | "closed";
};

export type Bundle = {
  id: string;
  slug: string;
  title: string;
  price: number;
  summary: string;
  courseIds: string[];
  bookIds: string[];
};

export type CoinPack = {
  id: string;
  name: string;
  coins: number;
  price: number;
  bonus: number;
  savePct: number;
};

export type MembershipPackage = {
  id: string;
  name: string;
  price: number;
  listPrice?: number;
  duration: string;
  featured?: boolean;
  features: string[];
  href: string;
};

export type PromoCode = {
  code: string;
  discountPct: number;
  active: boolean;
};

export type Insight = {
  id: string;
  slug: string;
  title: string;
  kicker: string;
  body: string;
};

export type DynamicPage = {
  slug: string;
  title: string;
  body: string;
};

export type Message = {
  id: string;
  fromId: string;
  fromName: string;
  body: string;
  createdAt: string;
};

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  read: boolean;
  href: string;
  createdAt: string;
};

export type JobApplication = {
  id: string;
  jobId: string;
  userId: string;
  note: string;
  status: "submitted" | "reviewing" | "rejected" | "hired";
  createdAt: string;
};

export type QuizResult = {
  quizId: string;
  courseId: string;
  moduleId: string;
  score: number;
  passed: boolean;
};

export type CampusState = {
  coins: number;
  enrollments: string[];
  completedModules: string[];
  quizResults: QuizResult[];
  favoriteBooks: string[];
  favoriteJobs: string[];
  favoriteJournals: string[];
  favoriteBundles: string[];
  likedForum: string[];
  applications: JobApplication[];
  journals: Journal[];
  forumPosts: ForumPost[];
  messages: Message[];
  notifications: NotificationItem[];
  streakCount: number;
  lastDeskDate: string;
  profile: {
    name: string;
    phone: string;
    bio: string;
  };
};

export type AccountStatus = "active" | "suspended" | "pending";
export type AcquisitionSource = "organic" | "referral" | "promo" | "direct" | "job-board";
export type PaymentKind = "coins" | "course" | "bundle";
export type PaymentStatus = "paid" | "refunded" | "failed" | "pending";
export type RegistrationStatus = "completed" | "abandoned" | "verified";

export type OpsUser = User & {
  status: AccountStatus;
  registeredAt: string;
  lastSeenAt: string;
  coins: number;
  courseIds: string[];
  country: string;
  source: AcquisitionSource;
};

export type Registration = {
  id: string;
  userId: string | null;
  email: string;
  name: string;
  createdAt: string;
  source: AcquisitionSource;
  status: RegistrationStatus;
};

export type Payment = {
  id: string;
  userId: string;
  kind: PaymentKind;
  sku: string;
  label: string;
  amountUsd: number;
  coins: number;
  promo?: string;
  status: PaymentStatus;
  createdAt: string;
};

export type EnrollmentRecord = {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  progress: number;
  coinsSpent: number;
};

export type AdminOverlay = {
  userStatus: Record<string, AccountStatus>;
  applicationStatus: Record<string, JobApplication["status"]>;
  promoActive: Record<string, boolean>;
  notes: Record<string, string>;
  livePayments: Payment[];
};
