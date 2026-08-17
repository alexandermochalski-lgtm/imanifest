import { notFound } from "next/navigation";
import { guides } from "@/lib/catalog";

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = guides.find((item) => item.slug === slug);
  if (!guide) notFound();
  return (
    <main>
      <p className="text-xs uppercase tracking-[0.2em] text-gold">{guide.tag}</p>
      <h1 className="mt-2 font-[family-name:var(--font-cormorant)] text-4xl text-white">{guide.title}</h1>
      <p className="mt-6 max-w-2xl leading-8 text-muted">{guide.body}</p>
    </main>
  );
}
