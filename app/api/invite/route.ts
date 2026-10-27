import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/user";
import { getInvite } from "@/lib/invite/service";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  const profile = await getCurrentProfile();
  return NextResponse.json(await getInvite(profile.id, new URL(req.url).origin));
}
