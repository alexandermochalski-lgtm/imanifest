export type LegalSection = {
  title: string;
  paragraphs: string[];
};

export const legalUpdated = "17 August 2026";
export const legalContact = "info@imanifest.money";

export const privacySections: LegalSection[] = [
  {
    title: "Who we are",
    paragraphs: [
      "iManifest University (“iMU”, “we”) operates the public site and student campus at imanifest.vercel.app and related imanifest.money properties. Questions: info@imanifest.money.",
    ],
  },
  {
    title: "What this policy covers",
    paragraphs: [
      "This policy describes how we handle information when you browse the catalog, create a seat, subscribe, or use campus (courses, library, journals, forum, jobs, coins).",
    ],
  },
  {
    title: "Account and profile",
    paragraphs: [
      "When you register we store your name, email, and a hashed password in Supabase Auth. Optional profile fields (phone, bio) sit on your campus ledger. Name and bio also go to the campus directory unless you uncheck listing on Profile.",
      "Demo seats (student@imanifest.money and admin@imanifest.money) are operator test accounts, not a production identity service.",
    ],
  },
  {
    title: "Membership and payments",
    paragraphs: [
      "Campus access is a monthly seat at USD 49.99, billed by Stripe. Stripe collects and processes card data. We do not store full card numbers on our servers.",
      "We record that a seat is active or canceled (user id, email, paid date, status) so campus can open after checkout and close if the subscription ends. That record is stored in Supabase and, on this build, also in a browser campus cookie.",
    ],
  },
  {
    title: "Campus activity",
    paragraphs: [
      "Inside campus we keep enrollments, coin balance, quiz results, favorites, job applications, journals, forum posts, messages, and notifications so the product works. On this build much of that ledger still lives in a first-party cookie on your device until it is fully moved to the database.",
    ],
  },
  {
    title: "Course and book files",
    paragraphs: [
      "Faculty media (MP4, MP3, PDF, images) is uploaded by the registrar and stored in Vercel Blob object storage. Supabase is not used for those uploads. Public catalog pages may show titles and summaries without requiring a seat; playback of paid lessons requires enrollment.",
    ],
  },
  {
    title: "Processors",
    paragraphs: [
      "Vercel hosts the application, logs requests, and stores faculty media in Vercel Blob.",
      "Supabase provides authentication and the memberships table.",
      "Stripe processes the monthly campus subscription.",
      "Each processor acts on our instructions under their own terms. We do not sell student lists.",
    ],
  },
  {
    title: "Cookies and session",
    paragraphs: [
      "We use first-party cookies for login (including Supabase session cookies), campus ledger state, and (where used) catalog overlay. These are required to run the product, not advertising pixels.",
    ],
  },
  {
    title: "Retention",
    paragraphs: [
      "Account and membership records are kept while the seat is active and for a reasonable period after cancel so we can restore access or handle billing disputes. You may ask us to delete a student account at info@imanifest.money. Stripe retains payment records as required for their compliance.",
      "Faculty media stays until the registrar removes it from the media desk.",
    ],
  },
  {
    title: "Your requests",
    paragraphs: [
      "Email info@imanifest.money to access, correct, or delete account data we hold, or to ask which processors we use. We will not use this address for unsolicited marketing lists.",
    ],
  },
  {
    title: "Children",
    paragraphs: [
      "Campus is for adults. We do not knowingly collect data from children under 16.",
    ],
  },
  {
    title: "Changes",
    paragraphs: [
      "If we change how data is stored (for example moving the campus ledger from cookies onto Supabase), we will update this page and the date below.",
    ],
  },
];

export const legalSections: LegalSection[] = [
  {
    title: "Agreement",
    paragraphs: [
      "These terms govern use of iManifest University’s public site and campus. By creating a seat, paying for campus, or using the materials, you agree to them. If you do not agree, do not use the campus.",
    ],
  },
  {
    title: "Education, not advice",
    paragraphs: [
      "iMU materials are education and operator training. They are not personalized investment, tax, or legal advice, not a solicitation to buy any security, and not a promise of profit. Markets and businesses can lose money. You are responsible for your own decisions.",
    ],
  },
  {
    title: "The campus seat",
    paragraphs: [
      "The public catalog (programs, about, pricing) is free to browse. Full campus — courses, library playback, journals, forum, jobs, daily desk, coin ledger — requires an active monthly subscription of USD 49.99, billed by Stripe until you cancel.",
      "Payment is processed on Stripe’s checkout. After a successful payment you are returned to campus. Cancel the subscription in Stripe (or ask info@imanifest.money). Access ends when the seat is no longer active. We do not prorate unused days on this build unless Stripe’s portal issues a credit.",
    ],
  },
  {
    title: "Coins and catalog prices",
    paragraphs: [
      "Campus coins are an internal ledger for enrolling in courses, unlocking bundles, and sending student-to-student messages (1 coin per send). Mentors are free when you are enrolled. An active monthly seat credits 50 coins each UTC month. Extra packs are bought on Stripe. Coins are not cash, not a stored-value instrument, and not redeemable for fiat except where we explicitly say so. Course coin prices are set by the registrar.",
    ],
  },
  {
    title: "Accounts",
    paragraphs: [
      "You must provide a real email you control. Keep credentials confidential. Demo seats are for operator testing. We may suspend a seat that is shared, abused, or used to attack the service.",
    ],
  },
  {
    title: "Your content",
    paragraphs: [
      "Journals, forum posts, messages, and job applications remain yours. You grant iMU a licence to host and display them on campus so the product functions. Do not post illegal content, other people’s secrets, or material you do not have the right to publish. We may remove content that breaks these terms.",
    ],
  },
  {
    title: "Our content",
    paragraphs: [
      "Courses, books, quizzes, branding, and faculty media are owned by iMU or its licensors. A paid seat is a licence to use them inside campus for your own education. It is not a right to copy, resell, scrape, or republish the library.",
    ],
  },
  {
    title: "Acceptable use",
    paragraphs: [
      "Do not attempt to bypass payment, scrape media at scale, interfere with other students, or use campus to run fraud or unlicensed financial promotion. Job applications must be truthful.",
    ],
  },
  {
    title: "Availability",
    paragraphs: [
      "We aim to keep campus up. We do not warrant uninterrupted service. Hosting is on Vercel; media on Vercel Blob; auth and membership records on Supabase; cards on Stripe. Outages at those processors can take campus offline.",
    ],
  },
  {
    title: "Limitation",
    paragraphs: [
      "To the extent permitted by law, iMU is not liable for lost profits, lost data, or trading losses arising from use of the materials. Our aggregate liability for a paid seat is limited to the subscription fees you paid us in the three months before the claim.",
    ],
  },
  {
    title: "Contact",
    paragraphs: [
      "Legal and billing: info@imanifest.money. Privacy details are at /privacy.",
    ],
  },
];
