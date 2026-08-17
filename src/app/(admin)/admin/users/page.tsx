import { seedUsers } from "@/lib/catalog";

export default function AdminUsersPage() {
  return (
    <main>
      <h1 className="font-[family-name:var(--font-cormorant)] text-4xl text-white">Users & permissions</h1>
      <p className="mt-2 text-sm text-muted">Spatie roles from Laravel: student vs admin. Registrar seats can open this desk.</p>
      <ul className="mt-8 space-y-3">
        {seedUsers.map((user) => (
          <li key={user.id} className="rounded-xl border border-[var(--line)] p-4">
            <p className="text-white">
              {user.name} · {user.role}
            </p>
            <p className="text-sm text-muted">
              {user.email} · {user.username} · {user.phone}
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
