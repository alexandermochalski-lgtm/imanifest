import Link from "next/link";
import type { ProfileTab } from "@/lib/social";

const TABS: { id: ProfileTab; label: string }[] = [
  { id: "posts", label: "Posts" },
  { id: "replies", label: "Replies" },
  { id: "media", label: "Media" },
  { id: "likes", label: "Likes" },
];

export function ProfileTabs({ handle, active }: { handle: string; active: ProfileTab }) {
  return (
    <nav className="mt-6 flex border-b border-[var(--line)]">
      {TABS.map((tab) => {
        const href = tab.id === "posts" ? `/u/${handle}` : `/u/${handle}?tab=${tab.id}`;
        const on = active === tab.id;
        return (
          <Link
            key={tab.id}
            href={href}
            className={`flex-1 px-2 py-3 text-center text-sm transition ${
              on ? "border-b-2 border-gold font-medium text-white" : "text-muted hover:text-white"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
