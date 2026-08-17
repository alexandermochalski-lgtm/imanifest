import { opsUsers } from "@/lib/ops";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { createServerSupabase } from "@/lib/supabase/server";
import type { MessengerContact } from "@/lib/messenger";

export type DirectoryProfile = {
  userId: string;
  name: string;
  bio: string;
  listed: boolean;
  live: boolean;
};

async function client() {
  return createAdminSupabase() ?? (await createServerSupabase());
}

export async function upsertDirectoryProfile(input: {
  userId: string;
  name: string;
  bio?: string;
  listed?: boolean;
}) {
  const supabase = await client();
  if (!supabase) return;
  const existing = await loadOwnProfile(input.userId);
  const name = input.name.trim() || existing?.name || "Student";
  const bio = input.bio !== undefined ? input.bio.trim() : (existing?.bio ?? "");
  const listed = input.listed ?? existing?.listed ?? true;
  await supabase.from("profiles").upsert(
    {
      user_id: input.userId,
      name,
      bio,
      listed,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
}

export async function loadOwnProfile(userId: string): Promise<DirectoryProfile | null> {
  const supabase = await client();
  if (!supabase) return null;
  const { data } = await supabase.from("profiles").select("user_id, name, bio, listed").eq("user_id", userId).maybeSingle();
  if (!data) return null;
  return { userId: data.user_id, name: data.name, bio: data.bio, listed: data.listed, live: true };
}

export async function loadLiveProfiles(): Promise<DirectoryProfile[]> {
  const supabase = await client();
  if (!supabase) return [];
  const { data, error } = await supabase.from("profiles").select("user_id, name, bio, listed").eq("listed", true);
  if (error || !data) return [];
  return data.map((row) => ({
    userId: row.user_id as string,
    name: row.name as string,
    bio: (row.bio as string) ?? "",
    listed: Boolean(row.listed),
    live: true,
  }));
}

export async function listDirectory(selfId: string, query = ""): Promise<MessengerContact[]> {
  let live: DirectoryProfile[] = [];
  try {
    live = await loadLiveProfiles();
  } catch {
    live = [];
  }
  const byId = new Map<string, MessengerContact>();
  for (const profile of live) {
    if (profile.userId === selfId) continue;
    byId.set(profile.userId, {
      id: profile.userId,
      name: profile.name,
      kind: "peer",
      subtitle: profile.bio || "Campus seat",
    });
  }
  for (const user of opsUsers) {
    if (user.role !== "student" || user.id === selfId || user.status !== "active") continue;
    if (byId.has(user.id)) continue;
    byId.set(user.id, {
      id: user.id,
      name: user.name,
      kind: "peer",
      subtitle: `${user.bio} · sample seat`,
    });
  }
  const needle = query.trim().toLowerCase();
  return [...byId.values()]
    .filter((item) => !needle || `${item.name} ${item.subtitle}`.toLowerCase().includes(needle))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function findDirectoryContact(id: string, selfId: string): Promise<MessengerContact | undefined> {
  const all = await listDirectory(selfId);
  return all.find((item) => item.id === id);
}
