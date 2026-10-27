import Link from "next/link";
import { adminEnabled, isAdmin } from "@/lib/admin/auth";
import { repoKind } from "@/lib/db";
import { logoutAction } from "./actions";

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin", label: "대시보드" },
  { href: "/admin/quizzes", label: "퀴즈" },
  { href: "/admin/roulette", label: "룰렛 확률" },
  { href: "/admin/badges", label: "배지" },
  { href: "/admin/insights", label: "인사이트" },
  { href: "/admin/stores", label: "매장 미션" },
  { href: "/admin/redemptions", label: "교환 신청" },
  { href: "/admin/grant", label: "수동 지급" },
  { href: "/admin/users", label: "유저" },
  { href: "/admin/push", label: "푸시" },
  { href: "/admin/db", label: "DB" },
];

/** 관리자(최소) — 데스크톱 폭. 폰 셸(Shell)은 /admin 에서 비활성 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authed = await isAdmin();
  return (
    <div className="min-h-dvh bg-[#f4f6fa] text-[#191f28]">
      <header className="border-b border-[#e3e8f0] bg-white">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="text-[16px] font-bold">캐치캐치리워드 <span className="text-[#427cff]">관리자</span></Link>
            {authed && (
              <nav className="hidden gap-4 text-[14px] text-[#5c6573] md:flex">
                {NAV.map((n) => <Link key={n.href} href={n.href} className="hover:text-[#191f28]">{n.label}</Link>)}
              </nav>
            )}
          </div>
          <div className="flex items-center gap-3 text-[12px] text-[#8b94a0]">
            <span className="rounded-full bg-[#f0f4ff] px-2 py-1 text-[#427cff]">저장소: {repoKind()}</span>
            {!adminEnabled() && <span className="text-[#ff3939]">ADMIN_KEY 미설정</span>}
            {authed && process.env.ADMIN_KEY && (
              <form action={logoutAction}><button type="submit" className="rounded-lg border border-[#dee2e9] px-3 py-1.5 text-[#5c6573]">로그아웃</button></form>
            )}
          </div>
        </div>
        {authed && (
          <nav className="mx-auto flex max-w-5xl gap-4 overflow-x-auto px-5 pb-3 text-[14px] text-[#5c6573] md:hidden">
            {NAV.map((n) => <Link key={n.href} href={n.href} className="whitespace-nowrap">{n.label}</Link>)}
          </nav>
        )}
      </header>
      <main className="mx-auto max-w-5xl px-5 py-6">{children}</main>
    </div>
  );
}
