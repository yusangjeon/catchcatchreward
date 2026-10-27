import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentProfile } from "@/lib/user";
import { claimNewbie, getNewbie } from "@/lib/quiz/newbie";
export const dynamic = "force-dynamic";
export async function GET() {
  const profile = await getCurrentProfile();
  return NextResponse.json(await getNewbie(profile.id));
}
const Body = z.object({ day: z.number().int().min(1).max(3) });
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, code: "BAD_REQUEST", message: "요청이 올바르지 않아요" }, { status: 400 });
  const profile = await getCurrentProfile();
  try {
    return NextResponse.json(await claimNewbie(profile.id, parsed.data.day));
  } catch (e) {
    const code = e instanceof Error ? e.message : "ERROR";
    const msg = code === "ALREADY_CLAIMED" ? "이미 받은 보상이에요" : code === "NOT_COMPLETED" ? "아직 퀴즈 3개를 다 풀지 않았어요" : "보상을 받을 수 없어요";
    return NextResponse.json({ ok: false, code, message: msg }, { status: code === "NOT_FOUND" ? 404 : 409 });
  }
}
