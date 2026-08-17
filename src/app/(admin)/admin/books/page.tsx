import { AdminTable, PageHeader } from "@/components/admin/ui";
import { books } from "@/lib/catalog";

export default function AdminBooksPage() {
  return (
    <main>
      <PageHeader
        kicker="Catalog"
        title="Books"
        description="Library titles on the student campus. Coin price is the checkout cost inside /library."
      />
      <AdminTable columns={["Title", "Author", "Faculty", "Pages", "Price"]}>
        {books.map((book) => (
          <tr key={book.id} className="border-t border-[var(--line)]">
            <td className="px-4 py-3 text-white">{book.title}</td>
            <td className="px-4 py-3">{book.author}</td>
            <td className="px-4 py-3">{book.category}</td>
            <td className="px-4 py-3">{book.pages}</td>
            <td className="px-4 py-3 text-gold">{book.price === 0 ? "free" : `${book.price} coins`}</td>
          </tr>
        ))}
      </AdminTable>
    </main>
  );
}
