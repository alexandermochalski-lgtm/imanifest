import { PageHeader, StatusBadge } from "@/components/admin/ui";
import { dynamicPages, seedForum, seedJournals } from "@/lib/catalog";
import { getState } from "@/lib/state";

export default async function AdminContentPage() {
  const state = await getState();
  const forum = [...state.forumPosts, ...seedForum.filter((post) => !state.forumPosts.some((live) => live.id === post.id))];
  const journals = [...state.journals, ...seedJournals.filter((item) => !state.journals.some((live) => live.id === item.id))];

  return (
    <main>
      <PageHeader
        kicker="Campus"
        title="Content"
        description="Forum, journals, and public pages. Student-authored rows from this browser appear first."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-[var(--line)] p-5">
          <h2 className="text-lg text-white">Forum</h2>
          <ul className="mt-4 space-y-3">
            {forum.map((post) => (
              <li key={post.id} className="border-b border-[var(--line)] pb-3 last:border-0">
                <p className="text-white">{post.title}</p>
                <p className="text-xs text-muted">
                  {post.authorName} · {post.category} · {post.replies.length} replies
                </p>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-2xl border border-[var(--line)] p-5">
          <h2 className="text-lg text-white">Journals</h2>
          <ul className="mt-4 space-y-3">
            {journals.map((journal) => (
              <li key={journal.id} className="border-b border-[var(--line)] pb-3 last:border-0">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-white">{journal.title}</p>
                  <StatusBadge status={journal.type} />
                </div>
                <p className="text-xs text-muted">
                  {journal.authorName} · {journal.createdAt}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <section className="mt-6 rounded-2xl border border-[var(--line)] p-5">
        <h2 className="text-lg text-white">Public pages</h2>
        <ul className="mt-4 space-y-2 text-sm text-muted">
          {dynamicPages.map((page) => (
            <li key={page.slug}>
              {page.slug === "privacy" ? "/privacy" : page.slug === "terms" ? "/legal" : `/pages/${page.slug}`} — {page.title}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
