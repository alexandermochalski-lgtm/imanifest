import Link from "next/link";
import { toggleFavorite } from "@/app/actions/campus";
import { GoldButton } from "@/components/ui";
import { campusMediaHref } from "@/lib/blob-access";
import { categories } from "@/lib/catalog";
import { bookCategories, bookMatchesCategory, getDeliverableBooks } from "@/lib/live-catalog";
import { getState } from "@/lib/state";

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const params = await searchParams;
  const state = await getState();
  const query = (params.q ?? "").toLowerCase();
  const books = await getDeliverableBooks();
  const filtered = books.filter((book) => {
    const byCat = bookMatchesCategory(book, params.category);
    const byQ = !query || book.title.toLowerCase().includes(query) || book.author.toLowerCase().includes(query);
    return byCat && byQ;
  });
  return (
    <main>
      <h1 className="font-[family-name:var(--font-cormorant)] text-4xl text-white">Books</h1>
      <form className="mt-6 flex gap-3">
        <input name="q" defaultValue={params.q} placeholder="Search books" className="rounded-xl border border-[var(--line)] bg-black/40 px-3 py-2 text-sm" />
        <GoldButton type="submit">Search</GoldButton>
      </form>
      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <Link href="/library" className="rounded-full border border-[var(--line)] px-3 py-1 text-gold">
          All Books
        </Link>
        {categories.map((category) => (
          <Link key={category.slug} href={`/library?category=${category.slug}`} className="rounded-full border border-[var(--line)] px-3 py-1 text-muted hover:text-gold">
            {category.label}
          </Link>
        ))}
      </div>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {filtered.map((book) => {
          const cover = campusMediaHref(book.coverUrl);
          const tags = bookCategories(book);
          return (
            <article key={book.id} className="overflow-hidden rounded-2xl border border-[var(--line)] bg-panel">
              {cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img alt="" className="aspect-[3/4] max-h-64 w-full object-cover" src={cover} />
              ) : null}
              <div className="p-6">
                <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.16em] text-gold-deep">
                  {tags.map((tag) => (
                    <span key={tag}>{categories.find((item) => item.slug === tag)?.label ?? tag}</span>
                  ))}
                </div>
                <h2 className="mt-2 font-[family-name:var(--font-cormorant)] text-2xl text-white">{book.title}</h2>
                <p className="mt-1 text-sm text-gold">{book.author}</p>
                <p className="mt-3 text-sm text-muted">{book.summary}</p>
                <div className="mt-4 flex gap-4 text-sm">
                  <Link href={`/library/${book.slug}`} className="text-gold">
                    Open
                  </Link>
                  <form action={toggleFavorite.bind(null, "book", book.id)}>
                    <button className="text-gold" type="submit">
                      {state.favoriteBooks.includes(book.id) ? "Unfavorite" : "Favorite"}
                    </button>
                  </form>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
