import { NextResponse } from "next/server";
import { getGameDetail } from "@/lib/game/service";
export const dynamic = "force-dynamic";
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const data = getGameDetail(id);
  if (!data) return NextResponse.json({ ok: false, code: "NOT_FOUND", message: "게임을 찾을 수 없어요" }, { status: 404 });
  return NextResponse.json(data);
}
