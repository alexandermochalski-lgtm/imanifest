import type {
  Book,
  Bundle,
  CategorySlug,
  CoinPack,
  Course,
  DynamicPage,
  ForumPost,
  Guide,
  Insight,
  JobPost,
  Journal,
  MembershipPackage,
  PromoCode,
  Question,
  User,
} from "@/lib/types";

export const categories: { slug: CategorySlug; label: string }[] = [
  { slug: "personal-development", label: "Personal Development" },
  { slug: "wealth-creation", label: "Wealth Creation" },
  { slug: "investing", label: "Investing" },
  { slug: "marketing", label: "Marketing" },
  { slug: "e-commerce", label: "E-Commerce" },
  { slug: "health-wellness", label: "Health & Wellness" },
  { slug: "fitness-nutrition", label: "Fitness & Nutrition" },
  { slug: "social-media", label: "Social Media" },
];

export const seedUsers: User[] = [
  {
    id: "u-admin",
    name: "iMU Registrar",
    username: "registrar",
    email: "admin@imanifest.money",
    phone: "+1 415 010 0101",
    role: "admin",
    bio: "Campus operations and faculty coordination.",
    avatarLabel: "IR",
  },
  {
    id: "u-student",
    name: "Alex Operator",
    username: "alex",
    email: "student@imanifest.money",
    phone: "+1 415 020 0202",
    role: "student",
    bio: "Building a personal capital stack through iMU.",
    avatarLabel: "AO",
  },
  {
    id: "u-faculty",
    name: "Dean Okonkwo",
    username: "dean",
    email: "dean@imanifest.money",
    phone: "+1 415 030 0303",
    role: "admin",
    bio: "Faculty lead, markets and operator mindset.",
    avatarLabel: "DO",
  },
  {
    id: "u-steve",
    name: "Steve Zee",
    username: "steve",
    email: "steve@imanifest.money",
    phone: "",
    role: "admin",
    bio: "Founder desk — content, daily notes, and campus direction.",
    avatarLabel: "SZ",
  },
];

function q(id: string, prompt: string, options: string[], answerIndex: number): Question {
  return { id, prompt, options, answerIndex, marks: 10 };
}

function moduleQuiz(prefix: string, title: string, questions: Question[]) {
  return {
    id: `${prefix}-quiz`,
    title,
    passMark: 70,
    questions,
  };
}

function imuCourse(spec: {
  id: string;
  title: string;
  faculty: string;
  category: CategorySlug;
  duration: string;
  level: Course["level"];
  price: number;
  summary: string;
}): Course {
  const { id } = spec;
  return {
    ...spec,
    slug: id.replace(/^c-/, ""),
    status: "active",
    modules: [
      {
        id: `${id}-m1`,
        title: "Core method",
        lessons: [
          {
            id: `${id}-m1-l1`,
            title: "The method",
            kind: "video",
            duration: "18 min",
            body: spec.summary,
          },
          {
            id: `${id}-m1-l2`,
            title: "Operator drill",
            kind: "reading",
            duration: "10 min",
            body: "Run the method this week. Journal surplus. Kill anything that is still a hobby.",
          },
        ],
        quiz: moduleQuiz(`${id}-m1`, `${spec.title} exam`, [
          q(`${id}a`, "This iMU method is for…", ["Entertainment", "Making money with a process", "Likes", "Hope"], 1),
          q(`${id}b`, "A hobby is…", ["A business", "Unpriced time", "Alpha", "A coin pack"], 1),
          q(`${id}c`, "Journal the…", ["Vibe", "Surplus", "Hashtags", "Luck"], 1),
          q(`${id}d`, "Kill anything that is still…", ["Priced", "A hobby", "Documented", "Enrolled"], 1),
        ]),
      },
    ],
  };
}

