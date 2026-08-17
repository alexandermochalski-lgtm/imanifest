import { notFound } from "next/navigation";
import { seedJournals } from "@/lib/catalog";
import { getSession } from "@/lib/session";
import { getState } from "@/lib/state";

export default async function JournalDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getSession();
  const state = await getState();
  const journal = [...state.journals, ...seedJournals].find((item) => item.slug === slug);
  if (!journal) notFound();
  if (journal.type === "private" && journal.authorId !== session?.userId) notFound();
  return (
    <main>
      <p className="text-xs text-gold">
        {journal.authorName} · {journal.createdAt} · {journal.type}
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-cormorant)] text-4xl text-white">{journal.title}</h1>
      <p className="mt-6 max-w-2xl leading-8 text-muted">{journal.body}</p>
    </main>
  );
}
