import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/user";
import { getSetPayload, QuizError } from "@/lib/quiz/service";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ setId: string }> }) {
  const { setId } = await ctx.params;
  const profile = await getCurrentProfile();
  try {
    return NextResponse.json(await getSetPayload(profile.id, setId));
  } catch (e) {
    if (e instanceof QuizError) return NextResponse.json({ ok: false, code: e.code, message: e.message }, { status: 404 });
    throw e;
  }
}