export const courses: Course[] = [
  {
    id: "c-wealth",
    slug: "wealth-architecture",
    title: "Wealth Architecture",
    faculty: "Capital Markets",
    category: "wealth-creation",
    duration: "8 weeks",
    level: "Foundation",
    price: 120,
    summary:
      "Build a personal capital stack: cashflow mapping, allocation rules, and a repeatable wealth operating system.",
    status: "active",
    modules: [
      {
        id: "c-wealth-m1",
        title: "Cashflow Map",
        lessons: [
          {
            id: "c-wealth-m1-l1",
            title: "Income, burn, surplus",
            kind: "video",
            duration: "18 min",
            body: "Map every inflow and outflow for 90 days. Surplus is the only raw material of wealth — not motivation.",
          },
          {
            id: "c-wealth-m1-l2",
            title: "The operator ledger",
            kind: "reading",
            duration: "12 min",
            body: "Separate consumption, production, and capital accounts. Mixing them is how operators stay busy and broke.",
          },
        ],
        quiz: moduleQuiz("c-wealth-m1", "Cashflow Map Exam", [
          q("w1a", "What is the raw material of wealth in this course?", ["Motivation", "Surplus", "Network size", "Job title"], 1),
          q("w1b", "Why split consumption and capital accounts?", ["Tax theatre", "Stop mixing burn with investment", "Bank fees", "Credit score"], 1),
          q("w1c", "A 90-day map is used to…", ["Forecast GDP", "See actual surplus", "Replace a P&L", "Time the market"], 1),
          q("w1d", "Busy and broke usually means…", ["Too few meetings", "Accounts mixed", "No LinkedIn", "Low IQ"], 1),
        ]),
      },
      {
        id: "c-wealth-m2",
        title: "Allocation Rules",
        lessons: [
          {
            id: "c-wealth-m2-l1",
            title: "Buckets before products",
            kind: "video",
            duration: "22 min",
            body: "Safety, productivity, and convexity. Products come after policy. Policy is written before the next shiny vehicle.",
          },
          {
            id: "c-wealth-m2-l2",
            title: "Rebalance without drama",
            kind: "pdf",
            duration: "15 min",
            body: "Calendar rebalancing beats narrative rebalancing. Write the rule while you are calm.",
          },
        ],
        quiz: moduleQuiz("c-wealth-m2", "Allocation Exam", [
          q("w2a", "Products should come…", ["Before policy", "After policy", "Instead of cashflow", "From influencers"], 1),
          q("w2b", "The three buckets taught here are…", ["Stocks, crypto, cash", "Safety, productivity, convexity", "Rent, food, fun", "Debt, FOMO, hope"], 1),
          q("w2c", "Rebalance when…", ["Twitter is loud", "The calendar says so", "A guru posts", "You feel lucky"], 1),
          q("w2d", "Write rules when you are…", ["Euphoric", "Calm", "Sleep-deprived", "In a drawdown panic"], 1),
        ]),
      },
      {
        id: "c-wealth-m3",
        title: "Wealth OS",
        lessons: [
          {
            id: "c-wealth-m3-l1",
            title: "Weekly capital meeting",
            kind: "reading",
            duration: "10 min",
            body: "Thirty minutes. Surplus, allocation drift, one decision. No entertainment finance.",
          },
          {
            id: "c-wealth-m3-l2",
            title: "Kill optional complexity",
            kind: "video",
            duration: "16 min",
            body: "If a position cannot be explained in one sentence, it does not belong in a Foundation stack.",
          },
        ],
        quiz: moduleQuiz("c-wealth-m3", "Wealth OS Exam", [
          q("w3a", "Weekly capital meeting length?", ["3 hours", "30 minutes", "All weekend", "None — automate feelings"], 1),
          q("w3b", "Entertainment finance is…", ["The curriculum", "Not the meeting", "Required reading", "Alpha"], 1),
          q("w3c", "A Foundation position must be…", ["Levered 10x", "Explainable in one sentence", "Secret", "Copied"], 1),
          q("w3d", "Complexity is…", ["Always edge", "Optional and often lethal", "A personality trait", "Free"], 1),
        ]),
      },
    ],
  },
  {
    id: "c-private",
    slug: "private-markets",
    title: "Private Markets & Deal Flow",
    faculty: "Investing",
    category: "investing",
    duration: "10 weeks",
    level: "Practitioner",
    price: 180,
    summary: "Source, underwrite, and structure private deals with institutional discipline instead of hype-cycle timing.",
    status: "active",
    modules: [
      {
        id: "c-private-m1",
        title: "Sourcing",
        lessons: [
          {
            id: "c-private-m1-l1",
            title: "Where deals actually appear",
            kind: "video",
            duration: "20 min",
            body: "Operators, not timelines. Warm intros beat cold decks. Your reputation is the origination engine.",
          },
          {
            id: "c-private-m1-l2",
            title: "Kill criteria first",
            kind: "reading",
            duration: "11 min",
            body: "Write the no-list before the yes-list. Most deal flow is a time tax.",
          },
        ],
        quiz: moduleQuiz("c-private-m1", "Sourcing Exam", [
          q("p1a", "Origination engine is…", ["A CRM theme", "Your reputation", "Cold email volume", "Twitter spaces"], 1),
          q("p1b", "Write first the…", ["Yes-list", "No-list", "Pitch deck", "Cap table"], 1),
          q("p1c", "Most deal flow is…", ["Alpha", "A time tax", "Risk-free", "Mandatory"], 1),
          q("p1d", "Warm intros beat…", ["Underwriting", "Cold decks", "Legal review", "Cash"], 1),
        ]),
      },
      {
        id: "c-private-m2",
        title: "Underwriting",
        lessons: [
          {
            id: "c-private-m2-l1",
            title: "Unit economics without theatre",
            kind: "video",
            duration: "24 min",
            body: "Contribution, payback, concentration, and what breaks if the founder is hit by a bus.",
          },
          {
            id: "c-private-m2-l2",
            title: "Structure vs story",
            kind: "pdf",
            duration: "14 min",
            body: "Prefs, information rights, and who gets paid when the outcome is merely fine.",
          },
        ],
        quiz: moduleQuiz("c-private-m2", "Underwriting Exam", [
          q("p2a", "Underwriting starts with…", ["Logo size", "Unit economics", "Press", "Headcount"], 1),
          q("p2b", "Structure matters most when the outcome is…", ["A 100x", "Merely fine", "Zero", "Viral"], 1),
          q("p2c", "Key-person risk asks…", ["Office lease", "What breaks without the founder", "Brand colors", "CAC only"], 1),
          q("p2d", "Prefs are…", ["Optional poetry", "Economic rights", "A vibe", "Taxes"], 1),
        ]),
      },
      {
        id: "c-private-m3",
        title: "Close & Monitor",
        lessons: [
          {
            id: "c-private-m3-l1",
            title: "After the wire",
            kind: "reading",
            duration: "9 min",
            body: "Reporting cadence, board hygiene, and when to stop throwing good money after a thesis that died.",
          },
          {
            id: "c-private-m3-l2",
            title: "Secondaries and exits",
            kind: "video",
            duration: "17 min",
            body: "Liquidity is a feature you negotiate, not a feeling you wait for.",
          },
        ],
        quiz: moduleQuiz("c-private-m3", "Monitor Exam", [
          q("p3a", "Liquidity is…", ["A feeling", "Negotiated", "Guaranteed", "Illegal"], 1),
          q("p3b", "A dead thesis should be…", ["Averaged down forever", "Stopped", "Tweeted", "Renamed"], 1),
          q("p3c", "Reporting cadence is…", ["Optional", "Part of the deal", "Only for VCs", "Annual vibes"], 1),
          q("p3d", "After the wire you…", ["Disappear", "Monitor", "Celebrate only", "Delete the model"], 1),
        ]),
      },
    ],
  },
  {
    id: "c-mindset",
    slug: "sovereign-mindset",
    title: "Sovereign Mindset",
    faculty: "Personal Development",
    category: "personal-development",
    duration: "6 weeks",
    level: "Foundation",
    price: 0,
    summary: "Rewire decision quality, identity, and execution so financial skill compounds instead of leaking under pressure.",
    status: "active",
    modules: [
      {
        id: "c-mindset-m1",
        title: "Identity vs Impulse",
        lessons: [
          {
            id: "c-mindset-m1-l1",
            title: "Who decides under stress",
            kind: "video",
            duration: "19 min",
            body: "Impulse is not a strategy. Pre-commit the identity that is allowed to trade, spend, and speak.",
          },
          {
            id: "c-mindset-m1-l2",
            title: "Sleep, stimulus, surplus",
            kind: "reading",
            duration: "8 min",
            body: "A tired operator will violate every allocation rule you wrote.",
          },
        ],
        quiz: moduleQuiz("c-mindset-m1", "Identity Exam", [
          q("m1a", "Impulse is…", ["Alpha", "Not a strategy", "Required", "Luck"], 1),
          q("m1b", "Pre-commit which identity may…", ["Scroll", "Trade, spend, speak", "Sleep in", "Gossip"], 1),
          q("m1c", "Tired operators…", ["Outperform", "Violate rules", "Need more leverage", "Are elite"], 1),
          q("m1d", "This module’s enemy is…", ["Excel", "Unexamined impulse", "Savings", "Silence"], 1),
        ]),
      },
      {
        id: "c-mindset-m2",
        title: "Execution Cadence",
        lessons: [
          {
            id: "c-mindset-m2-l1",
            title: "One constraint, one move",
            kind: "video",
            duration: "14 min",
            body: "Multitasking is how ambitious people stay average. Pick the bottleneck.",
          },
          {
            id: "c-mindset-m2-l2",
            title: "Review without self-abuse",
            kind: "reading",
            duration: "7 min",
            body: "Score process, not mood. Mood is a lagging indicator.",
          },
        ],
        quiz: moduleQuiz("c-mindset-m2", "Cadence Exam", [
          q("m2a", "Average ambitious people often…", ["Focus", "Multitask", "Rest", "Write rules"], 1),
          q("m2b", "Pick the…", ["Loudest task", "Bottleneck", "Newest app", "Group chat"], 1),
          q("m2c", "Score…", ["Mood", "Process", "Followers", "Luck"], 1),
          q("m2d", "Mood is…", ["A leading indicator", "Lagging", "Alpha", "Policy"], 1),
        ]),
      },
      {
        id: "c-mindset-m3",
        title: "Pressure Protocol",
        lessons: [
          {
            id: "c-mindset-m3-l1",
            title: "Drawdown behaviour",
            kind: "video",
            duration: "16 min",
            body: "Write what you will do at −10%, −25%, −40% before those numbers arrive.",
          },
          {
            id: "c-mindset-m3-l2",
            title: "No revenge sizing",
            kind: "pdf",
            duration: "9 min",
            body: "Size is a risk decision, not an emotional recovery tool.",
          },
        ],
        quiz: moduleQuiz("c-mindset-m3", "Pressure Exam", [
          q("m3a", "Drawdown rules are written…", ["In the panic", "Beforehand", "By Twitter", "Never"], 1),
          q("m3b", "Revenge sizing is…", ["Professional", "Forbidden here", "Required", "Hedging"], 1),
          q("m3c", "Size is…", ["An emotional tool", "A risk decision", "A brand", "Luck"], 1),
          q("m3d", "−25% should trigger…", ["Improvisation", "A pre-written protocol", "Silence forever", "Max leverage"], 1),
        ]),
      },
    ],
  },
  {
    id: "c-engines",
    slug: "income-engines",
    title: "21 Income Engines",
    faculty: "Wealth Creation",
    category: "wealth-creation",
    duration: "12 weeks",
    level: "Practitioner",
    price: 210,
    summary: "The iMU core: twenty-one money-making methods spanning digital, capital, and operator-led businesses.",
    status: "active",
    modules: [
      {
        id: "c-engines-m1",
        title: "Digital engines",
        lessons: [
          {
            id: "c-engines-m1-l1",
            title: "Offer before audience",
            kind: "video",
            duration: "21 min",
            body: "Distribution without an offer is a hobby. Offer without distribution is a diary.",
          },
          {
            id: "c-engines-m1-l2",
            title: "Seven digital methods",
            kind: "reading",
            duration: "18 min",
            body: "Info, software, media, commerce, services, communities, and licensing — pick two, ignore the rest this quarter.",
          },
        ],
        quiz: moduleQuiz("c-engines-m1", "Digital Exam", [
          q("e1a", "Offer without distribution is…", ["A business", "A diary", "A fund", "A moat"], 1),
          q("e1b", "This quarter you should pick…", ["All 21", "Two methods", "None", "Only crypto"], 1),
          q("e1c", "Distribution without an offer is…", ["A company", "A hobby", "Alpha", "A course"], 1),
          q("e1d", "Licensing sits with…", ["Sleep", "Digital methods", "Real estate only", "Taxes"], 1),
        ]),
      },
      {
        id: "c-engines-m2",
        title: "Capital engines",
        lessons: [
          {
            id: "c-engines-m2-l1",
            title: "Yield vs convexity",
            kind: "video",
            duration: "19 min",
            body: "Do not confuse a paycheck from capital with a lottery ticket. Both can live in the stack — labeled.",
          },
          {
            id: "c-engines-m2-l2",
            title: "Seven capital methods",
            kind: "pdf",
            duration: "16 min",
            body: "Public markets, private credit, real assets, royalties, spreads, GP stakes, and cash-like reserves.",
          },
        ],
        quiz: moduleQuiz("c-engines-m2", "Capital Exam", [
          q("e2a", "Yield and convexity should be…", ["Mixed unlabeled", "Labeled separately", "Ignored", "The same"], 1),
          q("e2b", "Cash-like reserves are…", ["Waste", "A capital method", "Only for banks", "Beta"], 1),
          q("e2c", "A lottery ticket is…", ["A paycheck", "Convexity", "Rent", "Salary"], 1),
          q("e2d", "GP stakes belong in…", ["Consumption", "Capital engines", "Fitness", "Forum"], 1),
        ]),
      },
      {
        id: "c-engines-m3",
        title: "Operator engines",
        lessons: [
          {
            id: "c-engines-m3-l1",
            title: "You as the factory",
            kind: "video",
            duration: "18 min",
            body: "Agencies, roll-ups, local monopolies, and skilled trades. Time is the constraint — price it.",
          },
          {
            id: "c-engines-m3-l2",
            title: "Seven operator methods",
            kind: "reading",
            duration: "15 min",
            body: "Service firms, acquisition entrepreneurship, partnerships, licensing your process, and managed capital.",
          },
        ],
        quiz: moduleQuiz("c-engines-m3", "Operator Exam", [
          q("e3a", "The constraint in operator engines is…", ["Wi-Fi", "Time", "Hashtags", "Luck"], 1),
          q("e3b", "Price your…", ["Ego", "Time", "Followers", "Office"], 1),
          q("e3c", "A local monopoly is…", ["Illegal here", "An operator method", "A coin pack", "A quiz"], 1),
          q("e3d", "Managed capital is…", ["Consumption", "An operator method", "Sleep", "A vibe"], 1),
        ]),
      },
    ],
  },
  {
    id: "c-quant",
    slug: "quant-for-operators",
    title: "Quant for Operators",
    faculty: "Markets",
    category: "investing",
    duration: "9 weeks",
    level: "Mastery",
    price: 240,
    summary: "Risk, expectancy, and position sizing for traders and founders who need a professional edge without a desk.",
    status: "active",
    modules: [
      {
        id: "c-quant-m1",
        title: "Expectancy",
        lessons: [
          {
            id: "c-quant-m1-l1",
            title: "Edge is a number",
            kind: "video",
            duration: "23 min",
            body: "Win rate × average win − loss rate × average loss. If you cannot compute it, you do not have a system.",
          },
          {
            id: "c-quant-m1-l2",
            title: "Sample size honesty",
            kind: "reading",
            duration: "12 min",
            body: "Twelve trades is a story. Two hundred is a distribution. Know which one you are living in.",
          },
        ],
        quiz: moduleQuiz("c-quant-m1", "Expectancy Exam", [
          q("q1a", "Edge is…", ["A feeling", "A number", "A guru", "A logo"], 1),
          q("q1b", "Twelve trades are…", ["A distribution", "A story", "Proof", "A fund"], 1),
          q("q1c", "If you cannot compute expectancy you…", ["Are elite", "Do not have a system", "Should 10x size", "Need a VPN"], 1),
          q("q1d", "Sample size honesty prevents…", ["Sleep", "Narrative edge", "Taxes", "Journals"], 1),
        ]),
      },
      {
        id: "c-quant-m2",
        title: "Sizing",
        lessons: [
          {
            id: "c-quant-m2-l1",
            title: "Risk per idea",
            kind: "video",
            duration: "20 min",
            body: "Fixed fractional. Volatility targeting. Never ‘this one is special’.",
          },
          {
            id: "c-quant-m2-l2",
            title: "Correlation is the silent killer",
            kind: "pdf",
            duration: "13 min",
            body: "Five positions that are one bet. Map the factor, not the ticker.",
          },
        ],
        quiz: moduleQuiz("c-quant-m2", "Sizing Exam", [
          q("q2a", "‘This one is special’ is…", ["A valid size", "Forbidden", "Alpha", "Hedging"], 1),
          q("q2b", "Five correlated names are…", ["Diversified", "One bet", "A fund", "Safe"], 1),
          q("q2c", "Map the…", ["Ticker only", "Factor", "Logo", "CEO tweets"], 1),
          q("q2d", "Fixed fractional is a…", ["Mood", "Sizing rule", "Tax", "Course price"], 1),
        ]),
      },
      {
        id: "c-quant-m3",
        title: "Process",
        lessons: [
          {
            id: "c-quant-m3-l1",
            title: "Journal the trade, not the ego",
            kind: "reading",
            duration: "10 min",
            body: "Entry, thesis, invalidation, size, emotion. The journal is the desk.",
          },
          {
            id: "c-quant-m3-l2",
            title: "Kill switches",
            kind: "video",
            duration: "15 min",
            body: "Daily loss, weekly loss, broken process. The switch exists so you still have a career next year.",
          },
        ],
        quiz: moduleQuiz("c-quant-m3", "Process Exam", [
          q("q3a", "The journal is…", ["Optional", "The desk", "For HR", "A tweet"], 1),
          q("q3b", "A kill switch protects…", ["Your ego", "Next year’s career", "The broker", "FOMO"], 1),
          q("q3c", "Invalidation belongs…", ["Nowhere", "In the journal before entry", "After a loss rant", "In a dream"], 1),
          q("q3d", "Broken process triggers…", ["More size", "The kill switch", "A new indicator", "Silence"], 1),
        ]),
      },
    ],
  },
  {
    id: "c-career",
    slug: "career-capital",
    title: "Career Capital & Job Board",
    faculty: "Professional Path",
    category: "marketing",
    duration: "4 weeks",
    level: "Foundation",
    price: 90,
    summary: "Package proof of work, interview like an operator, and access iManifest roles and partner mandates.",
    status: "active",
    modules: [
      {
        id: "c-career-m1",
        title: "Proof of work",
        lessons: [
          {
            id: "c-career-m1-l1",
            title: "Artifacts beat adjectives",
            kind: "video",
            duration: "14 min",
            body: "Ship a case, a model, a memo. ‘Passionate’ is not a credential.",
          },
          {
            id: "c-career-m1-l2",
            title: "The iMU portfolio",
            kind: "reading",
            duration: "8 min",
            body: "Course completions, journals, and deal notes as a public trail.",
          },
        ],
        quiz: moduleQuiz("c-career-m1", "Proof Exam", [
          q("k1a", "Artifacts beat…", ["Results", "Adjectives", "Capital", "Sleep"], 1),
          q("k1b", "Passionate is…", ["A credential", "Not a credential", "A degree", "Alpha"], 1),
          q("k1c", "Ship a…", ["Vibe", "Case, model, or memo", "Hashtag", "Mood board"], 1),
          q("k1d", "Completions and journals are…", ["Noise", "A public trail", "Private only", "Illegal"], 1),
        ]),
      },
      {
        id: "c-career-m2",
        title: "Operator interviews",
        lessons: [
          {
            id: "c-career-m2-l1",
            title: "Cases, not trivia",
            kind: "video",
            duration: "16 min",
            body: "Walk a decision under incomplete information. That is the job.",
          },
          {
            id: "c-career-m2-l2",
            title: "Compensation as a stack",
            kind: "pdf",
            duration: "11 min",
            body: "Base, bonus, equity, learning. Negotiate the stack, not a single number.",
          },
        ],
        quiz: moduleQuiz("c-career-m2", "Interview Exam", [
          q("k2a", "The job is…", ["Trivia", "Decisions under incomplete information", "Email volume", "Meetings"], 1),
          q("k2b", "Negotiate…", ["One number only", "The stack", "Nothing", "Vacation memes"], 1),
          q("k2c", "Learning can be…", ["Ignored", "Part of compensation", "A tax", "A coin"], 1),
          q("k2d", "Cases beat…", ["Proof", "Trivia", "Work", "Journals"], 1),
        ]),
      },
      {
        id: "c-career-m3",
        title: "Mandates",
        lessons: [
          {
            id: "c-career-m3-l1",
            title: "Using the job board",
            kind: "reading",
            duration: "7 min",
            body: "Apply with a note that maps your completed modules to the mandate. No generic cover letters.",
          },
          {
            id: "c-career-m3-l2",
            title: "Partner roles",
            kind: "video",
            duration: "12 min",
            body: "iManifest and partner desks hire for operators who already have a trail inside the campus.",
          },
        ],
        quiz: moduleQuiz("c-career-m3", "Mandates Exam", [
          q("k3a", "Cover letters should be…", ["Generic", "Mapped to completed modules", "Copied", "Empty"], 1),
          q("k3b", "Partner desks hire from…", ["Cold spam only", "Campus trail", "Astrology", "Luck"], 1),
          q("k3c", "The job board is…", ["Decoration", "A mandate channel", "A forum", "A quiz"], 1),
          q("k3d", "Apply with…", ["Nothing", "A mapped note", "Only emojis", "A meme"], 1),
        ]),
      },
    ],
  },
  imuCourse({
    id: "c-personal-finance",
    title: "Personal Finance Operating System",
    faculty: "Personal Development",
    category: "personal-development",
    duration: "6 weeks",
    level: "Foundation",
    price: 0,
    summary: "Legacy iMU track: accounts, surplus, and a weekly money meeting so personal finance is a system, not a mood.",
  }),
  imuCourse({
    id: "c-credit-matrix",
    title: "Credit & Debt Matrix Exit",
    faculty: "Personal Development",
    category: "personal-development",
    duration: "5 weeks",
    level: "Foundation",
    price: 80,
    summary: "Chain-breaking course: map high-interest debt, kill revolving traps, and rebuild credit as a tool — not an identity.",
  }),
  imuCourse({
    id: "c-fitness-offers",
    title: "Fitness Coaching Offers",
    faculty: "Fitness & Nutrition",
    category: "fitness-nutrition",
    duration: "7 weeks",
    level: "Practitioner",
    price: 110,
    summary: "Laravel catalog category: package training as a priced offer with retention, not unpaid programming.",
  }),
  imuCourse({
    id: "c-nutrition-engine",
    title: "Nutrition Product Engine",
    faculty: "Fitness & Nutrition",
    category: "fitness-nutrition",
    duration: "6 weeks",
    level: "Practitioner",
    price: 95,
    summary: "SKU, contribution, and fulfillment for nutrition products without turning your kitchen into a warehouse.",
  }),
  imuCourse({
    id: "c-ecommerce-machine",
    title: "E-Commerce Store Machine",
    faculty: "E-Commerce",
    category: "e-commerce",
    duration: "8 weeks",
    level: "Practitioner",
    price: 140,
    summary: "Legacy e-commerce desk: contribution per SKU, paid traffic that pays back, and killing zombie products.",
  }),
  imuCourse({
    id: "c-marketplace",
    title: "Amazon & Marketplace Cashflow",
    faculty: "E-Commerce",
    category: "e-commerce",
    duration: "8 weeks",
    level: "Practitioner",
    price: 150,
    summary: "Marketplace as a machine: fees, ranking, inventory, and when to walk away from a listing.",
  }),
  imuCourse({
    id: "c-wellness-practice",
    title: "Health & Wellness Practice",
    faculty: "Health & Wellness",
    category: "health-wellness",
    duration: "6 weeks",
    level: "Foundation",
    price: 90,
    summary: "Turn wellness skill into a practice: offers, compliance hygiene, and calendars that collect.",
  }),
  imuCourse({
    id: "c-high-ticket-health",
    title: "High-Ticket Health Funnel",
    faculty: "Health & Wellness",
    category: "health-wellness",
    duration: "7 weeks",
    level: "Mastery",
    price: 170,
    summary: "Consultative close for health offers. No fake scarcity. Proof, process, paid application.",
  }),
  imuCourse({
    id: "c-offer-copy",
    title: "Offer Architecture & Copy",
    faculty: "Marketing",
    category: "marketing",
    duration: "5 weeks",
    level: "Foundation",
    price: 85,
    summary: "The offer is the product. Copy is how you tell the truth at a price.",
  }),
  imuCourse({
    id: "c-affiliate-desk",
    title: "Affiliate Desk",
    faculty: "Marketing",
    category: "marketing",
    duration: "6 weeks",
    level: "Practitioner",
    price: 100,
    summary: "Promote what you would buy. Track EPC. Cut dead links. This is a desk, not a link dump.",
  }),
  imuCourse({
    id: "c-email-list",
    title: "Email & List Capital",
    faculty: "Marketing",
    category: "marketing",
    duration: "5 weeks",
    level: "Practitioner",
    price: 90,
    summary: "Own the list. Sequence, offer, and a weekly send that is not entertainment.",
  }),
  imuCourse({
    id: "c-social-pipe",
    title: "Social Media as a Pipe",
    faculty: "Social Media",
    category: "social-media",
    duration: "4 weeks",
    level: "Foundation",
    price: 70,
    summary: "Platforms move attention. They are not the business. Pipe to an offer.",
  }),
  imuCourse({
    id: "c-short-form",
    title: "Short-Form Distribution",
    faculty: "Social Media",
    category: "social-media",
    duration: "5 weeks",
    level: "Practitioner",
    price: 85,
    summary: "Hooks, proof, and a destination. Views without a checkout are a hobby.",
  }),
  imuCourse({
    id: "c-youtube-engine",
    title: "YouTube Media Engine",
    faculty: "Social Media",
    category: "social-media",
    duration: "8 weeks",
    level: "Practitioner",
    price: 130,
    summary: "Search + series + offer. Media that pays, not a second unpaid job.",
  }),
  imuCourse({
    id: "c-real-estate-cash",
    title: "Real Estate Cashflow",
    faculty: "Wealth Creation",
    category: "wealth-creation",
    duration: "9 weeks",
    level: "Practitioner",
    price: 160,
    summary: "Underwrite the deal. Cashflow first. Appreciation is a bonus, not a thesis.",
  }),
];

