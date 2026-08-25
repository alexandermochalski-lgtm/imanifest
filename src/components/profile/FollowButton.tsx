"use client";

import { useFormStatus } from "react-dom";
import { toggleFollowAction } from "@/app/actions/social";

function FollowSubmit({ following }: { following: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      className={
        following
          ? "ghost-btn w-full rounded-full px-5 py-2 text-[11px] sm:w-auto"
          : "gold-btn w-full rounded-full px-5 py-2 text-[11px] sm:w-auto"
      }
      disabled={pending}
      type="submit"
    >
      {pending ? "…" : following ? "Following" : "Follow"}
    </button>
  );
}

export function FollowButton({
  targetId,
  handle,
  initiallyFollowing,
}: {
  targetId: string;
  handle: string;
  initiallyFollowing: boolean;
}) {
  return (
    <form action={toggleFollowAction} className="w-full sm:w-auto">
      <input name="targetId" type="hidden" value={targetId} />
      <input name="handle" type="hidden" value={handle} />
      <input name="currently" type="hidden" value={initiallyFollowing ? "1" : "0"} />
      <FollowSubmit following={initiallyFollowing} />
    </form>
  );
}
