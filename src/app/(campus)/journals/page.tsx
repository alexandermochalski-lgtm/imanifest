import Link from "next/link";
import { toggleFavorite } from "@/app/actions/campus";
import { seedJournals } from "@/lib/catalog";
import { getSession } from "@/lib/session";
import { getState } from "@/lib/state";

export default async function JournalsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const session = await getSession();
  const state = await getState();
  const all = [...state.journals, ...seedJournals];
  const visible = all.filter((journal) => {
    if (journal.type === "private" && journal.authorId !== session?.userId) return false;
    if (type === "public") return journal.type === "public";
    if (type === "private") return journal.type === "private" && journal.authorId === session?.userId;
    return true;
  });
  return (
    <main>
      <div className="flex items-end justify-between gap-4">
        <h1 className="font-[family-name:var(--font-cormorant)] text-4xl text-white">Journals</h1>
        <div className="flex gap-3 text-sm">
          <Link href="/journals/new" className="text-gold">
            Create
          </Link>
          <Link href="/journals/mine" className="text-gold">
            My journals
          </Link>
        </div>
      </div>
      <div className="mt-4 flex gap-3 text-xs">
        <Link href="/journals" className="text-gold">
          All
        </Link>
        <Link href="/journals?type=public" className="text-muted">
          Public
        </Link>
        <Link href="/journals?type=private" className="text-muted">
          Private
        </Link>
      </div>
      <div className="mt-8 space-y-4">
        {visible.map((journal) => (
          <article key={journal.id} className="rounded-2xl border border-[var(--line)] bg-panel p-5">
            <Link href={`/journals/${journal.slug}`} className="text-xl text-white">
              {journal.title}
            </Link>
            <p className="mt-1 text-xs text-gold">
              {journal.authorName} · {journal.type} · {journal.createdAt}
            </p>
            <p className="mt-3 text-sm text-muted">{journal.excerpt}</p>
            <form action={toggleFavorite.bind(null, "journal", journal.id)} className="mt-3">
              <button className="text-sm text-gold" type="submit">
                {state.favoriteJournals.includes(journal.id) ? "Unbookmark" : "Bookmark"}
              </button>
            </form>
          </article>
        ))}
      </div>
    </main>
  );
}