export const books: Book[] = [
  {
    id: "b-ledger",
    slug: "the-operator-ledger",
    title: "The Operator Ledger",
    author: "Dean Okonkwo",
    category: "wealth-creation",
    pages: 214,
    price: 40,
    summary: "How to keep consumption, production, and capital from contaminating each other.",
  },
  {
    id: "b-deal",
    slug: "underwriting-without-theatre",
    title: "Underwriting Without Theatre",
    author: "iMU Faculty",
    category: "investing",
    pages: 168,
    price: 35,
    summary: "A field manual for private deals that will not survive a real diligence room.",
  },
  {
    id: "b-body",
    slug: "surplus-physiology",
    title: "Surplus Physiology",
    author: "Campus Health Desk",
    category: "health-wellness",
    pages: 132,
    price: 0,
    summary: "Sleep, training, and stimulus as risk-management tools — not lifestyle content.",
  },
  {
    id: "b-fit",
    slug: "training-for-decision-makers",
    title: "Training for Decision Makers",
    author: "Campus Health Desk",
    category: "fitness-nutrition",
    pages: 96,
    price: 15,
    summary: "A minimum effective dose so the body does not veto the capital meeting.",
  },
  {
    id: "b-offer",
    slug: "offer-before-audience",
    title: "Offer Before Audience",
    author: "Growth Faculty",
    category: "marketing",
    pages: 148,
    price: 25,
    summary: "Distribution is a multiplier. The offer is the thing being multiplied.",
  },
  {
    id: "b-shop",
    slug: "commerce-as-a-machine",
    title: "Commerce as a Machine",
    author: "Operator Faculty",
    category: "e-commerce",
    pages: 190,
    price: 30,
    summary: "Contribution, SKU discipline, and why most stores are unpaid internships.",
  },
  {
    id: "b-id",
    slug: "identity-under-drawdown",
    title: "Identity Under Drawdown",
    author: "Dean Okonkwo",
    category: "personal-development",
    pages: 110,
    price: 0,
    summary: "Who is allowed to click when the PnL is red.",
  },
  {
    id: "b-dist",
    slug: "distribution-without-clown-makeup",
    title: "Distribution Without Clown Makeup",
    author: "Growth Faculty",
    category: "social-media",
    pages: 121,
    price: 20,
    summary: "Platforms as pipes. Personality as optional. Proof as mandatory.",
  },
];

