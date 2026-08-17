import { dynamicPages, seedForum, seedJournals } from "@/lib/catalog";
import { getState } from "@/lib/state";

export default async function AdminContentPage() {
  const state = await getState();
  return (
    <main>
      <h1 className="font-[family-name:var(--font-cormorant)] text-4xl text-white">Forum / journals / pages</h1>
      <h2 className="mt-8 text-xl text-gold">Forum</h2>
      <ul className="mt-3 space-y-2 text-muted">
        {[...state.forumPosts, ...seedForum].map((post) => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
      <h2 className="mt-8 text-xl text-gold">Journals</h2>
      <ul className="mt-3 space-y-2 text-muted">
        {[...state.journals, ...seedJournals].map((journal) => (
          <li key={journal.id}>
            {journal.title} · {journal.type}
          </li>
        ))}
      </ul>
      <h2 className="mt-8 text-xl text-gold">Dynamic pages</h2>
      <ul className="mt-3 space-y-2 text-muted">
        {dynamicPages.map((page) => (
          <li key={page.slug}>/pages/{page.slug}</li>
        ))}
      </ul>
    </main>
  );
}
