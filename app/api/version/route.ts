import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
/** 현재 서버(배포)의 커밋. 클라이언트 번들에 박힌 NEXT_PUBLIC_COMMIT 과 다르면 새 배포가 올라간 것 */
export function GET() {
  return NextResponse.json({ commit: process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.NEXT_PUBLIC_COMMIT ?? "dev" }, { headers: { "cache-control": "no-store" } });
}
