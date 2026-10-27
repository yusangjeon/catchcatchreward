import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/user";
import { pushEnabled, sendToUser } from "@/lib/push/service";
export const dynamic = "force-dynamic";
/** 내 기기로 테스트 발송 */
export async function POST() {
  if (!pushEnabled()) return NextResponse.json({ ok: false, code: "DISABLED", message: "푸시가 아직 설정되지 않았어요" }, { status: 409 });
  const profile = await getCurrentProfile();
  const r = await sendToUser(profile.id, { title: "캐치캐치리워드 알림 테스트", body: "이렇게 출석·퀴즈·보상 소식을 보내드려요", url: "/notifications", tag: "test" });
  return NextResponse.json({ ok: true, ...r });
}
