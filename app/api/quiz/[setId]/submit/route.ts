import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentProfile } from "@/lib/user";
import { submitSet, QuizError } from "@/lib/quiz/service";

export const dynamic = "force-dynamic";

const Body = z.object({
  answers: z.array(z.object({ quizId: z.string().min(1), optionId: z.string().min(1) })).min(1).max(50),
});

export async function POST(req: Request, ctx: { params: Promise<{ setId: string }> }) {
  const { setId } = await ctx.params;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, code: "BAD_REQUEST", message: "요청이 올바르지 않아요" }, { status: 400 });
  }
  const profile = await getCurrentProfile();
  try {
    return NextResponse.json(await submitSet(profile.id, setId, parsed.data.answers));
  } catch (e) {
    if (e instanceof QuizError) {
      const status = e.code === "NOT_FOUND" ? 404 : 409;
      return NextResponse.json({ ok: false, code: e.code, message: e.message }, { status });
    }
    console.error(e);
    return NextResponse.json({ ok: false, code: "INTERNAL", message: "잠시 후 다시 시도해 주세요" }, { status: 500 });
  }
}
