import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/user";
import { getToday } from "@/lib/quiz/service";

export const dynamic = "force-dynamic";

export async function GET() {
  const profile = await getCurrentProfile();
  const payload = await getToday(profile.id);
  return NextResponse.json(payload);
}
