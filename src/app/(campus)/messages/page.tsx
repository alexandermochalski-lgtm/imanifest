import { sendMessage } from "@/app/actions/campus";
import { Flash, GoldButton } from "@/components/ui";
import { getState } from "@/lib/state";

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const { ok } = await searchParams;
  const state = await getState();
  return (
    <main>
      <h1 className="font-[family-name:var(--font-cormorant)] text-4xl text-white">Messages</h1>
      <p className="mt-2 text-sm text-muted">Chatify replacement: faculty thread on the campus ledger.</p>
      <Flash ok={ok} map={{ "1": "Message sent." }} />
      <form action={sendMessage} className="mt-6 max-w-xl space-y-3">
        <textarea name="body" rows={3} placeholder="Message faculty..." className="w-full rounded-xl border border-[var(--line)] bg-black/40 px-3 py-2" />
        <GoldButton type="submit">Send</GoldButton>
      </form>
      <div className="mt-8 space-y-3">
        {state.messages.map((message) => (
          <article key={message.id} className="rounded-xl border border-[var(--line)] p-4">
            <p className="text-xs text-gold">
              {message.fromName} · {message.createdAt}
            </p>
            <p className="mt-2 text-sm text-muted">{message.body}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
