import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentProfile } from "@/lib/user";
import { WalkError, claimGoal } from "@/lib/walk/service";
export const dynamic = "force-dynamic";
const Body = z.object({ goal: z.number().int().min(1).max(100000) });
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, code: "BAD_REQUEST", message: "요청이 올바르지 않아요" }, { status: 400 });
  const profile = await getCurrentProfile();
  try {
    return NextResponse.json(await claimGoal(profile.id, parsed.data.goal));
  } catch (e) {
    if (e instanceof WalkError) return NextResponse.json({ ok: false, code: e.code, message: e.message }, { status: 409 });
    throw e;
  }
}
