import Link from "next/link";
import { notFound } from "next/navigation";
import { Flash } from "@/components/ui";
import { PostCard } from "@/components/profile/PostCard";
import { PostComposer } from "@/components/profile/PostComposer";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { studentRank } from "@/lib/ranks";
import { getSession } from "@/lib/session";
import {
  followCounts,
  getProfileByHandle,
  isFollowing,
  listPosts,
  postCount,
  type ProfileTab,
} from "@/lib/social";
import { getState } from "@/lib/state";

const TABS: ProfileTab[] = ["posts", "replies", "media", "likes"];

export default async function UserProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ tab?: string; ok?: string; error?: string }>;
}) {
  const { handle: raw } = await params;
  const { tab: tabRaw, ok, error } = await searchParams;
  const session = await getSession();
  if (!session) return null;

  const profile = await getProfileByHandle(raw);
  if (!profile) notFound();
  if (!profile.listed && profile.userId !== session.userId) notFound();

  const tab = (TABS.includes(tabRaw as ProfileTab) ? tabRaw : "posts") as ProfileTab;
  const isOwn = profile.userId === session.userId;
  const state = await getState();

  const [counts, postsTotal, followingThem, feed] = await Promise.all([
    followCounts(profile.userId),
    postCount(profile.userId),
    isOwn ? Promise.resolve(false) : isFollowing(session.userId, profile.userId),
    listPosts({
      authorId: profile.userId,
      tab,
      viewerId: session.userId,
      pinnedPostId: profile.pinnedPostId,
    }),
  ]);

  return (
    <main className="mx-auto max-w-2xl">
      <Flash
        ok={ok}
        error={error}
        map={{
          "1": "Profile updated.",
          handle_invalid: "Handle must be 3–24 characters (letters, numbers, underscore).",
          handle_taken: "That handle is taken.",
          website_invalid: "Website looks invalid.",
          unavailable: "Profile storage is offline — try again shortly.",
          post_invalid: "Post must be 1–280 characters.",
          post_unavailable: "Could not publish — try again.",
          post_insert: "Could not publish — try again.",
        }}
      />

      <ProfileHeader
        profile={profile}
        isOwn={isOwn}
        phone={isOwn ? state.profile.phone : ""}
        following={counts.following}
        followers={counts.followers}
        posts={postsTotal}
        isFollowing={followingThem}
        rank={isOwn ? studentRank(state) : undefined}
      />

      <ProfileTabs handle={profile.handle} active={tab} />

      {isOwn && tab === "posts" ? (
        <div className="mt-4">
          <PostComposer handle={profile.handle} />
        </div>
      ) : null}

      <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--panel)]">
        {feed.pinned ? (
          <PostCard
            post={feed.pinned}
            handle={profile.handle}
            isOwnProfile={isOwn}
            viewerId={session.userId}
            tab={tab}
            pinned
          />
        ) : null}
        {feed.posts.length === 0 && !feed.pinned ? (
          <p className="px-5 py-10 text-center text-sm text-muted">
            {tab === "posts" ? "No posts yet." : `No ${tab} yet.`}
          </p>
        ) : null}
        {feed.posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            handle={profile.handle}
            isOwnProfile={isOwn}
            viewerId={session.userId}
            tab={tab}
          />
        ))}
      </div>

      {isOwn && tab === "replies" ? (
        <p className="mt-4 text-center text-xs text-muted">
          Reply from another student&apos;s post, or open{" "}
          <Link className="text-gold" href="/forum">
            Forum
          </Link>{" "}
          for threaded desks.
        </p>
      ) : null}
    </main>
  );
}
