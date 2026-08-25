import type { Book, Bundle, CategorySlug, Course } from "@/lib/types";

export type MatchFormat = "courses" | "books" | "bundles" | "mix";

export type MatchSignal = {
  categories: Partial<Record<CategorySlug, number>>;
  keywords: string[];
  format: MatchFormat;
  level?: Course["level"];
  pathLabel: string;
};

export type MatchOption = {
  id: string;
  label: string;
  hint?: string;
  signal: Omit<MatchSignal, "pathLabel" | "format"> & { format?: MatchFormat; pathLabel?: string };
};

export type MatchQuestion = {
  id: string;
  prompt: string;
  sub?: string;
  options: MatchOption[];
};

/** Guided catalog — not an LLM. Answers weight live courses/books/bundles. */
export const MATCH_QUESTIONS: MatchQuestion[] = [
  {
    id: "goal",
    prompt: "What do you want to move first?",
    sub: "Pick the outcome that would change your next 90 days.",
    options: [
      {
        id: "offers",
        label: "Ship offers & cashflow",
        hint: "Packaging, sales, consulting, freelancing",
        signal: {
          categories: { "wealth-creation": 3, marketing: 2, "e-commerce": 1 },
          keywords: ["offer", "sales", "consult", "pricing", "cash", "client", "close", "pipeline", "workshop"],
          pathLabel: "Revenue path",
        },
      },
      {
        id: "invest",
        label: "Invest & compound capital",
        hint: "Markets, assets, personal finance ops",
        signal: {
          categories: { investing: 3, "wealth-creation": 2 },
          keywords: ["invest", "stock", "crypto", "real estate", "credit", "finance", "wealth", "capital", "investor"],
          pathLabel: "Capital path",
        },
      },
      {
        id: "attention",
        label: "Grow attention & brand",
        hint: "Content, ads, social, storytelling",
        signal: {
          categories: { marketing: 3, "social-media": 2 },
          keywords: ["content", "brand", "ads", "seo", "ugc", "story", "audience", "copy", "launch", "presence"],
          pathLabel: "Attention path",
        },
      },
      {
        id: "store",
        label: "Run a store that sells",
        hint: "E-commerce numbers, retention, automation",
        signal: {
          categories: { "e-commerce": 3, marketing: 1, "wealth-creation": 1 },
          keywords: ["e-commerce", "ecommerce", "store", "retention", "sku", "shop", "automate", "ugc", "loyalty"],
          pathLabel: "Commerce path",
        },
      },
      {
        id: "operator",
        label: "Upgrade how I operate",
        hint: "Time, EQ, leadership, health, focus",
        signal: {
          categories: { "personal-development": 3, "health-wellness": 2, "fitness-nutrition": 1 },
          keywords: ["time", "focus", "habit", "leader", "stress", "sleep", "health", "eq", "goal", "boundar", "ai"],
          pathLabel: "Operator path",
        },
      },
    ],
  },
  {
    id: "arena",
    prompt: "Which desk feels closest to your work?",
    options: [
      {
        id: "money",
        label: "Money systems & surplus",
        signal: {
          categories: { "wealth-creation": 2, investing: 1 },
          keywords: ["money", "wealth", "cash", "finance", "pricing", "offer", "stack"],
        },
      },
      {
        id: "markets",
        label: "Markets & assets",
        signal: {
          categories: { investing: 3 },
          keywords: ["stock", "crypto", "real estate", "trading", "invest", "credit", "debt"],
        },
      },
      {
        id: "media",
        label: "Marketing & media",
        signal: {
          categories: { marketing: 3, "social-media": 1 },
          keywords: ["marketing", "content", "ads", "copy", "brand", "funnel", "email", "seo"],
        },
      },
      {
        id: "commerce",
        label: "Products & commerce",
        signal: {
          categories: { "e-commerce": 3 },
          keywords: ["store", "product", "ecommerce", "shop", "retention", "launch"],
        },
      },
      {
        id: "self",
        label: "Self as the system",
        signal: {
          categories: { "personal-development": 3, "health-wellness": 2, "fitness-nutrition": 1 },
          keywords: ["habit", "mindset", "focus", "career", "leader", "health", "sleep", "nutrition"],
        },
      },
    ],
  },
  {
    id: "format",
    prompt: "How do you want to study?",
    options: [
      {
        id: "courses",
        label: "Courses — audio, video, playbooks",
        signal: { categories: {}, keywords: [], format: "courses" },
      },
      {
        id: "books",
        label: "Books & PDFs I can keep",
        signal: { categories: {}, keywords: [], format: "books" },
      },
      {
        id: "bundles",
        label: "Bundled stacks (courses + books)",
        signal: { categories: {}, keywords: [], format: "bundles" },
      },
      {
        id: "mix",
        label: "A mix — build me a path",
        signal: { categories: {}, keywords: [], format: "mix" },
      },
    ],
  },
  {
    id: "level",
    prompt: "Where are you on this path?",
    options: [
      {
        id: "foundation",
        label: "Foundation — starting clean",
        signal: { categories: {}, keywords: ["foundation", "beginner", "start", "first"], level: "Foundation" },
      },
      {
        id: "practitioner",
        label: "Practitioner — already shipping",
        signal: { categories: {}, keywords: ["practitioner", "system", "ops", "pipeline"], level: "Practitioner" },
      },
      {
        id: "mastery",
        label: "Mastery — refining edge",
        signal: { categories: {}, keywords: ["mastery", "advanced", "scale", "leverage"], level: "Mastery" },
      },
    ],
  },
  {
    id: "blocker",
    prompt: "What is blocking surplus right now?",
    options: [
      {
        id: "start",
        label: "I don't know where to start",
        signal: {
          categories: { "personal-development": 1 },
          keywords: ["goal", "foundation", "mindset", "habit", "time", "first"],
        },
      },
      {
        id: "revenue",
        label: "I need revenue this month",
        signal: {
          categories: { "wealth-creation": 2, marketing: 1, "e-commerce": 1 },
          keywords: ["sales", "offer", "close", "cash", "launch", "client", "monetiz"],
        },
      },
      {
        id: "systems",
        label: "I need systems & discipline",
        signal: {
          categories: { "personal-development": 2 },
          keywords: ["sop", "system", "time", "habit", "execution", "boundar", "automation", "ai"],
        },
      },
      {
        id: "channel",
        label: "I need one channel that works",
        signal: {
          categories: { marketing: 2, "social-media": 2, "e-commerce": 1 },
          keywords: ["ads", "content", "email", "seo", "tiktok", "youtube", "linkedin", "ugc", "community"],
        },
      },
    ],
  },
  {
    id: "pace",
    prompt: "How much desk time can you protect weekly?",
    options: [
      {
        id: "sprint",
        label: "Sprint — under 3 hours",
        hint: "Short playbooks, focused desks",
        signal: {
          categories: {},
          keywords: ["mini", "foundation", "atomic", "habit", "focus", "time"],
          level: "Foundation",
        },
      },
      {
        id: "steady",
        label: "Steady — 3 to 6 hours",
        hint: "Full courses + one book",
        signal: {
          categories: {},
          keywords: ["system", "ops", "pipeline", "offer", "practitioner"],
          level: "Practitioner",
        },
      },
      {
        id: "deep",
        label: "Deep work — 6+ hours",
        hint: "Stacks, mastery desks, full paths",
        signal: {
          categories: {},
          keywords: ["mastery", "scale", "stack", "launch", "franchise", "advanced"],
          level: "Mastery",
        },
      },
    ],
  },
];

