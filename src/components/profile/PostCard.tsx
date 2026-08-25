"use client";

import Link from "next/link";
import { useState } from "react";
import { createProfilePost, deleteProfilePost, pinProfilePost, togglePostLike } from "@/app/actions/social";
import { campusMediaHref } from "@/lib/blob-access";
import { initialsFromName, MAX_POST_LEN, type ProfilePost, type ProfileTab } from "@/lib/social-shared";

function formatWhen(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function PostCard({
  post,
  handle,
  isOwnProfile,
  viewerId,
  tab = "posts",
  pinned = false,
}: {
  post: ProfilePost;
  handle: string;
  isOwnProfile: boolean;
  viewerId: string;
  tab?: ProfileTab;
  pinned?: boolean;
}) {
  const [replyOpen, setReplyOpen] = useState(false);
  const avatar = campusMediaHref(post.authorAvatarUrl);
  const image = campusMediaHref(post.imageUrl);
  const authorHandle = post.authorHandle || handle;
  const isAuthor = post.authorId === viewerId;

  return (
    <article className="border-b border-[var(--line)] px-4 py-4 md:px-5">
      {pinned ? <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-gold">Pinned</p> : null}
      <div className="flex gap-3">
        <Link
          href={authorHandle ? `/u/${authorHandle}` : "#"}
          className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-black text-xs text-gold"
        >
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt="" className="h-full w-full object-cover" src={avatar} />
          ) : (
            initialsFromName(post.authorName || "OP")
          )}
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <Link href={`/u/${authorHandle}`} className="font-medium text-white hover:underline">
              {post.authorName || "Student"}
            </Link>
            <span className="text-sm text-muted">@{authorHandle}</span>
            <span className="text-sm text-muted">· {formatWhen(post.createdAt)}</span>
          </div>
          {post.replyToId ? <p className="mt-1 text-xs text-muted">Replying</p> : null}
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[var(--text-soft)]">{post.body}</p>
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt="" className="mt-3 max-h-80 w-full rounded-2xl border border-[var(--line)] object-cover" src={image} />
          ) : null}
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted">
            <form action={togglePostLike}>
              <input name="postId" type="hidden" value={post.id} />
              <input name="handle" type="hidden" value={handle} />
              <input name="tab" type="hidden" value={tab} />
              <button className={post.likedByMe ? "text-gold" : "hover:text-gold"} type="submit">
                {post.likedByMe ? "Liked" : "Like"} · {post.likeCount}
              </button>
            </form>
            {!post.replyToId ? (
              <button className="hover:text-gold" type="button" onClick={() => setReplyOpen((v) => !v)}>
                Reply
              </button>
            ) : null}
            {isOwnProfile && isAuthor && !post.replyToId ? (
              <form action={pinProfilePost}>
                <input name="postId" type="hidden" value={post.id} />
                <input name="handle" type="hidden" value={handle} />
                <input name="unpin" type="hidden" value={pinned ? "1" : "0"} />
                <button className="hover:text-gold" type="submit">
                  {pinned ? "Unpin" : "Pin"}
                </button>
              </form>
            ) : null}
            {isAuthor ? (
              <form action={deleteProfilePost}>
                <input name="postId" type="hidden" value={post.id} />
                <input name="handle" type="hidden" value={handle} />
                <button className="hover:text-red-200" type="submit">
                  Delete
                </button>
              </form>
            ) : null}
          </div>
          {replyOpen ? (
            <form action={createProfilePost} className="mt-3 space-y-2">
              <input name="handle" type="hidden" value={handle} />
              <input name="replyToId" type="hidden" value={post.id} />
              <textarea
                name="body"
                required
                maxLength={MAX_POST_LEN}
                rows={2}
                placeholder="Post your reply"
                className="w-full rounded-xl border border-[var(--line)] bg-black/30 px-3 py-2 text-sm text-white"
              />
              <button className="gold-btn rounded-full px-4 py-1.5 text-[11px]" type="submit">
                Reply
              </button>
            </form>
          ) : null}
        </div>
      </div>
    </article>
  );
}
