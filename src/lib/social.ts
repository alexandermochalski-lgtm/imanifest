import { createAdminSupabase } from "@/lib/supabase/admin";
import { createServerSupabase } from "@/lib/supabase/server";

export type SocialProfile = {
  userId: string;
  name: string;
  handle: string;
  bio: string;
  listed: boolean;
  avatarUrl: string;
  bannerUrl: string;
  location: string;
  website: string;
  pinnedPostId: string | null;
  createdAt: string;
  updatedAt: string;
  live: boolean;
};

export type ProfilePost = {
  id: string;
  authorId: string;
  body: string;
  imageUrl: string;
  replyToId: string | null;
  createdAt: string;
  likeCount: number;
  likedByMe: boolean;
  authorName?: string;
  authorHandle?: string;
  authorAvatarUrl?: string;
};

export type ProfileTab = "posts" | "replies" | "media" | "likes";

export const HANDLE_RE = /^[a-z0-9_]{3,24}$/;
export const MAX_POST_LEN = 280;

async function client() {
  return createAdminSupabase() ?? (await createServerSupabase());
}

function mapProfile(row: Record<string, unknown>): SocialProfile {
  return {
    userId: String(row.user_id),
    name: String(row.name ?? "Student"),
    handle: String(row.handle ?? ""),
    bio: String(row.bio ?? ""),
    listed: Boolean(row.listed),
    avatarUrl: String(row.avatar_url ?? ""),
    bannerUrl: String(row.banner_url ?? ""),
    location: String(row.location ?? ""),
    website: String(row.website ?? ""),
    pinnedPostId: row.pinned_post_id ? String(row.pinned_post_id) : null,
    createdAt: String(row.created_at ?? row.updated_at ?? ""),
    updatedAt: String(row.updated_at ?? ""),
    live: true,
  };
}

export function normalizeHandle(raw: string) {
  return raw.trim().toLowerCase().replace(/^@/, "").replace(/[^a-z0-9_]/g, "").slice(0, 24);
}

export function suggestHandle(seed: string) {
  const base = normalizeHandle(seed.split("@")[0] || seed || "operator") || "operator";
  return base.length >= 3 ? base : `${base}ops`.slice(0, 24);
}

export function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "OP";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function mapPost(
  row: Record<string, unknown>,
  likeCount: number,
  likedByMe: boolean,
  author?: Pick<SocialProfile, "name" | "handle" | "avatarUrl">,
): ProfilePost {
  return {
    id: String(row.id),
    authorId: String(row.author_id),
    body: String(row.body ?? ""),
    imageUrl: String(row.image_url ?? ""),
    replyToId: row.reply_to_id ? String(row.reply_to_id) : null,
    createdAt: String(row.created_at ?? ""),
    likeCount,
    likedByMe,
    authorName: author?.name,
    authorHandle: author?.handle,
    authorAvatarUrl: author?.avatarUrl,
  };
}

export async function getProfileByUserId(userId: string): Promise<SocialProfile | null> {
  const supabase = await client();
  if (!supabase) return null;
  const { data } = await supabase
    .from("profiles")
    .select(
      "user_id, name, handle, bio, listed, avatar_url, banner_url, location, website, pinned_post_id, created_at, updated_at",
    )
    .eq("user_id", userId)
    .maybeSingle();
  if (!data) return null;
  return mapProfile(data as Record<string, unknown>);
}

export async function getProfileByHandle(handle: string): Promise<SocialProfile | null> {
  const normalized = normalizeHandle(handle);
  if (!normalized) return null;
  const supabase = await client();
  if (!supabase) return null;
  const { data } = await supabase
    .from("profiles")
    .select(
      "user_id, name, handle, bio, listed, avatar_url, banner_url, location, website, pinned_post_id, created_at, updated_at",
    )
    .ilike("handle", normalized)
    .maybeSingle();
  if (!data) return null;
  return mapProfile(data as Record<string, unknown>);
}

export async function isHandleTaken(handle: string, exceptUserId?: string) {
  const normalized = normalizeHandle(handle);
  if (!HANDLE_RE.test(normalized)) return true;
  const supabase = await client();
  if (!supabase) return false;
  const { data } = await supabase.from("profiles").select("user_id, handle").ilike("handle", normalized).maybeSingle();
  if (!data) return false;
  if (exceptUserId && data.user_id === exceptUserId) return false;
  return true;
}

