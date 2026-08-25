import Link from "next/link";
import { notFound } from "next/navigation";
import { campusMediaHref } from "@/lib/blob-access";
import { getSession } from "@/lib/session";
import { getProfileByHandle, initialsFromName, listFollowers, type SocialProfile } from "@/lib/social";

function PersonRow({ person }: { person: SocialProfile }) {
  const avatar = campusMediaHref(person.avatarUrl);
  return (
    <Link
      href={person.handle ? `/u/${person.handle}` : "/directory"}
      className="flex items-center gap-3 border-b border-[var(--line)] px-4 py-4 transition hover:bg-white/[0.02]"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-black text-sm text-gold">
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt="" className="h-full w-full object-cover" src={avatar} />
        ) : (
          initialsFromName(person.name)
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate font-medium text-white">{person.name}</p>
        <p className="text-sm text-muted">@{person.handle || "—"}</p>
        {person.bio ? <p className="mt-1 line-clamp-2 text-sm text-[var(--text-soft)]">{person.bio}</p> : null}
      </div>
    </Link>
  );
}

export default async function FollowersPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle: raw } = await params;
  const session = await getSession();
  if (!session) return null;
  const profile = await getProfileByHandle(raw);
  if (!profile) notFound();
  if (!profile.listed && profile.userId !== session.userId) notFound();
  const people = await listFollowers(profile.userId);

  return (
    <main className="mx-auto max-w-2xl">
      <Link href={`/u/${profile.handle}`} className="text-sm text-gold hover:text-white">
        ← @{profile.handle}
      </Link>
      <h1 className="mt-3 font-[family-name:var(--font-cormorant)] text-3xl text-white">Followers</h1>
      <div className="mt-6 overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--panel)]">
        {people.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted">No followers yet.</p>
        ) : (
          people.map((person) => <PersonRow key={person.userId} person={person} />)
        )}
      </div>
    </main>
  );
}
