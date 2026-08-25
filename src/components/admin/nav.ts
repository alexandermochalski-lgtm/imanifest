export type AdminNavLink = { href: string; label: string };

export type AdminNavGroup = {
  label: string;
  links: AdminNavLink[];
};

export const adminNavGroups: AdminNavGroup[] = [
  {
    label: "Desk",
    links: [
      { href: "/admin", label: "Command" },
      { href: "/admin/payments", label: "Payments" },
      { href: "/admin/registrations", label: "Registrations" },
    ],
  },
  {
    label: "People",
    links: [
      { href: "/admin/users", label: "Users" },
      { href: "/admin/enrollments", label: "Enrollments" },
      { href: "/admin/applications", label: "Applications" },
    ],
  },
  {
    label: "Catalog",
    links: [
      { href: "/admin/courses", label: "Courses" },
      { href: "/admin/books", label: "Books" },
      { href: "/admin/bundles", label: "Bundles" },
      { href: "/admin/media", label: "Media" },
      { href: "/admin/jobs", label: "Jobs" },
      { href: "/admin/coins", label: "Coins & promo" },
    ],
  },
  {
    label: "Campus",
    links: [
      { href: "/admin/matching", label: "AI Matching" },
      { href: "/admin/content", label: "Content" },
      { href: "/admin/settings", label: "Settings" },
    ],
  },
];

export const adminNavLinks = adminNavGroups.flatMap((group) => group.links);

export function isAdminNavActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}