/** Ensure the viewer has a profile row + handle (auto-claim from seed). */
export async function ensureProfileHandle(input: {
  userId: string;
  name: string;
  email?: string;
}): Promise<SocialProfile> {
  const existing = await getProfileByUserId(input.userId);
  if (existing?.handle) return existing;

  const supabase = await client();
  const base = suggestHandle(input.email || input.name || "operator");
  let handle = base;
  let n = 0;
  while (await isHandleTaken(handle, input.userId)) {
    n += 1;
    handle = `${base.slice(0, 20)}${n}`.slice(0, 24);
    if (n > 50) {
      handle = `op${Date.now().toString(36).slice(-8)}`;
      break;
    }
  }

  if (!supabase) {
    return {
      userId: input.userId,
      name: input.name || "Student",
      handle,
      bio: existing?.bio ?? "",
      listed: existing?.listed ?? true,
      avatarUrl: "",
      bannerUrl: "",
      location: "",
      website: "",
      pinnedPostId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      live: false,
    };
  }

  const payload = {
    user_id: input.userId,
    name: (existing?.name || input.name || "Student").trim(),
    bio: existing?.bio ?? "",
    listed: existing?.listed ?? true,
    handle,
    avatar_url: existing?.avatarUrl ?? "",
    banner_url: existing?.bannerUrl ?? "",
    location: existing?.location ?? "",
    website: existing?.website ?? "",
    pinned_post_id: existing?.pinnedPostId ?? null,
    updated_at: new Date().toISOString(),
  };
  await supabase.from("profiles").upsert(payload, { onConflict: "user_id" });
  const saved = await getProfileByUserId(input.userId);
  return (
    saved ?? {
      userId: input.userId,
      name: payload.name,
      handle,
      bio: payload.bio,
      listed: payload.listed,
      avatarUrl: "",
      bannerUrl: "",
      location: "",
      website: "",
      pinnedPostId: null,
      createdAt: new Date().toISOString(),
      updatedAt: payload.updated_at,
      live: true,
    }
  );
}

