import Link from "next/link";
import { markNotification } from "@/app/actions/campus";
import { getState } from "@/lib/state";

export default async function NotificationsPage() {
  const state = await getState();
  return (
    <main>
      <h1 className="font-[family-name:var(--font-cormorant)] text-4xl text-white">Notifications</h1>
      <div className="mt-8 space-y-3">
        {state.notifications.map((item) => (
          <article key={item.id} className="flex items-start justify-between gap-4 rounded-xl border border-[var(--line)] p-4">
            <div>
              <p className="text-white">{item.title}</p>
              <p className="mt-1 text-sm text-muted">{item.body}</p>
              <Link href={item.href} className="mt-2 inline-block text-xs text-gold">
                Open
              </Link>
            </div>
            {item.read ? (
              <span className="text-xs text-muted">Read</span>
            ) : (
              <form action={markNotification.bind(null, item.id)}>
                <button className="text-xs text-gold" type="submit">
                  Mark read
                </button>
              </form>
            )}
          </article>
        ))}
      </div>
    </main>
  );
}
