import { NextResponse } from "next/server";
import { loginWithProvider } from "@/lib/auth/session";
export const dynamic = "force-dynamic";
/** 개발 전용 모의 로그인(CCR_DEV_TOOLS=1): 카카오 키 없이 로그인·이관 흐름을 검증 */
export async function POST(req: Request) {
  if (process.env.CCR_DEV_TOOLS !== "1") return NextResponse.json({ ok: false, code: "FORBIDDEN" }, { status: 403 });
  const fd = await req.formData().catch(() => null);
  const id = String(fd?.get("id") ?? "").trim();
  const nickname = String(fd?.get("nickname") ?? "").trim() || undefined;
  if (!id) return NextResponse.json({ ok: false, code: "BAD_REQUEST" }, { status: 400 });
  const r = await loginWithProvider("dev", id, nickname, undefined);
  return NextResponse.redirect(new URL(`/me?login=1${r.merged ? "&merged=1" : ""}`, req.url), 303);
}
