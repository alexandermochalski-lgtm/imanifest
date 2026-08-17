import Link from "next/link";
import { guides } from "@/lib/catalog";

export default function GuidesPage() {
  return (
    <main>
      <h1 className="font-[family-name:var(--font-cormorant)] text-4xl text-white">Guides</h1>
      <div className="mt-8 grid gap-5">
        {guides.map((guide) => (
          <Link key={guide.id} href={`/guides/${guide.slug}`} className="rounded-2xl border border-[var(--line)] bg-panel p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-gold">{guide.tag}</p>
            <h2 className="mt-2 text-2xl text-white">{guide.title}</h2>
            <p className="mt-2 text-sm text-muted">{guide.summary}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
