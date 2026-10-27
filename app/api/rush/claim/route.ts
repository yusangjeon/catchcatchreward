import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentProfile } from "@/lib/user";
import { claimRush, RushError } from "@/lib/rush/service";
export const dynamic = "force-dynamic";
const Body = z.object({ missionKey: z.string().min(1).max(32) });
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, code: "BAD_REQUEST", message: "요청이 올바르지 않아요" }, { status: 400 });
  const profile = await getCurrentProfile();
  try {
    return NextResponse.json(await claimRush(profile.id, parsed.data.missionKey));
  } catch (e) {
    if (e instanceof RushError) return NextResponse.json({ ok: false, code: e.code, message: e.message }, { status: e.code === "NOT_FOUND" ? 404 : 409 });
    throw e;
  }
}
