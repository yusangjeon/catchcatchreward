import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentProfile } from "@/lib/user";
import { claimLotto, getLotto, LottoError, pickLotto } from "@/lib/games/lotto";
export const dynamic = "force-dynamic";
const Body = z.discriminatedUnion("action", [
  z.object({ action: z.literal("pick"), numbers: z.array(z.number().int()).length(6) }),
  z.object({ action: z.literal("claim"), dayKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }),
]);
export async function GET() {
  const profile = await getCurrentProfile();
  return NextResponse.json(await getLotto(profile.id));
}
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, code: "BAD_REQUEST", message: "요청이 올바르지 않아요" }, { status: 400 });
  const profile = await getCurrentProfile();
  try {
    if (parsed.data.action === "pick") return NextResponse.json(await pickLotto(profile.id, parsed.data.numbers));
    return NextResponse.json(await claimLotto(profile.id, parsed.data.dayKey));
  } catch (e) {
    if (e instanceof LottoError) return NextResponse.json({ ok: false, code: e.code, message: e.message }, { status: 409 });
    throw e;
  }
}
