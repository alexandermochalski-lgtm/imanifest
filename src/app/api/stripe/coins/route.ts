import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { appendLivePayment } from "@/lib/admin-state";
import { getSession } from "@/lib/session";
import { mutateState, notify } from "@/lib/state";
import { COIN_PENDING_COOKIE, coinPackFromId } from "@/lib/stripe";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) redirect("/login?next=/pricing");
  const pending = (await cookies()).get(COIN_PENDING_COOKIE)?.value ?? "";
  const pack = coinPackFromId(pending);
  const queryPack = new URL(request.url).searchParams.get("pack") ?? "";
  if (!pack) {
    redirect(queryPack && coinPackFromId(queryPack) ? "/pricing?ok=purchase" : "/pricing?error=return");
  }
  if (queryPack && queryPack !== pack.id) {
    (await cookies()).delete(COIN_PENDING_COOKIE);
    redirect("/pricing?error=return");
  }
  const credited = pack.coins + pack.bonus;
  (await cookies()).delete(COIN_PENDING_COOKIE);
  await mutateState((state) =>
    notify(
      { ...state, coins: state.coins + credited },
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
