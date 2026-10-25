import { NextResponse } from "next/server";
import { getRepo } from "@/lib/db";
import { getCurrentProfile } from "@/lib/user";

export const dynamic = "force-dynamic";

/**
 * 개발·QA 전용: 현재 유저에게 스탬프 n개 지급. CCR_DEV_TOOLS=1 일 때만 열린다(배포 기본값 닫힘).
 * 관리자 화면(④)이 생기면 운영자 권한 지급으로 대체.
 */
export async function POST(req: Request) {
  if (process.env.CCR_DEV_TOOLS !== "1") return NextResponse.json({ ok: false, code: "FORBIDDEN" }, { status: 403 });
  const profile = await getCurrentProfile();
  const body = (await req.json().catch(() => ({}))) as { n?: number };
  const n = Math.min(50, Math.max(1, Number(body.n ?? 1)));
  const repo = getRepo();
  for (let i = 0; i < n; i++) await repo.addStamp({ userId: profile.id, sourceType: "admin", sourceId: `dev-${Date.now()}-${i}` });
  return NextResponse.json({ ok: true, stamps: await repo.countUnconsumedStamps(profile.id) });
}
