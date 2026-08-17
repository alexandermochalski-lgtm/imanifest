import type { LegalSection } from "@/lib/legal";
import { legalContact, legalUpdated } from "@/lib/legal";

export function LegalDoc({
  kicker,
  title,
  intro,
  sections,
}: {
  kicker: string;
  title: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <main className="mx-auto max-w-3xl px-5 py-16">
      <p className="text-xs uppercase tracking-[0.28em] text-gold">{kicker}</p>
      <h1 className="mt-3 font-[family-name:var(--font-cormorant)] text-5xl text-white">{title}</h1>
      <p className="mt-4 text-sm text-muted">Last updated {legalUpdated}</p>
      <p className="mt-6 text-lg leading-8 text-[#d4d4d4]">{intro}</p>
      <div className="mt-12 space-y-10">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="font-[family-name:var(--font-cormorant)] text-2xl text-white">{section.title}</h2>
            {section.paragraphs.map((paragraph, index) => (
              <p key={`${section.title}-${index}`} className="mt-3 leading-8 text-muted">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </div>
      <p className="mt-14 text-sm text-muted">
        Contact{" "}
        <a className="text-gold underline-offset-4 hover:underline" href={`mailto:${legalContact}`}>
          {legalContact}
        </a>
        .
      </p>
    </main>
  );
}
