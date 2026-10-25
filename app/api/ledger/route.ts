import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/user";
import { getLedger } from "@/lib/exchange/service";
export const dynamic = "force-dynamic";
export async function GET() {
  const profile = await getCurrentProfile();
  return NextResponse.json(await getLedger(profile.id));
}
