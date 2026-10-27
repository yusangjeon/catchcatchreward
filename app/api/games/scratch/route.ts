import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/user";
import { GameError, playScratch } from "@/lib/games/service";
export const dynamic = "force-dynamic";
export async function POST() {
  const profile = await getCurrentProfile();
  try {
    return NextResponse.json(await playScratch(profile.id));
  } catch (e) {
    if (e instanceof GameError) return NextResponse.json({ ok: false, code: e.code, message: e.message }, { status: 409 });
    throw e;
  }
}
