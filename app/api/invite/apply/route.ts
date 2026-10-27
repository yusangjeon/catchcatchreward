import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentProfile } from "@/lib/user";
import { applyInviteCode, InviteError } from "@/lib/invite/service";
export const dynamic = "force-dynamic";
const Body = z.object({ code: z.string().min(1).max(32) });
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, code: "BAD_REQUEST", message: "요청이 올바르지 않아요" }, { status: 400 });
  const profile = await getCurrentProfile();
  try {
    return NextResponse.json(await applyInviteCode(profile.id, parsed.data.code));
  } catch (e) {
    if (e instanceof InviteError) return NextResponse.json({ ok: false, code: e.code, message: e.message }, { status: 409 });
    throw e;
  }
}
