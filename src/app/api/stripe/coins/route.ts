import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { appendLivePayment } from "@/lib/admin-state";
import { getSession } from "@/lib/session";
import { getState, mutateState, notify } from "@/lib/state";
import { COIN_PENDING_COOKIE, coinPackFromId } from "@/lib/stripe";

const CREDIT_WINDOW_MS = 10 * 60 * 1000;

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) redirect("/login?next=/pricing");

  const pending = (await cookies()).get(COIN_PENDING_COOKIE)?.value ?? "";
  const queryPack = new URL(request.url).searchParams.get("pack") ?? "";
  const pack = coinPackFromId(queryPack) ?? coinPackFromId(pending);
  (await cookies()).delete(COIN_PENDING_COOKIE);

  if (!pack) redirect("/pricing?error=return");

  const current = await getState();
  const lastAt = Date.parse(current.lastCoinCreditAt);
  const duplicate =
    current.lastCoinPackId === pack.id && Number.isFinite(lastAt) && Date.now() - lastAt < CREDIT_WINDOW_MS;
  if (duplicate) redirect("/pricing?ok=purchase");

  const credited = pack.coins + pack.bonus;
  await mutateState((state) =>
    notify(
      {
        ...state,
        coins: state.coins + credited,
        lastCoinPackId: pack.id,
        lastCoinCreditAt: new Date().toISOString(),
      },
      "Coins credited",
      `${credited} coins from ${pack.name} are on the ledger.`,
      "/pricing",
    ),
  );
  await appendLivePayment({
    id: `live-coins-${session.userId}-${pack.id}-${Date.now()}`,
    userId: session.userId,
    kind: "coins",
    sku: pack.id,
    label: `${pack.name} pack`,
    amountUsd: pack.price,
    coins: credited,
    status: "paid",
    createdAt: new Date().toISOString().slice(0, 10),
  });
  redirect("/pricing?ok=purchase");
}
