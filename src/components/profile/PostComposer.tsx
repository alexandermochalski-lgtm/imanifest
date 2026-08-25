import { createProfilePost } from "@/app/actions/social";
import { CampusImageField } from "@/components/campus/CampusImageField";
import { MAX_POST_LEN } from "@/lib/social-shared";

export function PostComposer({
  handle,
  replyToId,
  returnTo,
  placeholder = "What's happening on campus?",
}: {
  handle: string;
  replyToId?: string;
  returnTo?: string;
  placeholder?: string;
}) {
  return (
    <form action={createProfilePost} className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 md:p-5">
      <input name="handle" type="hidden" value={handle} />
      {replyToId ? <input name="replyToId" type="hidden" value={replyToId} /> : null}
      {returnTo ? <input name="returnTo" type="hidden" value={returnTo} /> : null}
      <textarea
        name="body"
        required
        maxLength={MAX_POST_LEN}
        rows={3}
        placeholder={placeholder}
        className="w-full resize-none rounded-xl border border-[var(--line)] bg-black/30 px-3 py-2 text-sm text-white placeholder:text-muted"
      />
      <div className="mt-3">
        <CampusImageField name="imageUrl" label="Photo (optional)" hint="JPEG, PNG, WebP, or GIF" />
      </div>
      <div className="mt-3 flex justify-end">
        <button className="gold-btn rounded-full px-5 py-2 text-[11px]" type="submit">
          Post
        </button>
      </div>
    </form>
  );
}
