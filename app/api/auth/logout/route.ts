import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { setSessionAnonKey } from "@/lib/user";
export const dynamic = "force-dynamic";
/** 로그아웃 = 새 익명 세션으로 전환(기존 계정 기록은 그대로 남고, 다시 로그인하면 돌아온다) */
export async function POST(req: Request) {
  await setSessionAnonKey(randomUUID());
  return NextResponse.redirect(new URL("/", req.url), 303);
}
