import { notFound } from "next/navigation";
import Link from "next/link";
import { likeForum, replyForum } from "@/app/actions/campus";
import { Flash, GoldButton } from "@/components/ui";
import { campusMediaHref } from "@/lib/blob-access";
import { seedForum } from "@/lib/catalog";
import { getProfileByUserId } from "@/lib/social";
import { getState } from "@/lib/state";

export default async function ForumDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const { slug } = await params;
  const { ok, error } = await searchParams;
  const state = await getState();
  const post =
    state.forumPosts.find((item) => item.slug === slug) ??
    seedForum.find((item) => item.slug === slug);
  if (!post) notFound();
  const imageSrc = campusMediaHref(post.imageUrl);
  let authorHandle = "";
  try {
    const profile = await getProfileByUserId(post.authorId);
    authorHandle = profile?.handle ?? "";
  } catch {
    authorHandle = "";
  }
  return (
    <main>
      <p className="text-xs text-gold">
        {authorHandle ? (
          <Link href={`/u/${authorHandle}`} className="hover:text-white">
            {post.authorName}
          </Link>
        ) : (
          post.authorName
        )}{" "}
        · {post.category} · {post.createdAt}
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-cormorant)] text-4xl text-white">{post.title}</h1>
      <p className="mt-6 max-w-2xl imu-prose leading-8 text-muted">{post.body}</p>
      {imageSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt=""
          className="mt-6 max-h-96 w-full max-w-2xl rounded-2xl border border-[var(--line)] object-contain"
          src={imageSrc}
        />
      ) : null}
      <div className="mt-4">
        <Flash
          error={error}
          map={{
            replied: "Reply posted.",
            empty: "Write a reply before sending.",
            photo: "Posted with photo — field coins credited.",
          }}
          ok={ok}
        />
      </div>
      <form action={likeForum.bind(null, post.id, post.slug)} className="mt-4">
        <button className="text-sm text-gold" type="submit">
          {state.likedForum.includes(post.id) ? "Unlike" : "Like"}
        </button>
      </form>
      <h2 className="mt-10 text-xl text-white">Replies</h2>
      <div className="mt-4 space-y-3">
        {post.replies.length === 0 ? <p className="text-sm text-muted">No replies yet.</p> : null}
        {post.replies.map((reply) => (
          <article key={reply.id} className="rounded-xl border border-[var(--line)] p-4 text-sm text-muted">
            <p className="text-gold">
              {reply.authorName} · {reply.createdAt}
            </p>
            <p className="mt-2 imu-prose">{reply.body}</p>
          </article>
        ))}
      </div>
      <form action={replyForum} className="mt-6 max-w-xl space-y-3">
        <input type="hidden" name="slug" value={post.slug} />
        <textarea
          name="body"
          rows={4}
          required
          minLength={2}
          placeholder="Reply..."
          className="w-full rounded-xl border border-[var(--line)] bg-black/40 px-3 py-2"
        />
        <GoldButton pendingLabel="Posting…" type="submit">
          Reply
        </GoldButton>
      </form>
    </main>
  );
}