export const guides: Guide[] = [
  {
    id: "g-enroll",
    slug: "how-to-enroll-and-complete",
    title: "How to enroll and complete a course",
    tag: "campus",
    tags: ["campus", "personal-development"],
    summary: "Coins, modules, quizzes, retakes, and what ‘complete’ actually means.",
    body: "Enroll with coins or a zero-price track. Finish lessons, pass the module quiz at 70+, retake if needed. Course completion is the average of module completions.",
    author: "iMU Faculty",
  },
  {
    id: "g-coins",
    slug: "coins-and-promo-codes",
    title: "Coins and promo codes",
    tag: "billing",
    tags: ["billing", "wealth-creation"],
    summary: "How iMU coins buy courses, books, and bundles.",
    body: "Buy a coin pack on Pricing. Promo codes discount the pack. Course purchase can spend coin balance in full. This staging build simulates card capture and credits the ledger immediately.",
    author: "iMU Ops",
  },
  {
    id: "g-jobs",
    slug: "job-board-protocol",
    title: "Job board protocol",
    tag: "career",
    tags: ["career", "personal-development"],
    summary: "Favorites, applications, and how faculty review works.",
    body: "Open roles live on the Job Board. Favorite to shortlist. Apply with a note mapped to completed modules. Track status under My Applications.",
    author: "iMU Faculty",
  },
  {
    id: "g-inside-hustler-1",
    slug: "inside-hustler-01-surplus",
    title: "Inside Hustler · 01 — Surplus is the product",
    tag: "wealth-creation",
    tags: ["wealth-creation", "personal-development", "marketing"],
    series: "The Inside Hustler Series",
    author: "Steven Zee",
    summary: "Short field note: stop collecting hobbies. Name the unit you sell.",
    body: "An inside hustler does not romanticize the grind. You name the buyer, the pain, and the price in one breath. Everything else is costume. Today: write the unit of surplus your method produces, then kill one activity that cannot map to it.",
  },
  {
    id: "g-inside-hustler-2",
    slug: "inside-hustler-02-alignment",
    title: "Inside Hustler · 02 — Alignment then action",
    tag: "personal-development",
    tags: ["personal-development", "wealth-creation"],
    series: "The Inside Hustler Series",
    author: "Steven Zee",
    summary: "Thoughts without ship dates are mood. Ship dates without alignment are thrash.",
    body: "Align the desire. Then calendar the proof. Growth mindset is useless if the calendar is empty. Pick one desire for this week, one metric that proves progress, and one hour you will not negotiate away.",
  },
  {
    id: "g-gentleman-01",
    slug: "gentleman-01-presence",
    title: "101 Guides to Being a Gentleman · 01 — Presence",
    tag: "personal-development",
    tags: ["personal-development", "health-wellness", "social-media"],
    series: "101 Guides to Being a Gentleman",
    author: "Sateeb",
    summary: "First of 101: how you enter a room is a method, not a vibe.",
    body: "A gentleman arrives on time, puts the phone away, and gives the person in front of him the full desk. Presence is the first surplus others can feel. Practice: one conversation today with zero multitasking.",
  },
  {
    id: "g-gentleman-02",
    slug: "gentleman-02-word",
    title: "101 Guides to Being a Gentleman · 02 — Keep your word",
    tag: "personal-development",
    tags: ["personal-development", "wealth-creation"],
    series: "101 Guides to Being a Gentleman",
    author: "Sateeb",
    summary: "Reliability compounds faster than charm.",
    body: "Say less. Deliver more. If you cannot keep the commitment, renegotiate before the deadline — never after. Track three open promises this week and close or renegotiate each one.",
  },
];

