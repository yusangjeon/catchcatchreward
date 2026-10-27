import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/user";
import { getRush } from "@/lib/rush/service";
export const dynamic = "force-dynamic";
export async function GET() {
  const profile = await getCurrentProfile();
  return NextResponse.json(await getRush(profile.id));
}
