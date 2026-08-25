import Link from "next/link";
import { Flash } from "@/components/ui";
import { PostCard } from "@/components/profile/PostCard";
import { PostComposer } from "@/components/profile/PostComposer";
import { getSession } from "@/lib/session";
import { ensureProfileHandle, listCampusFeed } from "@/lib/social";

export default async function CampusFeedPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; error?: string }>;
}) {
  const { tab: tabRaw, error } = await searchParams;
  const session = await getSession();
  if (!session) return null;

  const mode = tabRaw === "following" ? "following" : "campus";
  const profile = await ensureProfileHandle({
    userId: session.userId,
    name: session.name,
    email: session.email,
  });
  const posts = await listCampusFeed({ viewerId: session.userId, mode });
  const feedPath = mode === "following" ? "/campus/feed?tab=following" : "/campus/feed";

  return (
    <main className="mx-auto max-w-2xl">
      <p className="text-xs uppercase tracking-[0.2em] text-gold-deep">Campus</p>
      <h1 className="mt-2 font-[family-name:var(--font-cormorant)] text-4xl text-white">Feed</h1>
      <p className="mt-3 text-sm text-muted">
        Posts from campus seats. Follow operators you want on your Following tab — or open anyone from the{" "}
        <Link className="text-gold" href="/directory">
          directory
        </Link>
        .
      </p>

      <Flash
        error={error}
        map={{
          post_invalid: "Post must be 1–280 characters.",
          post_unavailable: "Could not publish — profile storage may be offline.",
          post_insert: "Could not publish — try again.",
        }}
      />

      <nav className="mt-6 flex border-b border-[var(--line)]">
        <Link
          href="/campus/feed"
          className={`flex-1 px-2 py-3 text-center text-sm ${
            mode === "campus" ? "border-b-2 border-gold font-medium text-white" : "text-muted hover:text-white"
          }`}
        >
          Campus
        </Link>
        <Link
          href="/campus/feed?tab=following"
          className={`flex-1 px-2 py-3 text-center text-sm ${
            mode === "following" ? "border-b-2 border-gold font-medium text-white" : "text-muted hover:text-white"
          }`}
        >
          Following
        </Link>
      </nav>

      <div className="mt-4">
        <PostComposer handle={profile.handle} returnTo={feedPath} placeholder="Share something with campus…" />
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--panel)]">
        {posts.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted">
            {mode === "following"
              ? "No posts from people you follow yet. Open Directory and follow a few seats."
              : "No campus posts yet. Be the first."}
          </p>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              handle={post.authorHandle || profile.handle}
              isOwnProfile={post.authorId === session.userId}
              viewerId={session.userId}
              returnTo={feedPath}
            />
          ))
        )}
      </div>
    </main>
  );
}
