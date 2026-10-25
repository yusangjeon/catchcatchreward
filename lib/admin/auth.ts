import "server-only";
import { cookies } from "next/headers";
import { createHash, timingSafeEqual } from "node:crypto";

const COOKIE = "ccr_admin";

/**
 * 관리자 인증(최소): ADMIN_KEY 환경변수와 일치하는 키로 로그인 → httpOnly 쿠키(키의 sha256).
 * ADMIN_KEY 가 없으면 관리자 비활성. 단 CCR_DEV_TOOLS=1(로컬 QA)에서는 키 없이 열린다.
 */
export function adminEnabled(): boolean {
  return !!process.env.ADMIN_KEY || process.env.CCR_DEV_TOOLS === "1";
}

const digest = (key: string) => createHash("sha256").update(key).digest("hex");

export function checkKey(key: string): boolean {
  const expected = process.env.ADMIN_KEY;
  if (!expected) return process.env.CCR_DEV_TOOLS === "1";
  const a = Buffer.from(digest(key));
  const b = Buffer.from(digest(expected));
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function isAdmin(): Promise<boolean> {
  if (!adminEnabled()) return false;
  if (!process.env.ADMIN_KEY) return true; // dev
  const jar = await cookies();
  return jar.get(COOKIE)?.value === digest(process.env.ADMIN_KEY);
}

export async function setAdminCookie(key: string) {
  const jar = await cookies();
  jar.set(COOKIE, digest(key), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/admin", maxAge: 60 * 60 * 12 });
}

export async function clearAdminCookie() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

/** 보호 페이지 진입 가드: 비활성 → /admin/login(안내), 미인증 → /admin/login */
export async function requireAdmin() {
  const { redirect } = await import("next/navigation");
  if (!(await isAdmin())) redirect("/admin/login");
}
