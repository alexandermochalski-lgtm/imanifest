import { opsUsers } from "@/lib/ops";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { createServerSupabase } from "@/lib/supabase/server";
import type { MessengerContact } from "@/lib/messenger";
import { listSocialDirectory, type SocialProfile } from "@/lib/social";

export type DirectoryProfile = {
  userId: string;
  name: string;
  bio: string;
  listed: boolean;
  live: boolean;
  handle?: string;
  avatarUrl?: string;
};

async function client() {
  return createAdminSupabase() ?? (await createServerSupabase());
}

export async function upsertDirectoryProfile(input: {
  userId: string;
  name: string;
  bio?: string;
  listed?: boolean;
  handle?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  location?: string;
  website?: string;
}) {
  const supabase = await client();
  if (!supabase) return;
  const existing = await loadOwnProfile(input.userId);
  const name = input.name.trim() || existing?.name || "Student";
  const bio = input.bio !== undefined ? input.bio.trim() : (existing?.bio ?? "");
  const listed = input.listed ?? existing?.listed ?? true;
  const payload: Record<string, unknown> = {
    user_id: input.userId,
    name,
    bio,
    listed,
    updated_at: new Date().toISOString(),
  };
  if (input.handle !== undefined) payload.handle = input.handle;
  if (input.avatarUrl !== undefined) payload.avatar_url = input.avatarUrl;
  if (input.bannerUrl !== undefined) payload.banner_url = input.bannerUrl;
  if (input.location !== undefined) payload.location = input.location;
  if (input.website !== undefined) payload.website = input.website;
  await supabase.from("profiles").upsert(payload, { onConflict: "user_id" });
}

export async function loadOwnProfile(userId: string): Promise<DirectoryProfile | null> {
  const supabase = await client();
  if (!supabase) return null;
  const { data } = await supabase
    .from("profiles")
    .select("user_id, name, bio, listed, handle, avatar_url")
    .eq("user_id", userId)
    .maybeSingle();
  if (!data) return null;
  return {
    userId: data.user_id,
    name: data.name,
    bio: data.bio,
    listed: data.listed,
    live: true,
    handle: (data.handle as string) ?? "",
    avatarUrl: (data.avatar_url as string) ?? "",
  };
}

export async function loadLiveProfiles(): Promise<DirectoryProfile[]> {
  const supabase = await client();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("profiles")
    .select("user_id, name, bio, listed, handle, avatar_url")
    .eq("listed", true);
  if (error || !data) return [];
  return data.map((row) => ({
    userId: row.user_id as string,
    name: row.name as string,
    bio: (row.bio as string) ?? "",
    listed: Boolean(row.listed),
    live: true,
    handle: (row.handle as string) ?? "",
    avatarUrl: (row.avatar_url as string) ?? "",
  }));
}

export async function listDirectory(selfId: string, query = ""): Promise<(MessengerContact & { handle?: string; avatarUrl?: string })[]> {
  let live: SocialProfile[] = [];
  try {
    live = await listSocialDirectory(selfId, query);
  } catch {
    live = [];
  }
  const byId = new Map<string, MessengerContact & { handle?: string; avatarUrl?: string }>();
  for (const profile of live) {
    if (profile.userId === selfId) continue;
    byId.set(profile.userId, {
      id: profile.userId,
      name: profile.name,
      kind: "peer",
      subtitle: profile.bio || (profile.handle ? `@${profile.handle}` : "Campus seat"),
      handle: profile.handle,
      avatarUrl: profile.avatarUrl,
    });
  }
  for (const user of opsUsers) {
    if (user.role !== "student" || user.id === selfId || user.status !== "active") continue;
    if (byId.has(user.id)) continue;
    const needle = query.trim().toLowerCase().replace(/^@/, "");
    const hay = `${user.name} ${user.username} ${user.bio}`.toLowerCase();
    if (needle && !hay.includes(needle)) continue;
    byId.set(user.id, {
      id: user.id,
      name: user.name,
      kind: "peer",
      subtitle: `${user.bio} · sample seat`,
      handle: user.username,
      avatarUrl: "",
    });
  }
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export async function findDirectoryContact(id: string, selfId: string): Promise<(MessengerContact & { handle?: string }) | undefined> {
  const all = await listDirectory(selfId);
  return all.find((item) => item.id === id);
}
