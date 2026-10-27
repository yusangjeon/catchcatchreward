"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
/* eslint-disable @next/next/no-img-element */

/** 탭 아이콘 — 앱스토어 스크린샷(2.44x)에서 잘라낸 원본 픽셀. 홈은 활성(진회색) 상태로, 나머지는 비활성(회색) 상태로 캡처됨 */
const TAB_ICON: Record<string, string> = { "/": "/myb/native/tab_home.png", "/quiz": "/myb/native/tab_quiz.png", "/benefits": "/myb/native/tab_benefit.png", "/wallet": "/myb/native/tab_wallet.png", "/walk": "/myb/native/tab_walk.png" };

const TABS = [
  { href: "/", label: "홈" },
  { href: "/quiz", label: "퀴즈" },
  { href: "/benefits", label: "혜택" },
  { href: "/wallet", label: "지갑" },
  { href: "/walk", label: "만보기", highlight: true },
] as const;

/** 마이비 5탭 셸. 폰 폭(최대 430px) 중앙 정렬. 퀴즈 풀기/보상(/quiz/:id)·쇼핑적립 웹뷰(/shop)에서는 탭바 숨김 */
export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return <>{children}</>; // 관리자: 폰 프레임 없이 데스크톱 폭
  const fullscreen = /^\/(quiz\/[^/]+|shop|game|cpq|survey|roulette|exchange|history|rush|invite|missions|notifications|games|me|login|attendance|gifts|notice|support|terms|newbie|monthly)/.test(pathname);
  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.04)]">
      <main className={`flex-1 ${fullscreen ? "" : "pb-[84px]"}`}>{children}</main>
      {!fullscreen && (
        <nav
          aria-label="주요 메뉴"
          className="fixed bottom-0 left-1/2 z-30 w-full max-w-[430px] -translate-x-1/2 border-t border-line bg-white"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <ul className="grid h-[68px] grid-cols-5">
            {TABS.map((t) => {
              const active = t.href === "/" ? pathname === "/" : pathname.startsWith(t.href);
              const color = "highlight" in t && t.highlight ? "text-myb" : active ? "text-ink" : "text-[#9aa3af]";
              return (
                <li key={t.href}>
                  <Link href={t.href} aria-current={active ? "page" : undefined} className={`flex h-full flex-col items-center justify-center gap-1 ${color}`}>
                    <img
                      src={TAB_ICON[t.href]}
                      alt=""
                      className={`h-[26px] w-auto ${"highlight" in t && t.highlight ? "" : t.href === "/" ? (active ? "" : "grayscale brightness-[1.75]") : active ? "brightness-[0.45]" : ""}`}
                    />
                    <span className={`text-[11px] ${active || ("highlight" in t && t.highlight) ? "font-bold" : "font-medium"}`}>{t.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </div>
  );
}
