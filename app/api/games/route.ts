import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/user";
import { getGames } from "@/lib/games/service";
export const dynamic = "force-dynamic";
export async function GET() {
  const profile = await getCurrentProfile();
  return NextResponse.json(await getGames(profile.id));
}
