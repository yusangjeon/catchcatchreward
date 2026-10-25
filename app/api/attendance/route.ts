import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/user";
import { checkIn } from "@/lib/roulette/service";
export const dynamic = "force-dynamic";
export async function POST() {
  const profile = await getCurrentProfile();
  return NextResponse.json(await checkIn(profile.id));
}
