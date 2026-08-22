import { saveDeskContent } from "@/app/actions/catalog";
import { PageHeader, StatusBadge } from "@/components/admin/ui";
import { Flash, GoldButton } from "@/components/ui";
import { dynamicPages, seedForum, seedJournals } from "@/lib/catalog";
import { DEFAULT_DESK_PIN, DEFAULT_FOUNDER_NOTES } from "@/lib/daily-desk";
import { getDeskContent } from "@/lib/live-catalog";
import { getState } from "@/lib/state";

export default async function AdminContentPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const { ok, error } = await searchParams;
  const state = await getState();
  const desk = await getDeskContent();
  const pin = desk.pin ?? DEFAULT_DESK_PIN;
  const notes = desk.founderNotes.length ? desk.founderNotes : DEFAULT_FOUNDER_NOTES;
  const forum = [...state.forumPosts, ...seedForum.filter((post) => !state.forumPosts.some((live) => live.id === post.id))];
  const journals = [...state.journals, ...seedJournals.filter((item) => !state.journals.some((live) => live.id === item.id))];

  return (
    <main>
      <PageHeader
        kicker="Campus"
        title="Content"
        description="Daily desk pin + founder notes, forum, journals, and public pages."
      />
      <Flash
        error={error}
        map={{
          desk: "Daily desk content saved. Students see it on /campus.",
          missing: "Fill the Master Tenet title and body.",
        }}
        ok={ok}
      />

      <section className="mb-8 rounded-2xl border border-[var(--line)] p-5">
        <h2 className="text-lg text-white">Daily desk</h2>
        <p className="mt-1 text-sm text-muted">
          Edit the pinned Master Tenet and append Daily Notes from the Founder. Notes rotate on the student dashboard.
        </p>
        <form action={saveDeskContent} className="mt-4 grid max-w-3xl gap-4">
          <label className="text-xs text-muted">
            Pin title
            <input className="mt-1 w-full px-3 py-2" defaultValue={pin.title} name="pinTitle" required />
          </label>
          <label className="text-xs text-muted">
            Pin body (Master Tenet)
            <textarea className="mt-1 min-h-32 w-full px-3 py-2" defaultValue={pin.body} name="pinBody" required />
          </label>
          <label className="text-xs text-muted">
            Attribution
            <input className="mt-1 w-full px-3 py-2" defaultValue={pin.attribution ?? "Steven Zee"} name="pinAttribution" />
          </label>
          <div className="rounded-xl border border-dashed border-[var(--line)] p-4">
            <p className="text-xs text-muted">Add a new founder Daily Note (optional — leave blank to only update the pin)</p>
            <label className="mt-3 block text-xs text-muted">
              Note title
              <input className="mt-1 w-full px-3 py-2" name="noteTitle" placeholder="Daily Note · …" />
            </label>
            <label className="mt-3 block text-xs text-muted">
              Note body
              <textarea className="mt-1 min-h-24 w-full px-3 py-2" name="noteBody" placeholder="Short field note from Steven Zee…" />
            </label>
          </div>
          <GoldButton pendingLabel="Saving…" type="submit">
            Save desk content
          </GoldButton>
        </form>
        <div className="mt-6">
          <p className="text-sm text-gold">Current founder notes ({notes.length})</p>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            {notes.slice(0, 8).map((note) => (
              <li key={note.id}>
                <span className="text-white">{note.title}</span> — {note.body.slice(0, 100)}
                {note.body.length > 100 ? "…" : ""}
              </li>
            ))}
          </ul>
        </div>
      </section>

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