export async function updateSocialProfile(input: {
  userId: string;
  name: string;
  handle: string;
  bio?: string;
  listed?: boolean;
  location?: string;
  website?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  pinnedPostId?: string | null;
}) {
  const handle = normalizeHandle(input.handle);
  if (!HANDLE_RE.test(handle)) {
    return { ok: false as const, error: "handle_invalid" };
  }
  if (await isHandleTaken(handle, input.userId)) {
    return { ok: false as const, error: "handle_taken" };
  }

  const supabase = await client();
  if (!supabase) return { ok: false as const, error: "unavailable" };

  const existing = await getProfileByUserId(input.userId);
  const website = (input.website ?? existing?.website ?? "").trim();
  const websiteOk =
    !website ||
    /^https?:\/\//i.test(website) ||
    /^[a-z0-9.-]+\.[a-z]{2,}/i.test(website);

  if (!websiteOk) return { ok: false as const, error: "website_invalid" };

  const normalizedWebsite = website
    ? /^https?:\/\//i.test(website)
      ? website
      : `https://${website}`
    : "";

  await supabase.from("profiles").upsert(
    {
      user_id: input.userId,
      name: input.name.trim() || existing?.name || "Student",
      handle,
      bio: input.bio !== undefined ? input.bio.trim() : (existing?.bio ?? ""),
      listed: input.listed ?? existing?.listed ?? true,
      location: input.location !== undefined ? input.location.trim() : (existing?.location ?? ""),
      website: input.website !== undefined ? normalizedWebsite : (existing?.website ?? ""),
      avatar_url: input.avatarUrl !== undefined ? input.avatarUrl : (existing?.avatarUrl ?? ""),
      banner_url: input.bannerUrl !== undefined ? input.bannerUrl : (existing?.bannerUrl ?? ""),
      pinned_post_id:
        input.pinnedPostId !== undefined ? input.pinnedPostId : (existing?.pinnedPostId ?? null),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  return { ok: true as const, handle };
}

export async function followCounts(userId: string) {
  const supabase = await client();
  if (!supabase) return { followers: 0, following: 0 };
  const [{ count: followers }, { count: following }] = await Promise.all([
    supabase.from("profile_follows").select("*", { count: "exact", head: true }).eq("following_id", userId),
    supabase.from("profile_follows").select("*", { count: "exact", head: true }).eq("follower_id", userId),
  ]);
  return { followers: followers ?? 0, following: following ?? 0 };
}

export async function postCount(userId: string) {
  const supabase = await client();
  if (!supabase) return 0;
  const { count } = await supabase
    .from("profile_posts")
    .select("*", { count: "exact", head: true })
    .eq("author_id", userId)
    .is("reply_to_id", null);
  return count ?? 0;
}

export async function isFollowing(followerId: string, followingId: string) {
  if (!followerId || !followingId || followerId === followingId) return false;
  const supabase = await client();
  if (!supabase) return false;
  const { data } = await supabase
    .from("profile_follows")
    .select("follower_id")
    .eq("follower_id", followerId)
    .eq("following_id", followingId)
    .maybeSingle();
  return Boolean(data);
}

export async function followUser(followerId: string, followingId: string) {
  if (followerId === followingId) return false;
  const supabase = await client();
  if (!supabase) return false;
  await supabase.from("profile_follows").upsert(
    { follower_id: followerId, following_id: followingId, created_at: new Date().toISOString() },
    { onConflict: "follower_id,following_id" },
  );
  return true;
}

export async function unfollowUser(followerId: string, followingId: string) {
  const supabase = await client();
  if (!supabase) return false;
  await supabase.from("profile_follows").delete().eq("follower_id", followerId).eq("following_id", followingId);
  return true;
}

export async function listFollowers(userId: string): Promise<SocialProfile[]> {
  const supabase = await client();
  if (!supabase) return [];
  const { data } = await supabase.from("profile_follows").select("follower_id").eq("following_id", userId);
  if (!data?.length) return [];
  const ids = data.map((row) => row.follower_id as string);
  return loadProfilesByIds(ids);
}

export async function listFollowing(userId: string): Promise<SocialProfile[]> {
  const supabase = await client();
  if (!supabase) return [];
  const { data } = await supabase.from("profile_follows").select("following_id").eq("follower_id", userId);
  if (!data?.length) return [];
  const ids = data.map((row) => row.following_id as string);
  return loadProfilesByIds(ids);
}

async function loadProfilesByIds(ids: string[]): Promise<SocialProfile[]> {
  const supabase = await client();
  if (!supabase || !ids.length) return [];
  const { data } = await supabase
    .from("profiles")
    .select(
      "user_id, name, handle, bio, listed, avatar_url, banner_url, location, website, pinned_post_id, created_at, updated_at",
    )
    .in("user_id", ids);
  if (!data) return [];
  const mapped = data.map((row) => mapProfile(row as Record<string, unknown>));
  const order = new Map(ids.map((id, i) => [id, i]));
  return mapped.sort((a, b) => (order.get(a.userId) ?? 0) - (order.get(b.userId) ?? 0));
}

async function likeMeta(postIds: string[], viewerId?: string) {
  const supabase = await client();
  const counts = new Map<string, number>();
  const liked = new Set<string>();
  if (!supabase || !postIds.length) return { counts, liked };

  const { data: likeRows } = await supabase.from("profile_post_likes").select("post_id, user_id").in("post_id", postIds);
  for (const row of likeRows ?? []) {
    const id = String(row.post_id);
    counts.set(id, (counts.get(id) ?? 0) + 1);
    if (viewerId && row.user_id === viewerId) liked.add(id);
  }
  return { counts, liked };
}

async function attachAuthors(posts: ProfilePost[]): Promise<ProfilePost[]> {
  const ids = [...new Set(posts.map((p) => p.authorId))];
  const profiles = await loadProfilesByIds(ids);
  const byId = new Map(profiles.map((p) => [p.userId, p]));
  return posts.map((post) => {
    const author = byId.get(post.authorId);
    return {
      ...post,
      authorName: author?.name ?? post.authorName,
      authorHandle: author?.handle ?? post.authorHandle,
      authorAvatarUrl: author?.avatarUrl ?? post.authorAvatarUrl,
    };
  });
}

export async function createPost(input: {
  authorId: string;
  body: string;
  imageUrl?: string;
  replyToId?: string | null;
}) {
  const body = input.body.trim();
  if (!body || body.length > MAX_POST_LEN) return { ok: false as const, error: "invalid" };
  const supabase = await client();
  if (!supabase) return { ok: false as const, error: "unavailable" };
  const id = `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  const { error } = await supabase.from("profile_posts").insert({
    id,
    author_id: input.authorId,
    body,
    image_url: (input.imageUrl ?? "").trim(),
    reply_to_id: input.replyToId || null,
    created_at: new Date().toISOString(),
  });
  if (error) return { ok: false as const, error: "insert" };
  return { ok: true as const, id };
}

export async function deletePost(authorId: string, postId: string) {
  const supabase = await client();
  if (!supabase) return false;
  const { error } = await supabase.from("profile_posts").delete().eq("id", postId).eq("author_id", authorId);
  if (error) return false;
  // Clear pin if needed
  await supabase.from("profiles").update({ pinned_post_id: null }).eq("user_id", authorId).eq("pinned_post_id", postId);
  return true;
}

export async function toggleLike(userId: string, postId: string) {
  const supabase = await client();
  if (!supabase) return { ok: false as const, liked: false };
  const { data } = await supabase
    .from("profile_post_likes")
    .select("post_id")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .maybeSingle();
  if (data) {
    await supabase.from("profile_post_likes").delete().eq("post_id", postId).eq("user_id", userId);
    return { ok: true as const, liked: false };
  }
  await supabase.from("profile_post_likes").insert({
    post_id: postId,
    user_id: userId,
    created_at: new Date().toISOString(),
  });
  return { ok: true as const, liked: true };
}

export async function setPinnedPost(userId: string, postId: string | null) {
  const supabase = await client();
  if (!supabase) return false;
  if (postId) {
    const { data } = await supabase.from("profile_posts").select("id, author_id").eq("id", postId).maybeSingle();
    if (!data || data.author_id !== userId) return false;
  }
  await supabase.from("profiles").update({ pinned_post_id: postId, updated_at: new Date().toISOString() }).eq("user_id", userId);
  return true;
}

export async function getPostById(postId: string, viewerId?: string): Promise<ProfilePost | null> {
  const supabase = await client();
  if (!supabase) return null;
  const { data } = await supabase.from("profile_posts").select("*").eq("id", postId).maybeSingle();
  if (!data) return null;
  const { counts, liked } = await likeMeta([postId], viewerId);
  const [enriched] = await attachAuthors([mapPost(data as Record<string, unknown>, counts.get(postId) ?? 0, liked.has(postId))]);
  return enriched ?? null;
}

export async function listPosts(input: {
  authorId: string;
  tab: ProfileTab;
  viewerId?: string;
  pinnedPostId?: string | null;
}): Promise<{ posts: ProfilePost[]; pinned: ProfilePost | null }> {
  const supabase = await client();
  if (!supabase) return { posts: [], pinned: null };

  let rows: Record<string, unknown>[] = [];

  if (input.tab === "likes") {
    const { data: likeRows } = await supabase
      .from("profile_post_likes")
      .select("post_id, created_at")
      .eq("user_id", input.authorId)
      .order("created_at", { ascending: false })
      .limit(40);
    const ids = (likeRows ?? []).map((r) => r.post_id as string);
    if (ids.length) {
      const { data } = await supabase.from("profile_posts").select("*").in("id", ids);
      const order = new Map(ids.map((id, i) => [id, i]));
      rows = ((data ?? []) as Record<string, unknown>[]).sort(
        (a, b) => (order.get(String(a.id)) ?? 0) - (order.get(String(b.id)) ?? 0),
      );
    }
  } else if (input.tab === "replies") {
    const { data } = await supabase
      .from("profile_posts")
      .select("*")
      .eq("author_id", input.authorId)
      .not("reply_to_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(40);
    rows = (data ?? []) as Record<string, unknown>[];
  } else if (input.tab === "media") {
    const { data } = await supabase
      .from("profile_posts")
      .select("*")
      .eq("author_id", input.authorId)
      .neq("image_url", "")
      .order("created_at", { ascending: false })
      .limit(40);
    rows = (data ?? []) as Record<string, unknown>[];
  } else {
    const { data } = await supabase
      .from("profile_posts")
      .select("*")
      .eq("author_id", input.authorId)
      .is("reply_to_id", null)
      .order("created_at", { ascending: false })
      .limit(40);
    rows = (data ?? []) as Record<string, unknown>[];
  }

  const ids = rows.map((r) => String(r.id));
  const { counts, liked } = await likeMeta(ids, input.viewerId);
  let posts = await attachAuthors(
    rows.map((row) => mapPost(row, counts.get(String(row.id)) ?? 0, liked.has(String(row.id)))),
  );

  let pinned: ProfilePost | null = null;
  if (input.tab === "posts" && input.pinnedPostId) {
    pinned = await getPostById(input.pinnedPostId, input.viewerId);
    if (pinned) {
      posts = posts.filter((p) => p.id !== pinned!.id);
    }
  }

  return { posts, pinned };
}

/** Directory-friendly list with handles for search. */
export async function listSocialDirectory(selfId: string, query = ""): Promise<SocialProfile[]> {
  const supabase = await client();
  if (!supabase) return [];
  const { data } = await supabase
    .from("profiles")
    .select(
      "user_id, name, handle, bio, listed, avatar_url, banner_url, location, website, pinned_post_id, created_at, updated_at",
    )
    .eq("listed", true);
  if (!data) return [];
  const needle = query.trim().toLowerCase().replace(/^@/, "");
  return data
    .map((row) => mapProfile(row as Record<string, unknown>))
    .filter((p) => p.userId !== selfId)
    .filter(
      (p) =>
        !needle ||
        `${p.name} ${p.handle} ${p.bio} ${p.location}`.toLowerCase().includes(needle),
    )
    .sort((a, b) => a.name.localeCompare(b.name));
}
