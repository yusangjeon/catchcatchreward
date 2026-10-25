import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/user";
import { RouletteError, spin } from "@/lib/roulette/service";
export const dynamic = "force-dynamic";
export async function POST() {
  const profile = await getCurrentProfile();
  try {
    return NextResponse.json(await spin(profile.id));
  } catch (e) {
    if (e instanceof RouletteError) return NextResponse.json({ ok: false, code: e.code, message: e.message }, { status: 409 });
    throw e;
  }
}
