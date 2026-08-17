import Link from "next/link";
import { deleteJournal } from "@/app/actions/campus";
import { getSession } from "@/lib/session";
import { getState } from "@/lib/state";

export default async function MyJournalsPage() {
  const session = await getSession();
  const state = await getState();
  const mine = state.journals.filter((journal) => journal.authorId === session?.userId);
  return (
    <main>
      <h1 className="font-[family-name:var(--font-cormorant)] text-4xl text-white">My journals</h1>
      <div className="mt-8 space-y-4">
        {mine.length === 0 ? <p className="text-muted">No entries yet. Create one.</p> : null}
        {mine.map((journal) => (
          <article key={journal.id} className="flex items-center justify-between rounded-2xl border border-[var(--line)] bg-panel p-5">
            <Link href={`/journals/${journal.slug}`} className="text-white">
              {journal.title}
            </Link>
            <form action={deleteJournal.bind(null, journal.id)}>
              <button className="text-sm text-red-300" type="submit">
                Delete
              </button>
            </form>
          </article>
        ))}
      </div>
    </main>
  );
}