export const seedJournals: Journal[] = [
  {
    id: "j-1",
    slug: "first-surplus-week",
    title: "First surplus week",
    authorId: "u-student",
    authorName: "Alex Operator",
    type: "public",
    excerpt: "The ledger showed $1,840 that was previously ‘just spending’.",
    body: "I split accounts on Monday. By Friday the consumption account was smaller than my story about myself. That gap is the course.",
    createdAt: "2026-08-01",
  },
  {
    id: "j-2",
    slug: "no-list-for-deals",
    title: "My no-list for deals",
    authorId: "u-faculty",
    authorName: "Dean Okonkwo",
    type: "public",
    excerpt: "If I cannot explain the unit, I do not take the meeting.",
    body: "No consumer crypto with no cashflow. No ‘community’ with no buyer. No founder who cannot state burn in one sentence.",
    createdAt: "2026-08-04",
  },
  {
    id: "j-3",
    slug: "private-drawdown-note",
    title: "Private drawdown note",
    authorId: "u-student",
    authorName: "Alex Operator",
    type: "private",
    excerpt: "Visible only to the author — process score, not a public confession.",
    body: "Hit −8% on a correlated cluster. Kill switch not triggered. Factor map was late. Fix: one-factor cap next week.",
    createdAt: "2026-08-10",
  },
];

