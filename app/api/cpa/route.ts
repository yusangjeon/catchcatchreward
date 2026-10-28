import { NextResponse } from "next/server";
import { CPA_GOAL, CPA_ITEMS } from "@/lib/cpa/seed";
export const dynamic = "force-dynamic";
/** 고보상·간편 참여 목록(연동 전 목업). 누적 미션은 0 고정 */
export async function GET() {
  return NextResponse.json({ items: CPA_ITEMS, hot: CPA_ITEMS.filter((i) => i.hot), mission: { currentPoint: 0, ...CPA_GOAL }, totalAvailable: CPA_ITEMS.reduce((s, i) => s + i.reward, 0) });
}
