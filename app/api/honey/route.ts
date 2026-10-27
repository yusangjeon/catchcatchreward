import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/user";
import { QuizError, topupHoney } from "@/lib/quiz/service";
export const dynamic = "force-dynamic";
/** 꿀 충전(광고 시청 완료 후 호출). 리워드 영상 SDK 연동 전까지는 클라이언트 15초 타이머가 "광고" 역할 */
export async function POST() {
  const profile = await getCurrentProfile();
  try {
    return NextResponse.json(await topupHoney(profile.id));
  } catch (e) {
    if (e instanceof QuizError) return NextResponse.json({ ok: false, code: e.code, message: e.message }, { status: 409 });
    throw e;
  }
}