export const seedForum: ForumPost[] = [
  {
    id: "f-1",
    slug: "best-kill-criteria-for-online-offers",
    title: "Best kill-criteria for online offers?",
    category: "wealth-creation",
    authorId: "u-student",
    authorName: "Alex Operator",
    body: "I am running two digital methods this quarter. What is a clean no-list so I stop collecting half-built funnels?",
    createdAt: "2026-08-08",
    replies: [
      {
        id: "f-1-r1",
        authorId: "u-faculty",
        authorName: "Dean Okonkwo",
        body: "If you cannot name the buyer, the pain, and the price in one breath, it is a hobby. Kill it.",
        createdAt: "2026-08-08",
      },
    ],
  },
  {
    id: "f-2",
    slug: "position-sizing-when-you-also-run-a-company",
    title: "Position sizing when you also run a company",
    category: "investing",
    authorId: "u-faculty",
    authorName: "Dean Okonkwo",
    body: "Your operating business is already a concentrated bet. Treat the liquid book as ballast, not a second personality.",
    createdAt: "2026-08-11",
    replies: [],
  },
];

export const jobs: JobPost[] = [
  {
    id: "job-analyst",
    slug: "junior-underwriting-analyst",
    title: "Junior Underwriting Analyst",
    company: "iManifest Capital Desk",
    location: "Remote",
    type: "Remote",
    salary: "$85k–$110k + bonus",
    facilities: ["Remote-first", "Learning stipend", "Coin bonus on start"],
    summary: "Underwrite private deals and write memos that a partner can actually use.",
    body: "You will source kill-criteria, build unit-econ sheets, and sit in weekly capital meetings. Complete Private Markets to be competitive.",
    status: "open",
  },
  {
    id: "job-ops",
    slug: "campus-operator",
    title: "Campus Operator",
    company: "iManifest University",
    location: "Hybrid · Austin",
    type: "Hybrid",
    salary: "$70k–$95k",
    facilities: ["Hybrid", "Health cover", "Course access"],
    summary: "Keep the student machine running: enrollments, forum hygiene, job-board quality.",
    body: "Operations role for someone who has completed Career Capital and treats process like a product.",
    status: "open",
  },
  {
    id: "job-growth",
    slug: "distribution-lead",
    title: "Distribution Lead",
    company: "Partner Studio",
    location: "On-site · Miami",
    type: "On-site",
    salary: "$120k + override",
    facilities: ["On-site", "Override on offers", "Relocation"],
    summary: "Own offer × channel for a partner studio inside the iMU network.",
    body: "You will not ‘do social’. You will ship offers and measure contribution. Marketing + Income Engines preferred.",
    status: "open",
  },
];