export type ScoredItem<T> = { item: T; score: number; reasons: string[] };

export type MatchRecommendation = {
  pathLabel: string;
  format: MatchFormat;
  courses: ScoredItem<Course>[];
  books: ScoredItem<Book>[];
  bundles: ScoredItem<Bundle>[];
  answerSummary: { questionId: string; optionId: string; label: string }[];
};

function mergeSignal(base: MatchSignal, next: MatchOption["signal"]): MatchSignal {
  const categories = { ...base.categories };
  for (const [key, value] of Object.entries(next.categories ?? {}) as [CategorySlug, number][]) {
    categories[key] = (categories[key] ?? 0) + value;
  }
  return {
    categories,
    keywords: [...base.keywords, ...(next.keywords ?? [])],
    format: next.format ?? base.format,
    level: next.level ?? base.level,
    pathLabel: next.pathLabel ?? base.pathLabel,
  };
}

export function buildSignal(answers: Record<string, string>): MatchSignal {
  let signal: MatchSignal = {
    categories: {},
    keywords: [],
    format: "mix",
    pathLabel: "Operator path",
  };
  for (const question of MATCH_QUESTIONS) {
    const optionId = answers[question.id];
    const option = question.options.find((item) => item.id === optionId);
    if (!option) continue;
    signal = mergeSignal(signal, option.signal);
  }
  return signal;
}

function textBlob(parts: (string | undefined)[]) {
  return parts.filter(Boolean).join(" ").toLowerCase();
}

function scoreText(blob: string, keywords: string[]) {
  let hits = 0;
  const reasons: string[] = [];
  for (const word of keywords) {
    if (word.length < 3) continue;
    if (blob.includes(word.toLowerCase())) {
      hits += 1;
      if (reasons.length < 3) reasons.push(word);
    }
  }
  return { hits, reasons };
}

