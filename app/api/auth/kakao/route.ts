import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { kakaoAuthorizeUrl, kakaoEnabled } from "@/lib/auth/kakao";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  if (!kakaoEnabled()) return NextResponse.redirect(new URL("/login?error=not_configured", req.url));
  const origin = process.env.APP_BASE_URL || new URL(req.url).origin;
  const state = randomUUID();
  (await cookies()).set("ccr_oauth_state", state, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 600 });
  return NextResponse.redirect(kakaoAuthorizeUrl(`${origin}/api/auth/kakao/callback`, state));
}