export const bundles: Bundle[] = [
  {
    id: "bun-operator",
    slug: "operator-stack",
    title: "Operator Stack",
    price: 260,
    summary: "Wealth Architecture + Sovereign Mindset + Operator Ledger. The opening stack.",
    courseIds: ["c-wealth", "c-mindset"],
    bookIds: ["b-ledger", "b-id"],
  },
  {
    id: "bun-markets",
    slug: "markets-desk",
    title: "Markets Desk",
    price: 380,
    summary: "Private Markets + Quant for Operators + underwriting manual.",
    courseIds: ["c-private", "c-quant"],
    bookIds: ["b-deal"],
  },
];

export const coinPacks: CoinPack[] = [
  {
    id: "coin-starter",
    name: "Starter",
    coins: 100,
    price: 12,
    bonus: 0,
    savePct: 0,
    stripeUrl: "https://buy.stripe.com/aFabJ14SZfbGc018GUdjO02",
  },
  {
    id: "coin-operator",
    name: "Operator",
    coins: 400,
    price: 39,
    bonus: 40,
    savePct: 25,
    stripeUrl: "https://buy.stripe.com/8x2eVd3OVd3y1ln9KYdjO03",
  },
  {
    id: "coin-desk",
    name: "Desk",
    coins: 1000,
    price: 89,
    bonus: 150,
    savePct: 35,
    stripeUrl: "https://buy.stripe.com/7sY6oH5X34x22prf5idjO04",
  },
];

