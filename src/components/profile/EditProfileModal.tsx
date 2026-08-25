"use client";

import { useState } from "react";
import { saveSocialProfile } from "@/app/actions/social";
import { ProfileImageUpload } from "@/components/profile/ProfileImageUpload";
import type { SocialProfile } from "@/lib/social-shared";

export function EditProfileModal({
  profile,
  phone,
  listed,
}: {
  profile: SocialProfile;
  phone: string;
  listed: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="ghost-btn rounded-full px-5 py-2 text-[11px]" type="button" onClick={() => setOpen(true)}>
        Edit profile
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-[family-name:var(--font-cormorant)] text-2xl text-white">Edit profile</h2>
              <button className="text-sm text-muted hover:text-gold" type="button" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>
            <form action={saveSocialProfile} className="space-y-4">
              <input name="returnTo" type="hidden" value={`/u/${profile.handle}`} />
              <ProfileImageUpload name="bannerUrl" label="Banner" initialUrl={profile.bannerUrl} aspect="banner" />
              <ProfileImageUpload name="avatarUrl" label="Avatar" initialUrl={profile.avatarUrl} aspect="square" />
              <label className="block text-xs text-muted">
                Display name
                <input
                  name="name"
                  required
                  defaultValue={profile.name}
                  className="mt-1 w-full rounded-xl border border-[var(--line)] bg-black/40 px-3 py-2 text-sm text-white"
                />
              </label>
              <label className="block text-xs text-muted">
                Handle
                <div className="mt-1 flex items-center gap-1 rounded-xl border border-[var(--line)] bg-black/40 px-3 py-2">
                  <span className="text-gold">@</span>
                  <input
                    name="handle"
                    required
                    defaultValue={profile.handle}
                    pattern="[a-zA-Z0-9_]{3,24}"
                    className="w-full bg-transparent text-sm text-white outline-none"
                  />
                </div>
                <span className="mt-1 block text-[11px] text-[var(--muted)]">3–24 chars · letters, numbers, underscore</span>
              </label>
              <label className="block text-xs text-muted">
                Bio
                <textarea
                  name="bio"
                  rows={3}
                  maxLength={160}
                  defaultValue={profile.bio}
                  className="mt-1 w-full rounded-xl border border-[var(--line)] bg-black/40 px-3 py-2 text-sm text-white"
                />
              </label>
              <label className="block text-xs text-muted">
                Location
                <input
                  name="location"
                  defaultValue={profile.location}
                  className="mt-1 w-full rounded-xl border border-[var(--line)] bg-black/40 px-3 py-2 text-sm text-white"
                />
              </label>
              <label className="block text-xs text-muted">
                Website
                <input
                  name="website"
                  defaultValue={profile.website}
                  placeholder="https://"
                  className="mt-1 w-full rounded-xl border border-[var(--line)] bg-black/40 px-3 py-2 text-sm text-white"
                />
              </label>
              <label className="block text-xs text-muted">
                Phone (private)
                <input
                  name="phone"
                  defaultValue={phone}
                  className="mt-1 w-full rounded-xl border border-[var(--line)] bg-black/40 px-3 py-2 text-sm text-white"
                />
              </label>
              <label className="flex items-start gap-3 text-sm text-muted">
                <input name="listed" type="checkbox" defaultChecked={listed} className="mt-1" />
                <span>List me in the campus directory so other students can find this profile.</span>
              </label>
              <button className="gold-btn w-full rounded-xl px-5 py-2.5 text-xs" type="submit">
                Save
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
