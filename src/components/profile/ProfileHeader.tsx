import Link from "next/link";
import { EditProfileModal } from "@/components/profile/EditProfileModal";
import { FollowButton } from "@/components/profile/FollowButton";
import { campusMediaHref } from "@/lib/blob-access";
import { initialsFromName, type SocialProfile } from "@/lib/social";

function formatJoined(iso: string) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function websiteHref(raw: string) {
  if (!raw) return null;
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
}

function websiteLabel(raw: string) {
  try {
    return new URL(websiteHref(raw) || raw).hostname.replace(/^www\./, "");
  } catch {
    return raw.replace(/^https?:\/\//i, "").slice(0, 40);
  }
}

export function ProfileHeader({
  profile,
  isOwn,
  phone,
  following,
  followers,
  posts,
  isFollowing,
  rank,
}: {
  profile: SocialProfile;
  isOwn: boolean;
  phone: string;
  following: number;
  followers: number;
  posts: number;
  isFollowing: boolean;
  rank?: string;
}) {
  const banner = campusMediaHref(profile.bannerUrl);
  const avatar = campusMediaHref(profile.avatarUrl);
  const joined = formatJoined(profile.createdAt);
  const site = websiteHref(profile.website);

  return (
    <header className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--panel)]">
      <div className="relative h-36 bg-gradient-to-br from-[#1a1510] via-[#0c0b0a] to-[#2a2118] md:h-44">
        {banner ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt="" className="h-full w-full object-cover" src={banner} />
        ) : null}
      </div>
      <div className="relative px-5 pb-6 pt-0 md:px-8">
        <div className="-mt-12 flex items-end justify-between gap-4 md:-mt-14">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-[var(--panel)] bg-black text-2xl font-medium text-gold md:h-28 md:w-28 md:text-3xl">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt="" className="h-full w-full object-cover" src={avatar} />
            ) : (
              initialsFromName(profile.name)
            )}
          </div>
          <div className="mb-1 flex flex-wrap justify-end gap-2">
            {isOwn ? (
              <EditProfileModal profile={profile} phone={phone} listed={profile.listed} />
            ) : (
              <>
                <FollowButton
                  targetId={profile.userId}
                  handle={profile.handle}
                  initiallyFollowing={isFollowing}
                />
                <Link className="ghost-btn rounded-full px-5 py-2 text-[11px]" href={`/messages/${profile.userId}`}>
                  Message
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="mt-4">
          <h1 className="font-[family-name:var(--font-cormorant)] text-3xl text-white md:text-4xl">{profile.name}</h1>
          <p className="mt-1 text-sm text-muted">@{profile.handle}</p>
          {rank && isOwn ? <p className="mt-2 text-xs uppercase tracking-[0.18em] text-gold">{rank}</p> : null}
          {profile.bio ? <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--text-soft)]">{profile.bio}</p> : null}
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted">
            {profile.location ? <span>{profile.location}</span> : null}
            {site ? (
              <a className="text-gold hover:text-white" href={site} rel="noopener noreferrer" target="_blank">
                {websiteLabel(profile.website)}
              </a>
            ) : null}
            {joined ? <span>Joined {joined}</span> : null}
          </div>
          <div className="mt-5 flex flex-wrap gap-5 text-sm">
            <span>
              <span className="font-medium text-white">{posts}</span> <span className="text-muted">Posts</span>
            </span>
            <Link className="hover:underline" href={`/u/${profile.handle}/following`}>
              <span className="font-medium text-white">{following}</span> <span className="text-muted">Following</span>
            </Link>
            <Link className="hover:underline" href={`/u/${profile.handle}/followers`}>
              <span className="font-medium text-white">{followers}</span> <span className="text-muted">Followers</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
