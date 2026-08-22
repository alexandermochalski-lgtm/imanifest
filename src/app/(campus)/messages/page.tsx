import Link from "next/link";
import { redirect } from "next/navigation";
import { Flash } from "@/components/ui";
import { formatCoins } from "@/lib/daily-desk";
import { getLiveCourses } from "@/lib/live-catalog";
import {
  PEER_MESSAGE_COST,
  inboxThreads,
  loadRemoteMessages,
  mentorContacts,
  mergeMessages,
} from "@/lib/messenger";
import { getSession } from "@/lib/session";
import { getState } from "@/lib/state";
import type { Message } from "@/lib/types";

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const query = await searchParams;
  const session = await getSession();
  if (!session) redirect("/login");
  const state = await getState();
  const courses = await getLiveCourses();
  let remote: Message[] = [];
  try {
    remote = await loadRemoteMessages(session.userId);
  } catch {
    remote = [];
  }
  const messages = mergeMessages(state.messages, remote);
  const mentors = mentorContacts(courses, state.enrollments);
  const threads = inboxThreads(messages, session.userId, mentors, courses);
  const mentorThreads = threads.filter((item) => item.contact.kind === "mentor");
  const peerThreads = threads.filter((item) => item.contact.kind === "peer" && item.last);

  return (
    <main>
      <p className="text-xs uppercase tracking-[0.2em] text-gold-deep">Campus messenger</p>
      <h1 className="mt-2 font-[family-name:var(--font-cormorant)] text-4xl text-white">Messages</h1>
      <p className="mt-3 max-w-2xl text-sm text-muted">
        Mentors are free when you are enrolled. Find students in the{" "}
        <Link href="/directory" className="text-gold">
          directory
        </Link>
        , then pay {PEER_MESSAGE_COST} coins per send.
      </p>
      <p className="mt-2 text-sm text-gold">Ledger {formatCoins(state.coins)} coins</p>
      <Flash
        ok={query.ok}
        error={query.error}
        map={{
          sent: "Message sent.",
          coins: "Not enough coins for a student thread.",
          enroll: "Enroll in that course before messaging the mentor.",
          invalid: "Write a real note — at least a short sentence.",
          missing: "That seat is not on the directory.",
        }}
      />
      <section className="mt-10">
        <h2 className="font-[family-name:var(--font-cormorant)] text-2xl text-white">Mentors</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {mentorThreads.map(({ contact, last }) => (
            <Link
              key={contact.id}
              href={`/messages/${contact.id}`}
              className="rounded-2xl border border-[var(--line)] bg-panel p-5"
            >
              <p className="text-xs uppercase tracking-[0.16em] text-gold-deep">Free</p>
              <p className="mt-1 text-white">{contact.name}</p>
              <p className="mt-1 text-sm text-muted">{contact.subtitle}</p>
              {last ? <p className="mt-3 line-clamp-2 text-sm text-muted">{last.body}</p> : null}
            </Link>
          ))}
        </div>
      </section>
      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-[family-name:var(--font-cormorant)] text-2xl text-white">Student threads</h2>
          <Link href="/directory" className="text-sm text-gold">
            Open directory
          </Link>
        </div>
        {peerThreads.length === 0 ? (
          <p className="mt-4 text-sm text-muted">No student threads yet. Search the directory and start one.</p>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {peerThreads.map(({ contact, last }) => (
              <Link
                key={contact.id}
                href={`/messages/${contact.id}`}
                className="rounded-2xl border border-[var(--line)] bg-panel p-5"
              >
                <p className="text-white">{contact.name}</p>
                {last ? <p className="mt-2 line-clamp-2 text-sm text-gold">{last.body}</p> : null}
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
