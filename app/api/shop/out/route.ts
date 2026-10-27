import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/user";
import { getRepo } from "@/lib/db";
import { kstDayKey } from "@/lib/time";
import { merchantOutUrl } from "@/lib/shop/service";
import { SHOP_CLICK_POINTS } from "@/lib/shop/affiliate";

export const dynamic = "force-dynamic";

/** 제휴 쇼핑몰 아웃링크: 쇼핑몰·하루 1회 방문 적립(원장 mission/shop_click) 후 제휴 URL 로 302 */
export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("merchant") ?? "";
  const url = merchantOutUrl(id);
  if (!url) return NextResponse.json({ ok: false, code: "NOT_FOUND" }, { status: 404 });
  const profile = await getCurrentProfile();
  const repo = getRepo();
  const refId = `${kstDayKey()}:${id}`;
  const already = (await repo.listLedger(profile.id, 300)).some((e) => e.refType === "shop_click" && e.refId === refId);
  if (!already) await repo.addLedger({ userId: profile.id, delta: SHOP_CLICK_POINTS, reason: "mission", refType: "shop_click", refId, memo: `쇼핑몰 방문 · ${id}` });
  return NextResponse.redirect(url, 302);
}
