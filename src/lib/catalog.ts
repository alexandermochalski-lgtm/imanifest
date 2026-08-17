export type Program = {
  slug: string;
  title: string;
  faculty: string;
  duration: string;
  modules: number;
  level: "Foundation" | "Practitioner" | "Mastery";
  summary: string;
};

export const programs: Program[] = [
  {
    slug: "wealth-architecture",
    title: "Wealth Architecture",
    faculty: "Capital Markets",
    duration: "8 weeks",
    modules: 12,
    level: "Foundation",
    summary:
      "Build a personal capital stack: cashflow mapping, allocation rules, and a repeatable wealth operating system.",
  },
  {
    slug: "private-markets",
    title: "Private Markets & Deal Flow",
    faculty: "Investing",
    duration: "10 weeks",
    modules: 14,
    level: "Practitioner",
    summary:
      "Source, underwrite, and structure private deals with institutional discipline instead of hype-cycle timing.",
  },
  {
    slug: "sovereign-mindset",
    title: "Sovereign Mindset",
    faculty: "Personal Development",
    duration: "6 weeks",
    modules: 9,
    level: "Foundation",
    summary:
      "Rewire decision quality, identity, and execution so financial skill compounds instead of leaking under pressure.",
  },
  {
    slug: "income-engines",
    title: "21 Income Engines",
    faculty: "Wealth Creation",
    duration: "12 weeks",
    modules: 21,
    level: "Practitioner",
    summary:
      "The iMU core: twenty-one money-making methods spanning digital, capital, and operator-led businesses.",
  },
  {
    slug: "quant-for-operators",
    title: "Quant for Operators",
    faculty: "Markets",
    duration: "9 weeks",
    modules: 11,
    level: "Mastery",
    summary:
      "Risk, expectancy, and position sizing for traders and founders who need a professional edge without a desk.",
  },
  {
    slug: "career-capital",
    title: "Career Capital & Job Board",
    faculty: "Professional Path",
    duration: "4 weeks",
    modules: 7,
    level: "Foundation",
    summary:
      "Package proof of work, interview like an operator, and access iManifest roles and partner mandates.",
  },
];

export const stats = [
  { value: "21+", label: "Money-making methods" },
  { value: "1,000+", label: "Wealth-creation modules" },
  { value: "Faculty", label: "Professors on board" },
  { value: "Global", label: "Graduates worldwide" },
];

export const campusTools = [
  {
    title: "Course campus",
    copy: "Modules, quizzes, and completion tracking in one student workspace.",
  },
  {
    title: "Library",
    copy: "Books, journals, and guides for operators who study beyond the lecture.",
  },
  {
    title: "Forum",
    copy: "Peer signal, faculty threads, and deal discussion without the noise of social media.",
  },
  {
    title: "Job board",
    copy: "Apply to partner roles with a profile already mapped to your completed work.",
  },
];
