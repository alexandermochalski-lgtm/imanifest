import { notFound } from "next/navigation";
import { campusMediaHref } from "@/lib/blob-access";
import { categories } from "@/lib/catalog";
import { getLiveGuideBySlug, guideTags } from "@/lib/live-catalog";

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = await getLiveGuideBySlug(slug);
  if (!guide) notFound();
  const cover = campusMediaHref(guide.coverUrl);
  const tags = guideTags(guide);
  return (
    <main>
      {cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img alt="" className="mb-6 aspect-[21/9] w-full max-w-4xl rounded-2xl object-cover" src={cover} />
      ) : null}
      {guide.series ? <p className="text-xs uppercase tracking-[0.2em] text-gold-deep">{guide.series}</p> : null}
      <div className="mt-2 flex flex-wrap gap-2 text-xs uppercase tracking-[0.2em] text-gold">
        {tags.map((tag) => (
          <span key={tag}>{categories.find((item) => item.slug === tag)?.label ?? tag}</span>
        ))}
      </div>
      <h1 className="mt-2 font-[family-name:var(--font-cormorant)] text-4xl text-white">{guide.title}</h1>
      {guide.author ? <p className="mt-2 text-sm text-muted">{guide.author}</p> : null}
      <p className="mt-6 max-w-2xl leading-8 text-muted">{guide.body}</p>
    </main>
  );
}
