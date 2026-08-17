import { notFound } from "next/navigation";
import { buyBundle, toggleFavorite } from "@/app/actions/campus";
import { Flash, GoldButton } from "@/components/ui";
import { books, bundles, courseById } from "@/lib/catalog";
import { getState } from "@/lib/state";

export default async function BundleDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ ok?: string }>;
}) {
  const { slug } = await params;
  const { ok } = await searchParams;
  const bundle = bundles.find((item) => item.slug === slug);
  if (!bundle) notFound();
  const state = await getState();
  return (
    <main>
      <h1 className="font-[family-name:var(--font-cormorant)] text-4xl text-white">{bundle.title}</h1>
      <Flash ok={ok} map={{ "1": "Bundle unlocked. Courses enrolled." }} />
      <p className="mt-4 text-muted">{bundle.summary}</p>
      <p className="mt-2 text-gold">{bundle.price} coins</p>
      <h2 className="mt-8 text-white">Included courses</h2>
      <ul className="mt-2 list-disc pl-5 text-muted">
        {bundle.courseIds.map((id) => (
          <li key={id}>{courseById(id)?.title}</li>
        ))}
      </ul>
      <h2 className="mt-6 text-white">Included books</h2>
      <ul className="mt-2 list-disc pl-5 text-muted">
        {bundle.bookIds.map((id) => (
          <li key={id}>{books.find((book) => book.id === id)?.title}</li>
        ))}
      </ul>
      <div className="mt-8 flex gap-3">
        <form action={buyBundle.bind(null, bundle.id)}>
          <GoldButton type="submit">Unlock with coins</GoldButton>
        </form>
        <form action={toggleFavorite.bind(null, "bundle", bundle.id)}>
          <button className="text-sm text-gold" type="submit">
            {state.favoriteBundles.includes(bundle.id) ? "Unfavorite" : "Favorite"}
          </button>
        </form>
      </div>
    </main>
  );
}
