import Link from "next/link";
import { AdminTable, PageHeader } from "@/components/admin/ui";
import { Flash } from "@/components/ui";
import { getLiveBooks } from "@/lib/live-catalog";

export default async function AdminBooksPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const { ok, error } = await searchParams;
  const books = await getLiveBooks();
  return (
    <main>
      <PageHeader
        kicker="Catalog"
        title="Books"
        description="Library titles. Attach a PDF from Media, then students can open it from /library."
        action={
          <Link className="gold-btn rounded-xl px-4 py-2 text-[10px]" href="/admin/books/new">
            New book
          </Link>
        }
      />
      <Flash map={{ created: "Book published to the library.", missing: "Book not found." }} ok={ok} error={error} />
      <AdminTable columns={["Title", "Author", "Faculty", "Pages", "Price", "File"]}>
        {books.map((book) => (
          <tr key={book.id} className="border-t border-[var(--line)]">
            <td className="px-4 py-3">
              <Link className="text-white hover:text-gold" href={`/admin/books/${book.id}`}>
                {book.title}
              </Link>
            </td>
            <td className="px-4 py-3">{book.author}</td>
            <td className="px-4 py-3">{book.category}</td>
            <td className="px-4 py-3">{book.pages}</td>
            <td className="px-4 py-3 text-gold">{book.price === 0 ? "free" : `${book.price} coins`}</td>
            <td className="px-4 py-3">{book.fileUrl ? "PDF" : "—"}</td>
          </tr>
        ))}
      </AdminTable>
    </main>
  );
}
