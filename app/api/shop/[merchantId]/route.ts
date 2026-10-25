import { NextResponse } from "next/server";
import { getMerchant } from "@/lib/shop/service";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ merchantId: string }> }) {
  const { merchantId } = await ctx.params;
  const data = getMerchant(merchantId);
  if (!data) return NextResponse.json({ ok: false, code: "NOT_FOUND", message: "쇼핑몰을 찾을 수 없어요" }, { status: 404 });
  return NextResponse.json(data);
}
