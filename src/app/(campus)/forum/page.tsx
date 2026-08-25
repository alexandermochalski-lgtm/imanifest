import Link from "next/link";
import { likeForum } from "@/app/actions/campus";
import { categories, seedForum } from "@/lib/catalog";
import { getProfileByUserId } from "@/lib/social";
import { getState } from "@/lib/state";

export default async function ForumPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const state = await getState();
  const merged = [...state.forumPosts, ...seedForum.filter((post) => !state.forumPosts.some((item) => item.slug === post.slug))];
  const posts = merged.filter((post) => !category || post.category === category);
  const handles = new Map<string, string>();
  await Promise.all(
    [...new Set(posts.map((p) => p.authorId))].map(async (id) => {
      try {
        const profile = await getProfileByUserId(id);
        if (profile?.handle) handles.set(id, profile.handle);
      } catch {
        /* ignore */
      }
    }),
  );
  return (
    <main>
      <div className="flex items-end justify-between">
        <h1 className="font-[family-name:var(--font-cormorant)] text-4xl text-white">Forum</h1>
        <Link href="/forum/new" className="text-sm text-gold">
          New post
        </Link>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <Link href="/forum" className="text-gold">
          All
        </Link>
        {categories.map((item) => (
          <Link key={item.slug} href={`/forum?category=${item.slug}`} className="text-muted hover:text-gold">
            {item.label}
          </Link>
        ))}
      </div>
      <div className="mt-8 space-y-4">
        {posts.map((post) => {
          const handle = handles.get(post.authorId);
          return (
            <article key={post.id} className="rounded-2xl border border-[var(--line)] bg-panel p-5">
              <Link href={`/forum/${post.slug}`} className="text-xl text-white">
                {post.title}
              </Link>
              <p className="mt-1 text-xs text-gold">
                {handle ? (
                  <Link href={`/u/${handle}`} className="hover:text-white">
                    {post.authorName}
                  </Link>
                ) : (
                  post.authorName
                )}{" "}
                · {post.category} · {post.replies.length} replies · {state.likedForum.includes(post.id) ? "liked" : ""}
              </p>
              <form action={likeForum.bind(null, post.id, post.slug)} className="mt-3">
                <button className="text-sm text-gold" type="submit">
                  {state.likedForum.includes(post.id) ? "Unlike" : "Like"}
                </button>
              </form>
            </article>
          );
        })}
      </div>
    </main>
  );
}
