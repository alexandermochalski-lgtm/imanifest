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
  replies?: ProfilePost[];
};

export type ProfileTab = "posts" | "replies" | "media" | "likes";

export const HANDLE_RE = /^[a-z0-9_]{3,24}$/;
export const MAX_POST_LEN = 280;

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
