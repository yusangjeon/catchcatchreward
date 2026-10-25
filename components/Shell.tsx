"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BenefitIcon, HomeIcon, QuizIcon, WalkIcon, WalletIcon } from "./icons";

const TABS = [
  { href: "/", label: "홈", Icon: HomeIcon },
  { href: "/quiz", label: "퀴즈", Icon: QuizIcon },
  { href: "/benefits", label: "혜택", Icon: BenefitIcon },
  { href: "/wallet", label: "지갑", Icon: WalletIcon },
  { href: "/walk", label: "만보기", Icon: WalkIcon, highlight: true },
] as const;

/** 마이비 5탭 셸. 폰 폭(최대 430px) 중앙 정렬. 퀴즈 풀기/보상 화면(/quiz/:id)에서는 탭바 숨김 */
export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const fullscreen = /^\/quiz\/[^/]+/.test(pathname);
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
                    <t.Icon />
                    <span className={`text-[12px] ${active || ("highlight" in t && t.highlight) ? "font-bold" : "font-medium"}`}>{t.label}</span>
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
