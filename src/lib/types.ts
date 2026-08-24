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
  /** Extra category tags so a title can live in more than one desk. */
  tags?: CategorySlug[];
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

export type MemberRecord = {
  status: "active" | "canceled";
  paidAt: string;
  email: string;
  userId?: string;
};

export type DeskPin = {
  title: string;
  body: string;
  attribution?: string;
};

export type FounderNote = {
  id: string;
  title: string;
  body: string;
  imageUrl?: string;
};

export type Guide = {
  id: string;
  slug: string;
  title: string;
  /** Primary label shown on cards. */
  tag: string;
  /** Extra category tags for filtering (personal-development + wealth-creation, etc.). */
  tags?: string[];
  summary: string;
  body: string;
  series?: string;
  author?: string;
  coverUrl?: string;
};

export type CatalogOverlay = {
  courses: Course[];
  books: Book[];
  media: MediaAsset[];
  members: Record<string, MemberRecord>;
  guides?: Guide[];
  desk?: {
    pin?: DeskPin;
    founderNotes?: FounderNote[];
  };
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
  /** Optional campus field photo — earns a one-time coin bonus when posted. */
  imageUrl?: string;
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
  stripeUrl: string;
};

export type MembershipPackage = {
  id: string;
  name: string;
  price: number;
  listPrice?: number;
  listPriceLabel?: string;
  duration: string;
  featured?: boolean;
  features: string[];
  href: string;
  stripeUrl: string;
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

export type MessageKind = "mentor" | "peer";

export type Message = {
  id: string;
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  kind: MessageKind;
  courseId?: string;
  coinsSpent: number;
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
  /** Consecutive UTC days the student opened campus (daily login award). */
  loginStreakCount: number;
  lastLoginDate: string;
  lastStipendMonth: string;
  lastCoinPackId: string;
  lastCoinCreditAt: string;
  membershipPaidAt: string;
  profile: {
    name: string;
    phone: string;
    bio: string;
  };
};

export type AccountStatus = "active" | "suspended" | "pending";
export type AcquisitionSource = "organic" | "referral" | "promo" | "direct" | "job-board";
export type PaymentKind = "coins" | "course" | "bundle" | "membership";
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
