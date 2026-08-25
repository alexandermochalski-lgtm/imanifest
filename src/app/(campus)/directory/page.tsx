import Link from "next/link";
import { GoldButton } from "@/components/ui";
import { campusMediaHref } from "@/lib/blob-access";
import { listDirectory } from "@/lib/directory";
import { PEER_MESSAGE_COST } from "@/lib/messenger";
import { getSession } from "@/lib/session";
import { initialsFromName } from "@/lib/social";

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
        Open a profile, follow a seat, or start a thread. Mentors stay on Messages and are free when you are enrolled.
        A note to another student costs {PEER_MESSAGE_COST} coins. Hide yourself under Edit profile if you do not want
        to be listed.
      </p>
      <form className="mt-6 flex flex-wrap gap-3">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search name, @handle, or bio"
          className="min-w-56 rounded-xl border border-[var(--line)] bg-black/40 px-3 py-2 text-sm"
        />
        <GoldButton type="submit">Search</GoldButton>
      </form>
      <p className="mt-4 text-sm text-muted">{people.length} listed</p>
      {people.length === 0 ? (
        <p className="mt-6 text-sm text-muted">No seats match that search. Clear the query or wait for listed students.</p>
      ) : null}
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {people.map((person) => {
          const avatar = campusMediaHref(person.avatarUrl);
          const profileHref = person.handle ? `/u/${person.handle}` : `/messages/${person.id}`;
          return (
            <article key={person.id} className="rounded-2xl border border-[var(--line)] bg-panel p-5">
              <div className="flex items-start gap-3">
                <Link
                  href={profileHref}
                  className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-black text-sm text-gold"
                >
                  {avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img alt="" className="h-full w-full object-cover" src={avatar} />
                  ) : (
                    initialsFromName(person.name)
                  )}
                </Link>
                <div className="min-w-0 flex-1">
                  <Link href={profileHref} className="text-white hover:text-gold">
                    {person.name}
                  </Link>
                  {person.handle ? <p className="text-sm text-muted">@{person.handle}</p> : null}
                  <p className="mt-2 line-clamp-3 text-sm text-muted">{person.subtitle}</p>
                  <div className="mt-4 flex flex-wrap gap-3 text-sm">
                    {person.handle ? (
                      <Link href={`/u/${person.handle}`} className="text-gold">
                        View profile
                      </Link>
                    ) : null}
                    <Link href={`/messages/${person.id}`} className="text-gold">
                      Message · {PEER_MESSAGE_COST} coins
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
