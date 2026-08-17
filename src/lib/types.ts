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

export type Lesson = {
  id: string;
  title: string;
  kind: "video" | "reading" | "pdf";
  duration: string;
  body: string;
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
  profile: {
    name: string;
    phone: string;
    bio: string;
  };
};
