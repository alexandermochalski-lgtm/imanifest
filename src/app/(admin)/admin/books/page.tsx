import { books } from "@/lib/catalog";

export default function AdminBooksPage() {
  return (
    <main>
      <h1 className="font-[family-name:var(--font-cormorant)] text-4xl text-white">Books</h1>
      <ul className="mt-8 space-y-3">
        {books.map((book) => (
          <li key={book.id} className="rounded-xl border border-[var(--line)] p-4">
            <p className="text-white">{book.title}</p>
            <p className="text-sm text-muted">
              {book.author} · {book.category} · {book.price === 0 ? "free" : `${book.price} coins`}
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
