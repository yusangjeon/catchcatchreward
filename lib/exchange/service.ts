import "server-only";
import { getRepo } from "@/lib/db";
import type { LedgerEntry, Redemption, Wallet } from "@/lib/types";
import { MIN_REDEEM_POINTS, PRODUCTS, productByKind, type Product } from "./products";

export class ExchangeError extends Error {
  constructor(public code: "UNKNOWN_PRODUCT" | "NOT_ENOUGH_POINTS" | "BELOW_MIN", message: string) {
    super(message);
  }
}

export interface ExchangePayload {
  wallet: Wallet;
  minRedeem: number;
  products: Product[];
  redemptions: (Redemption & { productName: string })[];
}

async function wallet(userId: string): Promise<Wallet> {
  const repo = getRepo();
  const [balance, stamps] = await Promise.all([repo.getBalance(userId), repo.countUnconsumedStamps(userId)]);
  return { balance, stamps };
}

export async function getExchange(userId: string): Promise<ExchangePayload> {
  const repo = getRepo();
  const [w, reds] = await Promise.all([wallet(userId), repo.listRedemptions(userId)]);
  return { wallet: w, minRedeem: MIN_REDEEM_POINTS, products: PRODUCTS, redemptions: reds.map((r) => ({ ...r, productName: productByKind(r.kind)?.name ?? r.kind })) };
}

/** 교환 신청: 잔액 검증 → redemption(requested) 생성 → 원장 차감(redeem). 발송은 운영자가 관리자에서 처리 */
export async function requestRedemption(userId: string, kind: string): Promise<{ ok: true; redemption: Redemption; wallet: Wallet }> {
  const repo = getRepo();
  const product = productByKind(kind);
  if (!product) throw new ExchangeError("UNKNOWN_PRODUCT", "없는 상품이에요");
  const balance = await repo.getBalance(userId);
  if (balance < MIN_REDEEM_POINTS) throw new ExchangeError("BELOW_MIN", `${MIN_REDEEM_POINTS.toLocaleString("ko-KR")}P부터 교환할 수 있어요`);
  if (balance < product.points) throw new ExchangeError("NOT_ENOUGH_POINTS", `포인트가 ${(product.points - balance).toLocaleString("ko-KR")}P 부족해요`);
  const redemption = await repo.addRedemption({ userId, kind, amountPoints: product.points });
  await repo.addLedger({ userId, delta: -product.points, reason: "redeem", refType: "redemption", refId: redemption.id, memo: product.name });
  return { ok: true, redemption, wallet: await wallet(userId) };
}

export async function getLedger(userId: string): Promise<{ wallet: Wallet; entries: LedgerEntry[] }> {
  const repo = getRepo();
  const [w, entries] = await Promise.all([wallet(userId), repo.listLedger(userId, 100)]);
  return { wallet: w, entries };
}
