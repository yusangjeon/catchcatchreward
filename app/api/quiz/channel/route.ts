import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/user";
import { getChannel } from "@/lib/quiz/service";
export const dynamic = "force-dynamic";
export async function GET() {
  const profile = await getCurrentProfile();
  return NextResponse.json(await getChannel(profile.id));
}
