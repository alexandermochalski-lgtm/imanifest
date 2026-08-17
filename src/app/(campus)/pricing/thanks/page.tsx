import { redirect } from "next/navigation";

export default async function CoinThanksPage({
  searchParams,
}: {
  searchParams: Promise<{ pack?: string }>;
}) {
  const { pack = "" } = await searchParams;
  const next = pack ? `/api/stripe/coins?pack=${encodeURIComponent(pack)}` : "/api/stripe/coins";
  redirect(next);
}
