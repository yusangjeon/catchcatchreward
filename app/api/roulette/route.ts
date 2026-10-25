import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/user";
import { getRoulette } from "@/lib/roulette/service";
export const dynamic = "force-dynamic";
export async function GET() {
  const profile = await getCurrentProfile();
  return NextResponse.json(await getRoulette(profile.id));
}
