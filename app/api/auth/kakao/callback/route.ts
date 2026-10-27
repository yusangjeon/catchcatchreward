import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { kakaoExchange } from "@/lib/auth/kakao";
import { loginWithProvider } from "@/lib/auth/session";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const jar = await cookies();
  const saved = jar.get("ccr_oauth_state")?.value;
  jar.delete("ccr_oauth_state");
  if (!code || !state || state !== saved) return NextResponse.redirect(new URL("/login?error=state", req.url));
  const origin = process.env.APP_BASE_URL || url.origin;
  try {
    const u = await kakaoExchange(code, `${origin}/api/auth/kakao/callback`);
    const r = await loginWithProvider("kakao", u.id, u.nickname, u.avatarUrl);
    return NextResponse.redirect(new URL(`/me?login=1${r.merged ? "&merged=1" : ""}`, req.url));
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(new URL("/login?error=kakao", req.url));
  }
}
