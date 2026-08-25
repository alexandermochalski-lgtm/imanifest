"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { mutateState } from "@/lib/state";
import {
  createPost,
  deletePost,
  ensureProfileHandle,
  followUser,
  normalizeHandle,
  setPinnedPost,
  toggleLike,
  unfollowUser,
  updateSocialProfile,
} from "@/lib/social";

async function campusAuthed() {
  return requireSession();
}

function revalidateProfile(handle?: string) {
  revalidatePath("/directory");
  revalidatePath("/profile");
  if (handle) {
    revalidatePath(`/u/${handle}`);
    revalidatePath(`/u/${handle}/followers`);
    revalidatePath(`/u/${handle}/following`);
  }
}

export async function saveSocialProfile(formData: FormData) {
  const session = await campusAuthed();
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "");
  const bio = String(formData.get("bio") ?? "");
  const handle = normalizeHandle(String(formData.get("handle") ?? ""));
  const location = String(formData.get("location") ?? "");
  const website = String(formData.get("website") ?? "");
  const listed = formData.get("listed") === "on";
  const avatarUrl = String(formData.get("avatarUrl") ?? "");
  const bannerUrl = String(formData.get("bannerUrl") ?? "");
  const returnTo = String(formData.get("returnTo") ?? "").trim();

  const result = await updateSocialProfile({
    userId: session.userId,
    name: name || session.name,
    handle,
    bio,
    listed,
    location,
    website,
    avatarUrl,
    bannerUrl,
  });

  if (!result.ok) {
    const dest = returnTo || "/profile";
    redirect(`${dest}?error=${result.error}`);
  }

  await mutateState((state) => ({
    ...state,
    profile: {
      name: name || state.profile.name || session.name,
      phone,
      bio,
      handle: result.handle,
      avatarUrl,
    },
  }));

  revalidateProfile(result.handle);
  redirect(returnTo || `/u/${result.handle}?ok=1`);
}

export async function claimHandleAndOpen() {
  const session = await campusAuthed();
  const profile = await ensureProfileHandle({
    userId: session.userId,
    name: session.name,
    email: session.email,
  });
  await mutateState((state) => ({
    ...state,
    profile: {
      ...state.profile,
      name: state.profile.name || profile.name || session.name,
      handle: profile.handle,
      avatarUrl: profile.avatarUrl || state.profile.avatarUrl,
    },
  }));
  redirect(`/u/${profile.handle}`);
}

export async function toggleFollowAction(formData: FormData) {
  const session = await campusAuthed();
  const targetId = String(formData.get("targetId") ?? "");
  const handle = String(formData.get("handle") ?? "");
  const currently = String(formData.get("currently") ?? "") === "1";
  if (!targetId || targetId === session.userId) redirect(handle ? `/u/${handle}` : "/directory");
  if (currently) await unfollowUser(session.userId, targetId);
  else await followUser(session.userId, targetId);
  revalidateProfile(handle);
  redirect(handle ? `/u/${handle}` : "/directory");
}

export async function createProfilePost(formData: FormData) {
  const session = await campusAuthed();
  const body = String(formData.get("body") ?? "");
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const replyToId = String(formData.get("replyToId") ?? "").trim() || null;
  const handle = String(formData.get("handle") ?? "");
  const result = await createPost({
    authorId: session.userId,
    body,
    imageUrl,
    replyToId,
  });
  const own = await ensureProfileHandle({
    userId: session.userId,
    name: session.name,
    email: session.email,
  });
  if (!result.ok) {
    redirect(handle ? `/u/${handle}?error=post_${result.error}` : `/u/${own.handle}?error=post`);
  }
  revalidateProfile(handle);
  revalidateProfile(own.handle);
  if (replyToId) redirect(`/u/${own.handle}?tab=replies`);
  redirect(handle ? `/u/${handle}` : `/u/${own.handle}`);
}

export async function deleteProfilePost(formData: FormData) {
  const session = await campusAuthed();
  const postId = String(formData.get("postId") ?? "");
  const handle = String(formData.get("handle") ?? "");
  if (postId) await deletePost(session.userId, postId);
  revalidateProfile(handle);
  redirect(handle ? `/u/${handle}` : "/profile");
}

export async function togglePostLike(formData: FormData) {
  const session = await campusAuthed();
  const postId = String(formData.get("postId") ?? "");
  const handle = String(formData.get("handle") ?? "");
  const tab = String(formData.get("tab") ?? "posts");
  if (postId) await toggleLike(session.userId, postId);
  revalidateProfile(handle);
  const qs = tab && tab !== "posts" ? `?tab=${tab}` : "";
  redirect(handle ? `/u/${handle}${qs}` : "/profile");
}

export async function pinProfilePost(formData: FormData) {
  const session = await campusAuthed();
  const postId = String(formData.get("postId") ?? "");
  const handle = String(formData.get("handle") ?? "");
  const unpin = String(formData.get("unpin") ?? "") === "1";
  await setPinnedPost(session.userId, unpin ? null : postId || null);
  revalidateProfile(handle);
  redirect(handle ? `/u/${handle}` : "/profile");
}
