import Link from "next/link";
import { notFound } from "next/navigation";
import { toggleFavorite } from "@/app/actions/campus";
import { campusMediaHref } from "@/lib/blob-access";
import { getLiveBookBySlug } from "@/lib/live-catalog";
import { getState } from "@/lib/state";

export default async function BookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const book = await getLiveBookBySlug(slug);
  if (!book) notFound();
  const state = await getState();
  const fileHref = campusMediaHref(book.fileUrl) ?? `/download/pdf/${book.id}`;
  return (
    <main>
      <h1 className="font-[family-name:var(--font-cormorant)] text-4xl text-white">{book.title}</h1>
      <p className="mt-2 text-gold">
        {book.author} · {book.pages} pages · {book.price === 0 ? "Included" : `${book.price} coins`}
      </p>
      <p className="mt-6 max-w-2xl imu-prose text-muted">{book.summary}</p>
      <div className="mt-8 flex gap-4">
        <form action={toggleFavorite.bind(null, "book", book.id)}>
          <button className="gold-btn rounded-full px-5 py-2 text-sm" type="submit">
            {state.favoriteBooks.includes(book.id) ? "Remove favorite" : "Favorite"}
          </button>
        </form>
        <Link href={fileHref} className="text-sm text-gold" target="_blank">
          {book.fileUrl ? "Open PDF" : "Download PDF"}
        </Link>
      </div>
    </main>
  );
}
