import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { dynamicPages } from "@/lib/catalog";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (slug === "privacy") return { title: "Privacy" };
  if (slug === "terms" || slug === "legal") return { title: "Legal" };
  const page = dynamicPages.find((item) => item.slug === slug);
  return { title: page?.title ?? "Page" };
}

export default async function DynamicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug === "privacy") redirect("/privacy");
  if (slug === "terms" || slug === "legal") redirect("/legal");
  const page = dynamicPages.find((item) => item.slug === slug);
  if (!page) notFound();
  return (
    <main className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="font-[family-name:var(--font-cormorant)] text-5xl text-white">{page.title}</h1>
      <p className="mt-6 text-lg leading-8 text-muted">{page.body}</p>
    </main>
  );
}
