import { createJournal } from "@/app/actions/campus";
import { Flash, GoldButton } from "@/components/ui";

export default async function NewJournalPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main>
      <h1 className="font-[family-name:var(--font-cormorant)] text-4xl text-white">New journal</h1>
      <Flash error={error} map={{ invalid: "Title and body are required." }} />
      <form action={createJournal} className="mt-8 max-w-xl space-y-4">
        <input name="title" placeholder="Title" className="w-full rounded-xl border border-[var(--line)] bg-black/40 px-3 py-2" />
        <select name="type" className="w-full rounded-xl border border-[var(--line)] bg-black/40 px-3 py-2">
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
        <textarea name="body" rows={8} placeholder="Process notes..." className="w-full rounded-xl border border-[var(--line)] bg-black/40 px-3 py-2" />
        <GoldButton type="submit">Publish</GoldButton>
      </form>
    </main>
  );
}
