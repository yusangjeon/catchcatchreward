import "server-only";
import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { getRepo } from "@/lib/db";
import type { Profile } from "@/lib/types";

export const COOKIE = "ccr_uid";
const ONE_YEAR = 60 * 60 * 24 * 365;

/** 세션 전환(로그인·로그아웃): 쿠키의 anonKey 를 다른 프로필의 것으로 바꾼다. Route Handler 안에서만 호출 */
export async function setSessionAnonKey(anonKey: string) {
  const jar = await cookies();
  jar.set(COOKIE, anonKey, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: ONE_YEAR });
}

/**
 * 익명 유저 식별. 쿠키가 없으면 새로 발급한다.
 * Route Handler / Server Action 에서만 쿠키 쓰기가 가능하므로 그 안에서 호출한다.
 * 로그인(카카오 등) 도입 시 anonKey → auth user 매핑으로 확장.
 */
export async function getCurrentProfile(): Promise<Profile> {
  const jar = await cookies();
  let anonKey = jar.get(COOKIE)?.value;
  if (!anonKey) {
    anonKey = randomUUID();
    jar.set(COOKIE, anonKey, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: ONE_YEAR,
    });
  }
  return getRepo().getOrCreateProfile(anonKey);
}
