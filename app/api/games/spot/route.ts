import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentProfile } from "@/lib/user";
import { GameError, getSpot, submitSpot } from "@/lib/games/service";
export const dynamic = "force-dynamic";
export async function GET() {
  const profile = await getCurrentProfile();
  return NextResponse.json(await getSpot(profile.id));
}
const Body = z.object({ picks: z.array(z.number().int().min(0).max(999)).max(60) });
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, code: "BAD_REQUEST", message: "요청이 올바르지 않아요" }, { status: 400 });
  const profile = await getCurrentProfile();
  try {
    return NextResponse.json(await submitSpot(profile.id, parsed.data.picks));
  } catch (e) {
    if (e instanceof GameError) return NextResponse.json({ ok: false, code: e.code, message: e.message }, { status: 409 });
    throw e;
  }
}