export function recommendFromCatalog(input: {
  answers: Record<string, string>;
  courses: Course[];
  books: Book[];
  bundles: Bundle[];
}): MatchRecommendation {
  const signal = buildSignal(input.answers);
  const answerSummary = MATCH_QUESTIONS.map((question) => {
    const option = question.options.find((item) => item.id === input.answers[question.id]);
    return {
      questionId: question.id,
      optionId: option?.id ?? "",
      label: option?.label ?? "",
    };
  }).filter((row) => row.optionId);

  const courseScores: ScoredItem<Course>[] = input.courses.map((course) => {
    const blob = textBlob([course.title, course.summary, course.faculty, course.category]);
    const { hits, reasons } = scoreText(blob, signal.keywords);
    const cat = signal.categories[course.category] ?? 0;
    const levelBoost = signal.level && course.level === signal.level ? 6 : signal.level ? 0 : 2;
    const score = cat * 12 + hits * 4 + levelBoost + (course.price === 0 ? 1 : 0);
    const why = [
      ...(cat > 0 ? [`${course.category} desk`] : []),
      ...reasons.map((word) => `matches “${word}”`),
      ...(signal.level && course.level === signal.level ? [`${course.level} level`] : []),
    ];
    return { item: course, score, reasons: why };
  });

  const bookScores: ScoredItem<Book>[] = input.books.map((book) => {
    const tags = book.tags ?? [];
    const blob = textBlob([book.title, book.summary, book.category, ...tags]);
    const { hits, reasons } = scoreText(blob, signal.keywords);
    const cat =
      (signal.categories[book.category] ?? 0) +
      tags.reduce((sum, tag) => sum + (signal.categories[tag] ?? 0) * 0.5, 0);
    const score = cat * 10 + hits * 4 + (book.price === 0 ? 1 : 0);
    return {
      item: book,
      score,
      reasons: [
        ...(cat > 0 ? [`${book.category} library`] : []),
        ...reasons.map((word) => `matches “${word}”`),
      ],
    };
  });

  const courseById = new Map(input.courses.map((course) => [course.id, course]));
  const bookById = new Map(input.books.map((book) => [book.id, book]));
  const courseScoreMap = new Map(courseScores.map((row) => [row.item.id, row.score]));
  const bookScoreMap = new Map(bookScores.map((row) => [row.item.id, row.score]));

  const bundleScores: ScoredItem<Bundle>[] = input.bundles.map((bundle) => {
    const blob = textBlob([bundle.title, bundle.summary]);
    const { hits, reasons } = scoreText(blob, signal.keywords);
    const memberScore =
      bundle.courseIds.reduce((sum, id) => sum + (courseScoreMap.get(id) ?? 0), 0) +
      bundle.bookIds.reduce((sum, id) => sum + (bookScoreMap.get(id) ?? 0), 0);
    const score = memberScore * 0.35 + hits * 5 + (bundle.courseIds.length + bundle.bookIds.length);
    const memberTitles = [
      ...bundle.courseIds.map((id) => courseById.get(id)?.title),
      ...bundle.bookIds.map((id) => bookById.get(id)?.title),
    ].filter(Boolean) as string[];
    return {
      item: bundle,
      score,
      reasons: [
        ...reasons.map((word) => `matches “${word}”`),
        ...(memberTitles.slice(0, 2).map((title) => `includes ${title}`)),
      ],
    };
  });

  const sortCut = <T,>(rows: ScoredItem<T>[], n: number) =>
    [...rows].sort((a, b) => b.score - a.score).filter((row) => row.score > 0).slice(0, n);

  const format = signal.format;
  const courses =
    format === "books" ? [] : sortCut(courseScores, format === "courses" ? 5 : format === "bundles" ? 2 : 3);
  const books =
    format === "courses" ? [] : sortCut(bookScores, format === "books" ? 5 : format === "bundles" ? 2 : 2);
  const bundles =
    format === "courses" || format === "books" ? sortCut(bundleScores, 1) : sortCut(bundleScores, format === "bundles" ? 3 : 2);

  // Guarantee something useful if filters wiped the board
  const fallbackCourses = courses.length ? courses : sortCut(courseScores, 3);
  const fallbackBooks = books.length || format === "courses" ? books : sortCut(bookScores, 2);
  const fallbackBundles = bundles.length || format === "courses" || format === "books" ? bundles : sortCut(bundleScores, 1);

  return {
    pathLabel: signal.pathLabel,
    format,
    courses: fallbackCourses,
    books: fallbackBooks,
    bundles: fallbackBundles,
    answerSummary,
  };
}

export type MatchingAnalytics = {
  completions: number;
  starts: number;
  lastAt?: string;
  byGoal: Record<string, number>;
  byFormat: Record<string, number>;
  byPath: Record<string, number>;
  recent: {
    at: string;
    pathLabel: string;
    goal?: string;
    format?: string;
    topCourseIds: string[];
    topBookIds: string[];
    topBundleIds: string[];
    source: "marketing" | "campus";
  }[];
};

export function emptyMatchingAnalytics(): MatchingAnalytics {
  return {
    completions: 0,
    starts: 0,
    byGoal: {},
    byFormat: {},
    byPath: {},
    recent: [],
  };
}