export const premiumMembership: MembershipPackage = {
  id: "pkg-premium",
  name: "Campus membership",
  price: 49.99,
  listPrice: 249.5,
  listPriceLabel: "Founding rate",
  duration: "Billed monthly",
  featured: true,
  features: [
    "49+ live money methods — finance, e-commerce, marketing, and more",
    "Daily desk + streak — one session per day, 0.5 coins when you close it",
    "50 coins included every month — for enrollments and campus actions",
    "Library, journals, forum & job board — run methods, don't just watch them",
    "Sovereign Mindset included — flagship course, no extra enrollment cost",
  ],
  href: "/get",
  stripeUrl: "https://buy.stripe.com/4gM4gz85b3sY2pr1esdjO01",
};

export const membershipPackages: MembershipPackage[] = [premiumMembership];

export const promoCodes: PromoCode[] = [
  { code: "IMU10", discountPct: 10, active: true },
  { code: "FOUNDERS", discountPct: 25, active: true },
  { code: "EXPIRED", discountPct: 50, active: false },
];

export const insights: Insight[] = [
  {
    id: "i-1",
    slug: "surplus-is-the-product",
    title: "Surplus is the product",
    kicker: "Wealth desk",
    body: "Most students try to buy a personality called ‘investor’. iMU sells a surplus process. Without surplus, every course is entertainment.",
  },
  {
    id: "i-2",
    slug: "21-methods-two-this-quarter",
    title: "21 methods, two this quarter",
    kicker: "Income engines",
    body: "The catalog is a map, not a dare. Two methods, fully operational, beat eleven half-funnels.",
  },
  {
    id: "i-3",
    slug: "jobs-are-mandates",
    title: "Jobs are mandates",
    kicker: "Career desk",
    body: "The board is not Indeed with gold CSS. Applications without a campus trail are declined.",
  },
];

export const dynamicPages: DynamicPage[] = [
  {
    slug: "privacy",
    title: "Privacy",
    body: "Full policy at /privacy. Accounts on Supabase Auth; memberships in Supabase; faculty media on Vercel Blob; cards on Stripe.",
  },
  {
    slug: "terms",
    title: "Legal",
    body: "Full terms at /legal. Campus is USD 49.99/mo. Materials are education, not investment advice.",
  },
  {
    slug: "investor-relations",
    title: "Investor Relations",
    body: "For iMU investor materials and traffic against human trafficking commitments, use the live desk at info@imanifest.money. This Next.js campus is the product rebuild.",
  },
];

export const stats = [
  { value: "21+", label: "Money-making methods" },
  { value: String(courses.length), label: "Campus courses live" },
  { value: "Faculty", label: "Professors on board" },
  { value: "Global", label: "Graduates worldwide" },
];

export function courseBySlug(slug: string) {
  return courses.find((course) => course.slug === slug);
}

export function courseById(id: string) {
  return courses.find((course) => course.id === id);
}

export function bookBySlug(slug: string) {
  return books.find((book) => book.slug === slug);
}

export function jobBySlug(slug: string) {
  return jobs.find((job) => job.slug === slug);
}

export function moduleProgress(course: Course, completedModules: string[]) {
  if (course.modules.length === 0) return 0;
  const done = course.modules.filter((module) => completedModules.includes(module.id)).length;
  return Math.round((done / course.modules.length) * 100);
}
