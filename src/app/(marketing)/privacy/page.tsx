import type { Metadata } from "next";
import { LegalDoc } from "@/components/LegalDoc";
import { privacySections } from "@/lib/legal";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <LegalDoc
      kicker="Legal"
      title="Privacy"
      intro="How iManifest University handles account, payment, campus, and media data. Faculty uploads use Vercel Blob. Supabase is used for login and membership records, not for course file storage."
      sections={privacySections}
    />
  );
}
