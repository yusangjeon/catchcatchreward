import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/user";
import { getMissions } from "@/lib/missions/service";
export const dynamic = "force-dynamic";
export async function GET() {
  const profile = await getCurrentProfile();
  return NextResponse.json(await getMissions(profile.id));
}
