import { createForumPost } from "@/app/actions/campus";
import { CampusImageField } from "@/components/campus/CampusImageField";
import { Flash, GoldButton } from "@/components/ui";
import { categories } from "@/lib/catalog";
import { FORUM_PHOTO_COIN } from "@/lib/login-bonus";

export default async function NewForumPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main>
      <h1 className="font-[family-name:var(--font-cormorant)] text-4xl text-white">New forum post</h1>
      <p className="mt-2 max-w-xl text-sm text-[var(--muted)]">
        Share process notes from class, projects, or field work. Add a photo and earn +{FORUM_PHOTO_COIN} free coins.
      </p>
      <Flash error={error} map={{ invalid: "Title and body required." }} />
      <form action={createForumPost} className="mt-8 max-w-xl space-y-4">
        <input name="title" placeholder="Title" className="w-full rounded-xl border border-[var(--line)] bg-black/40 px-3 py-2" />
        <select name="category" className="w-full rounded-xl border border-[var(--line)] bg-black/40 px-3 py-2">
          {categories.map((category) => (
            <option key={category.slug} value={category.slug}>
              {category.label}
            </option>
          ))}
        </select>
        <textarea
          name="body"
          rows={6}
          placeholder="What did you ship? Blank lines become paragraphs."
          className="w-full rounded-xl border border-[var(--line)] bg-black/40 px-3 py-2"
        />
        <CampusImageField
          hint={`Field photo from campus, class, or a project — +${FORUM_PHOTO_COIN} coins when you post.`}
          label="Campus photo"
        />
        <GoldButton type="submit">Post</GoldButton>
      </form>
    </main>
  );
}
