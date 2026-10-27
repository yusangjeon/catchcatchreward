import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentProfile } from "@/lib/user";
import { GameError, getSpot, spotHint, spotTap, submitSpot } from "@/lib/games/service";
export const dynamic = "force-dynamic";
export async function GET() {
  const profile = await getCurrentProfile();
  return NextResponse.json(await getSpot(profile.id));
}
const Token = z.object({ id: z.string().min(1).max(8), token: z.string().min(1).max(128) });
const Body = z.discriminatedUnion("action", [
  z.object({ action: z.literal("tap"), level: z.string().min(1).max(32), x: z.number().min(0).max(1), y: z.number().min(0).max(1), tokens: z.array(Token).max(8) }),
  z.object({ action: z.literal("hint"), level: z.string().min(1).max(32), tokens: z.array(Token).max(8) }),
  z.object({ action: z.literal("submit"), level: z.string().min(1).max(32), tokens: z.array(Token).max(8), seconds: z.number().min(0).max(600) }),
]);
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, code: "BAD_REQUEST", message: "요청이 올바르지 않아요" }, { status: 400 });
  const profile = await getCurrentProfile();
  const b = parsed.data;
  try {
    if (b.action === "tap") return NextResponse.json(await spotTap(profile.id, b.level, b.x, b.y, b.tokens));
    if (b.action === "hint") return NextResponse.json(await spotHint(profile.id, b.level, b.tokens));
    return NextResponse.json(await submitSpot(profile.id, b.level, b.tokens, b.seconds));
  } catch (e) {
    if (e instanceof GameError) return NextResponse.json({ ok: false, code: e.code, message: e.message }, { status: 409 });
    throw e;
  }
}
