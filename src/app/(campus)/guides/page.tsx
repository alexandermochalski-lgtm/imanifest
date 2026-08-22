import Link from "next/link";
import { CoverMedia } from "@/components/CoverMedia";
import { categories } from "@/lib/catalog";
import { getLiveGuides, guideMatchesTag, guideTags } from "@/lib/live-catalog";

export default async function GuidesPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const { tag } = await searchParams;
  const guides = await getLiveGuides();
  const filtered = guides.filter((guide) => guideMatchesTag(guide, tag));
  const allTags = [...new Set(guides.flatMap((guide) => guideTags(guide)))].sort();

  return (
    <main>
      <h1 className="font-[family-name:var(--font-cormorant)] text-4xl text-white">Guides</h1>
      <p className="mt-3 max-w-2xl text-sm text-muted">
        Short field notes and series — Inside Hustler, 101 Guides to Being a Gentleman, and campus how-tos. A guide can
        wear more than one tag.
      </p>
      <div className="mt-6 flex flex-wrap gap-2 text-xs">
        <Link
          href="/guides"
          className="rounded-full border border-[var(--line)] px-3 py-1 text-gold transition hover:border-gold hover:bg-gold/10"
        >
          All
        </Link>
        {allTags.map((item) => (
          <Link
            key={item}
            href={`/guides?tag=${encodeURIComponent(item)}`}
            className="rounded-full border border-[var(--line)] px-3 py-1 text-muted transition hover:border-gold hover:text-gold"
          >
            {categories.find((category) => category.slug === item)?.label ?? item}
          </Link>
        ))}
      </div>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {filtered.map((guide) => {
          const tags = guideTags(guide);
          return (
            <Link key={guide.id} href={`/guides/${guide.slug}`} className="imu-card overflow-hidden rounded-2xl">
              <CoverMedia alt="" ratio="wide" url={guide.coverUrl} />
              <div className="relative p-6">
                {guide.series ? (
                  <p className="text-[10px] uppercase tracking-[0.18em] text-gold-deep">{guide.series}</p>
                ) : null}
                <div className="mt-2 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.16em] text-gold">
                  {tags.map((item) => (
                    <span key={item}>{categories.find((category) => category.slug === item)?.label ?? item}</span>
                  ))}
                </div>
                <h2 className="mt-2 text-2xl text-white">{guide.title}</h2>
                <p className="mt-2 text-sm text-muted">{guide.summary}</p>
                {guide.author ? <p className="mt-3 text-xs text-gold">{guide.author}</p> : null}
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
