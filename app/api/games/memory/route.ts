import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentProfile } from "@/lib/user";
import { GameError, playMemory } from "@/lib/games/service";
export const dynamic = "force-dynamic";
const Body = z.object({ moves: z.number().int().min(1).max(999), seconds: z.number().int().min(1).max(3600) });
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, code: "BAD_REQUEST", message: "요청이 올바르지 않아요" }, { status: 400 });
  const profile = await getCurrentProfile();
  try {
    return NextResponse.json(await playMemory(profile.id, parsed.data.moves, parsed.data.seconds));
  } catch (e) {
    if (e instanceof GameError) return NextResponse.json({ ok: false, code: e.code, message: e.message }, { status: 409 });
    throw e;
  }
}
