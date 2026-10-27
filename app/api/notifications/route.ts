import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/user";
import { getNotifications } from "@/lib/notifications";
export const dynamic = "force-dynamic";
export async function GET() {
  const profile = await getCurrentProfile();
  return NextResponse.json(await getNotifications(profile.id));
}
