import Link from "next/link";
import { notFound } from "next/navigation";
import { sendMessage } from "@/app/actions/campus";
import { Flash, GoldButton } from "@/components/ui";
import { formatCoins } from "@/lib/daily-desk";
import { getLiveCourses } from "@/lib/live-catalog";
import { findDirectoryContact } from "@/lib/directory";
import {
  PEER_MESSAGE_COST,
  findContact,
  loadRemoteMessages,
  mergeMessages,
  threadMessages,
} from "@/lib/messenger";
import { getSession } from "@/lib/session";
import { getState } from "@/lib/state";
import type { Message } from "@/lib/types";

export default async function MessageThreadPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const session = await getSession();
  if (!session) return null;
  const state = await getState();
  const courses = await getLiveCourses();
  const contact =
    findContact(id, courses, session.userId) ?? (await findDirectoryContact(id, session.userId));
  if (!contact) notFound();
  let remote: Message[] = [];
  try {
    remote = await loadRemoteMessages(session.userId);
  } catch {
    remote = [];
  }
  const thread = threadMessages(mergeMessages(state.messages, remote), session.userId, contact.id);
  const enrolled = contact.courseId ? state.enrollments.includes(contact.courseId) : true;
  const cost = contact.kind === "peer" && session.role !== "admin" ? PEER_MESSAGE_COST : 0;
  const locked = contact.kind === "mentor" && contact.courseId && !enrolled && session.role !== "admin";

  return (
    <main>
      <Link href="/messages" className="text-sm text-gold">
        ← Inbox
      </Link>
      <p className="mt-4 text-xs uppercase tracking-[0.2em] text-gold-deep">
        {contact.kind === "mentor" ? "Mentor · free" : `Student · ${cost} coins / send`}
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-cormorant)] text-4xl text-white">{contact.name}</h1>
      <p className="mt-2 text-sm text-muted">{contact.subtitle}</p>
      <Flash
        ok={query.ok}
        error={query.error}
        map={{
          sent: cost ? `Sent. ${cost} coins off the ledger.` : "Sent. Mentor thread is included with enrollment.",
          coins: `Need ${PEER_MESSAGE_COST} coins. Top up, then send.`,
          enroll: "Enroll in this course to write the mentor.",
          invalid: "Write at least a short sentence.",
        }}
      />
      <div className="mt-8 space-y-3">
        {thread.length === 0 ? <p className="text-sm text-muted">No notes yet. Open the thread with a real question.</p> : null}
        {thread.map((message) => {
          const mine = message.fromId === session.userId;
          return (
            <article
              key={message.id}
              className={`rounded-xl border border-[var(--line)] p-4 ${mine ? "bg-black/30" : "bg-panel"}`}
            >
              <p className="text-xs text-gold">
                {message.fromName} · {message.createdAt.slice(0, 10)}
                {message.coinsSpent ? ` · ${formatCoins(message.coinsSpent)} coins` : ""}
              </p>
              <p className="mt-2 text-sm text-[#e8e8e8]">{message.body}</p>
            </article>
          );
        })}
      </div>
      {locked ? (
        <p className="mt-8 text-sm text-muted">
          Enroll in this course, then the mentor thread opens at zero coins.{" "}
          <Link href="/courses" className="text-gold">
            Courses
          </Link>
        </p>
      ) : (
        <form action={sendMessage} className="mt-8 max-w-xl space-y-3">
          <input name="toId" type="hidden" value={contact.id} />
          <textarea
            name="body"
            rows={4}
            required
            minLength={8}
            placeholder={contact.kind === "mentor" ? "Ask about the method, not the mood." : "Keep it short. This spend is on you."}
            className="w-full rounded-xl border border-[var(--line)] bg-black/40 px-3 py-2 text-sm"
          />
          <GoldButton type="submit">
            {cost ? `Send · ${cost} coins` : "Send to mentor"}
          </GoldButton>
        </form>
      )}
    </main>
  );
}
