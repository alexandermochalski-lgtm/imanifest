import type { Metadata } from "next";
import { LegalDoc } from "@/components/LegalDoc";
import { legalSections } from "@/lib/legal";

export const metadata: Metadata = { title: "Legal" };

export default function LegalPage() {
  return (
    <LegalDoc
      kicker="Legal"
      title="Terms of use"
      intro="The rules for the public catalog and the paid campus seat. Education only. USD 49.99 per month via Stripe. Coins are a campus ledger, not cash."
      sections={legalSections}
    />
  );
}
