import { notFound } from "next/navigation";
import { likeForum, replyForum } from "@/app/actions/campus";
import { GoldButton } from "@/components/ui";
import { seedForum } from "@/lib/catalog";
import { getState } from "@/lib/state";

export default async function ForumDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const state = await getState();
  const post =
    state.forumPosts.find((item) => item.slug === slug) ??
    seedForum.find((item) => item.slug === slug);
  if (!post) notFound();
  return (
    <main>
      <p className="text-xs text-gold">
        {post.authorName} · {post.category} · {post.createdAt}
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-cormorant)] text-4xl text-white">{post.title}</h1>
      <p className="mt-6 max-w-2xl leading-8 text-muted">{post.body}</p>
      <form action={likeForum.bind(null, post.id, post.slug)} className="mt-4">
        <button className="text-sm text-gold" type="submit">
          {state.likedForum.includes(post.id) ? "Unlike" : "Like"}
        </button>
      </form>
      <h2 className="mt-10 text-xl text-white">Replies</h2>
      <div className="mt-4 space-y-3">
        {post.replies.map((reply) => (
          <article key={reply.id} className="rounded-xl border border-[var(--line)] p-4 text-sm text-muted">
            <p className="text-gold">
              {reply.authorName} · {reply.createdAt}
            </p>
            <p className="mt-2">{reply.body}</p>
          </article>
        ))}
      </div>
      <form action={replyForum} className="mt-6 max-w-xl space-y-3">
        <input type="hidden" name="slug" value={post.slug} />
        <textarea name="body" rows={4} placeholder="Reply..." className="w-full rounded-xl border border-[var(--line)] bg-black/40 px-3 py-2" />
        <GoldButton type="submit">Reply</GoldButton>
      </form>
    </main>
  );
}
