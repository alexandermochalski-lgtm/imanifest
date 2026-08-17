import { books, courses, jobs, seedForum, seedJournals, seedUsers } from "@/lib/catalog";
import { getState } from "@/lib/state";

export default async function AdminHomePage() {
  const state = await getState();
  const cards = [
    ["Courses", String(courses.length)],
    ["Books", String(books.length)],
    ["Open jobs", String(jobs.filter((job) => job.status === "open").length)],
    ["Forum posts", String(seedForum.length + state.forumPosts.length)],
    ["Journals", String(seedJournals.length + state.journals.length)],
    ["Applications", String(state.applications.length)],
    ["Users", String(seedUsers.length)],
    ["Coin ledger (you)", String(state.coins)],
  ];
  return (
    <main>
      <h1 className="font-[family-name:var(--font-cormorant)] text-4xl text-white">Admin overview</h1>
      <p className="mt-3 text-muted">Mirrors dashboard-main: catalog, jobs, forum, journals, applications, users.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        {cards.map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-[var(--line)] bg-panel p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-gold-deep">{label}</p>
            <p className="mt-2 font-[family-name:var(--font-cormorant)] text-3xl text-gold">{value}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
