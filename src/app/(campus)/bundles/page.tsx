import Link from "next/link";
import { buyBundle, toggleFavorite } from "@/app/actions/campus";
import { getLiveBundles, getLiveCourses } from "@/lib/live-catalog";
import { getState } from "@/lib/state";

export default async function BundlesPage() {
  const state = await getState();
  const [bundles, courses] = await Promise.all([getLiveBundles(), getLiveCourses()]);
  const courseTitle = new Map(courses.map((course) => [course.id, course.title]));

  return (
    <main>
      <h1 className="font-[family-name:var(--font-cormorant)] text-4xl text-white">Bundles</h1>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {bundles.map((bundle) => (
          <article key={bundle.id} className="gold-ring rounded-2xl bg-panel p-6">
            <h2 className="font-[family-name:var(--font-cormorant)] text-2xl text-white">{bundle.title}</h2>
            <p className="mt-3 text-sm text-muted">{bundle.summary}</p>
            <p className="mt-3 text-gold">{bundle.price === 0 ? "Free" : `${bundle.price} coins`}</p>
            <div className="mt-4 flex gap-4 text-sm">
              <Link href={`/bundles/${bundle.slug}`} className="text-gold">
                Open
              </Link>
              <form action={toggleFavorite.bind(null, "bundle", bundle.id)}>
                <button className="text-gold" type="submit">
                  {state.favoriteBundles.includes(bundle.id) ? "Unfavorite" : "Favorite"}
                </button>
              </form>
              <form action={buyBundle.bind(null, bundle.id)}>
                <button className="text-gold" type="submit">
                  Unlock
                </button>
              </form>
            </div>
            <ul className="mt-3 text-xs text-muted">
              {bundle.courseIds.map((id) => (
                <li key={id}>{courseTitle.get(id) ?? id}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </main>
  );
}
