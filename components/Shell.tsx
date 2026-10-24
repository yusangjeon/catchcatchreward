"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "홈", icon: "🏠" },
  { href: "/quiz", label: "퀴즈", icon: "❓" },
  { href: "/missions", label: "미션", icon: "🎯" },
  { href: "/my", label: "MY", icon: "👤" },
] as const;

/**
 * 반응형 모바일 셸. 최대 폭 480px 중앙 정렬, 하단 탭 고정.
 * catchreward 의 미션/상점/MY 3탭 구조를 참고하되 절대좌표는 쓰지 않는다.
 */
export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col bg-bg">
      <main className="flex-1 px-4 pb-24 pt-4">{children}</main>
      <nav
        aria-label="주요 메뉴"
        className="fixed bottom-0 left-1/2 z-20 w-full max-w-[480px] -translate-x-1/2 border-t border-line bg-surface/95 backdrop-blur"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <ul className="grid grid-cols-4">
          {TABS.map((t) => {
            const active = t.href === "/" ? pathname === "/" : pathname.startsWith(t.href);
            return (
              <li key={t.href}>
                <Link
                  href={t.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex h-14 flex-col items-center justify-center gap-0.5 text-[11px] ${
                    active ? "font-semibold text-brand" : "text-ink-muted"
                  }`}
                >
                  <span aria-hidden className="text-lg leading-none">
                    {t.icon}
                  </span>
                  {t.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
