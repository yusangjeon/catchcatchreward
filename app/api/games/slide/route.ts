import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentProfile } from "@/lib/user";
import { GameError, playSlide } from "@/lib/games/service";
export const dynamic = "force-dynamic";
const Body = z.object({ score: z.number().int().min(0).max(200000), maxTile: z.number().int().min(2).max(65536) });
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, code: "BAD_REQUEST", message: "요청이 올바르지 않아요" }, { status: 400 });
  const profile = await getCurrentProfile();
  try {
    return NextResponse.json(await playSlide(profile.id, parsed.data.score, parsed.data.maxTile));
  } catch (e) {
    if (e instanceof GameError) return NextResponse.json({ ok: false, code: e.code, message: e.message }, { status: 409 });
    throw e;
  }
}
