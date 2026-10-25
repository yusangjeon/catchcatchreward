import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/user";
import { getBenefit } from "@/lib/benefit/service";

export const dynamic = "force-dynamic";

export async function GET() {
  const profile = await getCurrentProfile();
  return NextResponse.json(await getBenefit(profile.id));
}
