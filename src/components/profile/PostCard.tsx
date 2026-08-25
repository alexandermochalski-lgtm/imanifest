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

function ReplyRow({
  reply,
  handle,
  viewerId,
  returnTo,
  tab,
}: {
  reply: ProfilePost;
  handle: string;
  viewerId: string;
  returnTo?: string;
  tab: ProfileTab;
}) {
  const avatar = campusMediaHref(reply.authorAvatarUrl);
  const authorHandle = reply.authorHandle || handle;
  const isAuthor = reply.authorId === viewerId;

  return (
    <div className="mt-3 flex gap-2 border-l border-[var(--line)] pl-3">
      <Link
        href={authorHandle ? `/u/${authorHandle}` : "#"}
        className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-black text-[10px] text-gold"
      >
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt="" className="h-full w-full object-cover" src={avatar} />
        ) : (
          initialsFromName(reply.authorName || "OP")
        )}
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <Link href={`/u/${authorHandle}`} className="text-sm font-medium text-white hover:underline">
            {reply.authorName || "Student"}
          </Link>
          <span className="text-xs text-muted">@{authorHandle}</span>
          <span className="text-xs text-muted">· {formatWhen(reply.createdAt)}</span>
        </div>
        <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[var(--text-soft)]">{reply.body}</p>
        <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted">
          <form action={togglePostLike}>
            <input name="postId" type="hidden" value={reply.id} />
            <input name="handle" type="hidden" value={handle} />
            <input name="tab" type="hidden" value={tab} />
            {returnTo ? <input name="returnTo" type="hidden" value={returnTo} /> : null}
            <button className={reply.likedByMe ? "text-gold" : "hover:text-gold"} type="submit">
              {reply.likedByMe ? "Liked" : "Like"} · {reply.likeCount}
            </button>
          </form>
          {isAuthor ? (
            <form action={deleteProfilePost}>
              <input name="postId" type="hidden" value={reply.id} />
              <input name="handle" type="hidden" value={handle} />
              {returnTo ? <input name="returnTo" type="hidden" value={returnTo} /> : null}
              <button className="hover:text-red-200" type="submit">
                Delete
              </button>
            </form>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function PostCard({
  post,
  handle,
  isOwnProfile,
  viewerId,
  tab = "posts",
  pinned = false,
  returnTo,
}: {
  post: ProfilePost;
  handle: string;
  isOwnProfile: boolean;
  viewerId: string;
  tab?: ProfileTab;
  pinned?: boolean;
  returnTo?: string;
}) {
  const [replyOpen, setReplyOpen] = useState(false);
  const avatar = campusMediaHref(post.authorAvatarUrl);
  const image = campusMediaHref(post.imageUrl);
  const authorHandle = post.authorHandle || handle;
  const isAuthor = post.authorId === viewerId;
  const replies = post.replies ?? [];

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
              {returnTo ? <input name="returnTo" type="hidden" value={returnTo} /> : null}
              <button className={post.likedByMe ? "text-gold" : "hover:text-gold"} type="submit">
                {post.likedByMe ? "Liked" : "Like"} · {post.likeCount}
              </button>
            </form>
            {!post.replyToId ? (
              <button className="hover:text-gold" type="button" onClick={() => setReplyOpen((v) => !v)}>
                Reply{replies.length ? ` · ${replies.length}` : ""}
              </button>
            ) : null}
            {isOwnProfile && isAuthor && !post.replyToId ? (
              <form action={pinProfilePost}>
                <input name="postId" type="hidden" value={post.id} />
                <input name="handle" type="hidden" value={handle} />
                <input name="unpin" type="hidden" value={pinned ? "1" : "0"} />
                {returnTo ? <input name="returnTo" type="hidden" value={returnTo} /> : null}
                <button className="hover:text-gold" type="submit">
                  {pinned ? "Unpin" : "Pin"}
                </button>
              </form>
            ) : null}
            {isAuthor ? (
              <form action={deleteProfilePost}>
                <input name="postId" type="hidden" value={post.id} />
                <input name="handle" type="hidden" value={handle} />
                {returnTo ? <input name="returnTo" type="hidden" value={returnTo} /> : null}
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
              {returnTo ? <input name="returnTo" type="hidden" value={returnTo} /> : null}
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
          {replies.length ? (
            <div className="mt-2">
              {replies.map((reply) => (
                <ReplyRow key={reply.id} reply={reply} handle={handle} viewerId={viewerId} returnTo={returnTo} tab={tab} />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
