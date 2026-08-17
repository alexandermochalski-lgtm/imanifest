import { createForumPost } from "@/app/actions/campus";
import { Flash, GoldButton } from "@/components/ui";
import { categories } from "@/lib/catalog";

export default async function NewForumPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main>
      <h1 className="font-[family-name:var(--font-cormorant)] text-4xl text-white">New forum post</h1>
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
        <textarea name="body" rows={6} className="w-full rounded-xl border border-[var(--line)] bg-black/40 px-3 py-2" />
        <GoldButton type="submit">Post</GoldButton>
      </form>
    </main>
  );
}
