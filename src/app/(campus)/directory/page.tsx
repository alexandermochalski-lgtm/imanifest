import Link from "next/link";
import { GoldButton } from "@/components/ui";
import { listDirectory } from "@/lib/directory";
import { PEER_MESSAGE_COST } from "@/lib/messenger";
import { getSession } from "@/lib/session";

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const session = await getSession();
  if (!session) return null;
  const people = await listDirectory(session.userId, q);

  return (
    <main>
      <p className="text-xs uppercase tracking-[0.2em] text-gold-deep">Campus directory</p>
      <h1 className="mt-2 font-[family-name:var(--font-cormorant)] text-4xl text-white">Students</h1>
      <p className="mt-3 max-w-2xl text-sm text-muted">
        Find a seat, open a thread. Mentors stay on Messages and are free when you are enrolled. A note to another
        student costs {PEER_MESSAGE_COST} coins. Hide yourself under Profile if you do not want to be listed. Sample
        seats stay visible so the desk is usable before live registrations fill the room.
      </p>
      <form className="mt-6 flex flex-wrap gap-3">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search name or bio"
          className="min-w-56 rounded-xl border border-[var(--line)] bg-black/40 px-3 py-2 text-sm"
        />
        <GoldButton type="submit">Search</GoldButton>
      </form>
      <p className="mt-4 text-sm text-muted">{people.length} listed</p>
      {people.length === 0 ? (
        <p className="mt-6 text-sm text-muted">No seats match that search. Clear the query or wait for listed students.</p>
      ) : null}
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {people.map((person) => (
          <article key={person.id} className="rounded-2xl border border-[var(--line)] bg-panel p-5">
            <p className="text-white">{person.name}</p>
            <p className="mt-2 line-clamp-3 text-sm text-muted">{person.subtitle}</p>
            <Link href={`/messages/${person.id}`} className="mt-4 inline-block text-sm text-gold">
              Message · {PEER_MESSAGE_COST} coins
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
}
